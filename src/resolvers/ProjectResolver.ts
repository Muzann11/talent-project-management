import "dotenv/config";
import { Resolver, Query, Mutation, Arg, Int } from "type-graphql";
import { IsNull } from "typeorm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppDataSource } from "../database/data-source";
import { Project } from "../entities/Project";
import { Profile } from "../entities/Profile";
import { Recommendation } from "../entities/Recommendation";
import { ProjectStatus } from "../enums";

@Resolver()
export class ProjectResolver {
    // 1. Mengambil semua proyek aktif
    @Query(() => [Project])
    async getProjects() {
        return await Project.find({ 
            // Pastikan kita juga memfilter proyek yang mungkin sudah di-soft-delete
            where: { deletedAt: IsNull() },
            relations: ["recommendations", "recommendations.profile"] 
        });
    }

    @Mutation(() => Project)
    async createProject(
        @Arg("title") title: string,
        @Arg("description") description: string,
        @Arg("status", () => ProjectStatus, { defaultValue: ProjectStatus.OPEN }) status: ProjectStatus
    ) {
        const project = Project.create({ title, description, status });
        await project.save();
        return project;
    }

    @Mutation(() => Project)
    async updateProject(
        @Arg("id", () => Int) id: number,
        @Arg("title", { nullable: true }) title?: string,
        @Arg("description", { nullable: true }) description?: string,
        @Arg("status", () => ProjectStatus, { nullable: true }) status?: ProjectStatus
    ) {
        const projectRepo = AppDataSource.getRepository(Project);
        const project = await projectRepo.findOneBy({ id, deletedAt: IsNull() });
        
        if (!project) throw new Error("Proyek tidak ditemukan atau sudah dihapus!");

        // Update fields jika data dikirimkan
        if (title !== undefined) project.title = title;
        if (description !== undefined) project.description = description;
        if (status !== undefined) project.status = status;

        return await projectRepo.save(project);
    }

    @Mutation(() => Project)
    async deleteProject(@Arg("id", () => Int) id: number) {
        const project = await Project.findOneBy({ id });
        if (!project) throw new Error("Proyek tidak ditemukan!");

        // Menggunakan softRemove agar data proyek tetap ada untuk history AI
        return await Project.softRemove(project);
    }

    // PERBAIKAN: AI Matching hanya untuk talenta aktif
    @Mutation(() => [Recommendation])
    async generateRecommendations(@Arg("projectId", () => Int) projectId: number) {
        const project = await Project.findOneBy({ id: projectId, deletedAt: IsNull() });
        if (!project) throw new Error("Proyek tidak ditemukan!");

        // PERBAIKAN: Hanya ambil profil yang BELUM dihapus untuk dianalisis AI
        const allProfiles = await Profile.find({
            where: { deletedAt: IsNull() }
        });

        if (allProfiles.length === 0) throw new Error("Tidak ada talenta aktif untuk dijodohkan.");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

    const prompt = `
        Tugas: Pilihkan kandidat terbaik dari daftar berikut untuk proyek ini.
        PROYEK: ${project.title} - ${project.description}
        DAFTAR TALENTA:
        ${allProfiles.map(p => `ID: ${p.id}, Nama: ${p.fullName}, Konteks: ${p.aiContext}`).join("\n")}

        Tugas Anda:
        1. Analisis semua talenta dan pilih maksimal 5 yang paling cocok.
        2. Berikan skor (0-100), alasan singkat, dan matchedSkills.
        3. Output HARUS berupa JSON Array.

        Format JSON:
        [
          {
            "profileId": number,
            "score": number,
            "reason": "string",
            "matchedSkills": ["skill1", "skill2"]
          }
        ]
    `;

        try {
            const aiResponse = await model.generateContent(prompt);
            const results = JSON.parse(aiResponse.response.text());

            const recommendations: Recommendation[] = [];
            for (const res of results) {
                const profile = allProfiles.find(p => p.id === res.profileId);
                if (!profile) continue;

                const rec = Recommendation.create({
                    project,
                    profile,
                    score: res.score,
                    reason: res.reason,
                    matchedSkills: res.matchedSkills,
                    content: `Rekomendasi otomatis untuk ${profile.fullName}`
                });
                await rec.save();
                recommendations.push(rec);
            }

            return recommendations;
        } catch (error) {
            console.error("AI Error:", error);
            throw new Error("Gagal menghasilkan rekomendasi AI. Cek koneksi API Gemini.");
        }
    }
}