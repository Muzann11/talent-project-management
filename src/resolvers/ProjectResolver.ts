import { Resolver, Query, Mutation, Arg, Int } from "type-graphql";
import { Project } from "../entities/Project";
import { ProjectStatus } from "../enums";

@Resolver()
export class ProjectResolver {
    // 1. Query untuk mendapatkan semua proyek
    @Query(() => [Project])
    async getProjects() {
        // Memastikan relasi recommendations ikut terbawa agar bisa dilihat di Playground
        return await Project.find({ 
            relations: ["recommendations", "recommendations.profile"] 
        });
    }

    // 2. Mutation untuk membuat proyek baru
    @Mutation(() => Project)
    async createProject(
        @Arg("title") title: string,
        @Arg("description") description: string,
        // Argumen status menggunakan tipe Enum ProjectStatus
        @Arg("status", () => ProjectStatus, { defaultValue: ProjectStatus.OPEN }) status: ProjectStatus
    ) {
        const project = Project.create({ 
            title, 
            description, 
            status 
        });
        
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
        // cari proyek berdasarkan ID
        const project = await Project.findOneBy({ id });
        if (!project) throw new Error("Proyek tidak ditemukan!");

        // update hanya field yang dikirimkan (Partial Update)
        if (title) project.title = title;
        if (description) project.description = description;
        if (status) project.status = status;

        // simpan perubahan ke database
        return await project.save();
    }

    @Mutation(() => Project)
    async deleteProject(@Arg("id", () => Int) id: number) {
        const project = await Project.findOneBy({ id });
        if (!project) throw new Error("Proyek tidak ditemukan!");

        return await Project.softRemove(project);
    }
}