import { Resolver, Query, Mutation, Arg, Int } from "type-graphql";
import { Recommendation } from "../entities/Recommendation";
import { Profile } from "../entities/Profile";
import { Project } from "../entities/Project";
import { RecommendationStatus } from "../enums";

@Resolver()
export class RecommendationResolver {
    @Query(() => [Recommendation])
    async getRecommendations() {
        return await Recommendation.find({ 
            relations: ["profile", "project", "profile.skills"] 
        });
    }

    @Mutation(() => Recommendation)
    async createRecommendation(
        @Arg("profileId", () => Int) profileId: number,
        @Arg("projectId", () => Int) projectId: number,
        @Arg("score", () => Int) score: number,
        @Arg("content") content: string,
        @Arg("matchedSkills", () => [String]) matchedSkills: string[],
        @Arg("reason", { nullable: true }) reason: string,
        @Arg("status", () => RecommendationStatus, { defaultValue: RecommendationStatus.PENDING }) status: RecommendationStatus
    ) {
        const profile = await Profile.findOneBy({ id: profileId });
        const project = await Project.findOneBy({ id: projectId });

        if (!profile || !project) throw new Error("Profil atau Proyek tidak ditemukan!");

        const rec = Recommendation.create({
            profile,
            project,
            score,
            content,
            matchedSkills,
            reason,
            status
        });

        await rec.save();
        return rec;
    }

    @Mutation(() => Recommendation)
    async updateRecommendation(
        @Arg("id", () => Int) id: number,
        @Arg("score", () => Int, { nullable: true }) score?: number,
        @Arg("content", { nullable: true }) content?: string,
        @Arg("status", () => RecommendationStatus, { nullable: true }) status?: RecommendationStatus,
        @Arg("matchedSkills", () => [String], { nullable: true }) matchedSkills?: string[],
        @Arg("reason", { nullable: true }) reason?: string
    ) {
        const rec = await Recommendation.findOneBy({ id });
        if (!rec) throw new Error("Rekomendasi tidak ditemukan!");

        if (score !== undefined) rec.score = score;
        if (content) rec.content = content;
        if (status) rec.status = status;
        if (matchedSkills) rec.matchedSkills = matchedSkills;
        if (reason) rec.reason = reason;

        return await rec.save();
    }

    @Mutation(() => Recommendation)
    async deleteRecommendation(@Arg("id", () => Int) id: number) {
        const rec = await Recommendation.findOneBy({ id });
        if (!rec) throw new Error("Rekomendasi tidak ditemukan!");

        return await Recommendation.softRemove(rec);
    }
}