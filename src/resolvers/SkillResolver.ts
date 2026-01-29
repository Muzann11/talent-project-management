import { Resolver, Query, Mutation, Arg, Int } from "type-graphql";
import { IsNull } from "typeorm";
import { Skill } from "../entities/Skill";
import { Profile } from "../entities/Profile";

@Resolver()
export class SkillResolver {
    @Query(() => [Skill])
    async getSkills() {
        return await Skill.find({ where: { deletedAt: IsNull() } });
    }

    @Mutation(() => Skill)
    async createSkill(@Arg("name") name: string) {
        const skill = Skill.create({ name });
        await skill.save();
        return skill;
    }

    @Mutation(() => Profile)
    async addSkillToProfile(
        @Arg("profileId", () => Int) profileId: number,
        @Arg("skillId", () => Int) skillId: number
    ) {
        const profile = await Profile.findOne({ where: { id: profileId }, relations: ["skills"] });
        const skill = await Skill.findOneBy({ id: skillId });

        if (!profile || !skill) throw new Error("Data tidak ditemukan!");

        const isAlreadyExist = profile.skills.find(s => s.id === skillId);
        if (!isAlreadyExist) {
            profile.skills.push(skill);
            await profile.save();
            
            await Profile.updateAiContext(profileId);
        }

        return profile;
    }

    @Mutation(() => Skill)
    async updateSkill(
        @Arg("id", () => Int) id: number,
        @Arg("name") name: string
    ) {
        const skill = await Skill.findOneBy({ id });
        if (!skill) throw new Error("Skill tidak ditemukan!");

        skill.name = name;
        return await skill.save();
    }

    @Mutation(() => Skill)
    async deleteSkill(@Arg("id", () => Int) id: number) {
        const skill = await Skill.findOneBy({ id });
        if (!skill) throw new Error("Skill tidak ditemukan!");
        return await Skill.softRemove(skill);
    }

    @Mutation(() => Profile)
    async removeSkillFromProfile(
        @Arg("profileId", () => Int) profileId: number,
        @Arg("skillId", () => Int) skillId: number
    ) {
        const profile = await Profile.findOne({ where: { id: profileId }, relations: ["skills"] });

        if (!profile) throw new Error("Profil tidak ditemukan!");
        profile.skills = profile.skills.filter(s => s.id !== skillId);
        
        await profile.save();

        await Profile.updateAiContext(profileId);

        return profile;
    }
}