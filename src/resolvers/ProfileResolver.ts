import { Resolver, Query, Mutation, Arg, Int} from "type-graphql";
import { Profile } from "../entities/Profile";
import { User } from "../entities/User";
import { Skill } from "../entities/Skill";

@Resolver()
export class ProfileResolver {
    @Query(() => [Profile])
    async getProfiles() {
        return await Profile.find({ 
            relations: ["user", "skills", "experiences", "recommendations"] });
    }

    @Mutation(() => Profile)
    async createProfile(
        @Arg("fullName") fullName: string,
        @Arg("bio") bio: string,
        @Arg("position") position: string,
        @Arg("userId", () => Int) userId: number
    ) {
        const user = await User.findOneBy({ id: userId });
        if (!user) throw new Error("User tidak ditemukan!");

        const profile = Profile.create({ 
            fullName, 
            bio, 
            position, 
            user 
        });

        await profile.save();
        return profile;
    }

    @Mutation(() => Profile)
    async updateProfile(
        @Arg("id", () => Int) id: number,
        @Arg("fullName", { nullable: true }) fullName?: string,
        @Arg("bio", { nullable: true}) bio?: string,
        @Arg("position", { nullable: true}) position?: string
    ){
        const profile = await Profile.findOneBy({ id });

        if (!profile) throw new Error("Profil tidak ditemukan!");
        if (fullName) profile.fullName = fullName;
        if (bio) profile.bio = bio;
        if (position) profile.position = position;

        return await profile.save()
    }

    @Mutation(() => Profile)
    async deleteProfile(@Arg("id", () => Int) id: number) {
        const profile = await Profile.findOneBy({ id });
        if (!profile) throw new Error("Profil tidak ditemukan!");
    
        return await Profile.softRemove(profile);
    }
        
}

