import { Resolver, Query, Mutation, Arg , Int} from "type-graphql";
import { Experience } from "../entities/Experience";
import { Profile } from "../entities/Profile";

@Resolver()
export class ExperienceResolver {
    @Query(() => [Experience])
    async getExperiences() {
        return await Experience.find({ relations: ["profile"]});
    }

    @Mutation(() => Experience)
    async createExperience(
        @Arg("company") company: string,
        @Arg("title") title: string,
        @Arg("startDate") startDate: string,
        @Arg("profileId", () => Int) profileId: number,
        @Arg("description", { nullable: true }) description: string,
        @Arg("endDate", { nullable: true }) endDate: string 
    ) {
        const profile = await Profile.findOneBy({ id: profileId });
        if (!profile) throw new Error("Profil tidak ditemukan!");

        const exp = Experience.create({ 
            company, 
            title, 
            startDate, 
            description,
            endDate,
            profile 
        });
        
        await exp.save();
        return exp;
    }

    @Mutation(() => Experience)
    async updateExperience(
        @Arg("id", () => Int) id: number,
        @Arg("company", { nullable: true }) company?: string,
        @Arg("title", { nullable: true }) title?: string,
        @Arg("startDate", { nullable: true }) startDate?: string,
        @Arg("endDate", { nullable: true }) endDate?: string,
        @Arg("description", { nullable: true }) description?: string
    ) {
        const exp = await Experience.findOneBy({ id });
        if (!exp) throw new Error("Pengalaman tidak ditemukan!");

        if (company) exp.company = company;
        if (title) exp.title = title;
        if (startDate) exp.startDate = startDate;
        if (endDate) exp.endDate = endDate;
        if (description) exp.description = description;

        return await exp.save();
    }
    @Mutation(() => Experience)
    async deleteExperience(@Arg("id", () => Int) id: number) {
        // cari data berdasarkan ID
        const exp = await Experience.findOneBy({ id });
        if (!exp) throw new Error("Pengalaman tidak ditemukan!");

        // gunakan softRemove agar data tetap ada di DB (dengan isi deletedAt)
        return await Experience.softRemove(exp);
    }
}