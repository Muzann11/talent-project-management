import { Resolver, Query, Mutation, Arg, Int } from "type-graphql";
import { IsNull } from "typeorm";
import { Profile } from "../entities/Profile";
import { User } from "../entities/User";

@Resolver()
export class ProfileResolver {
    @Mutation(() => Boolean)
    async syncAllAiContext() {
        // Hanya sinkronisasi profil yang belum dihapus
        const profiles = await Profile.find({ where: { deletedAt: IsNull() } });
        for (const profile of profiles) {
            await Profile.updateAiContext(profile.id);
        }
        return true;
    }

    @Query(() => [Profile])
    async getProfiles() {
        try {
            return await Profile.find({ 
                where: { deletedAt: IsNull() }, // Memastikan profil yang sudah dihapus tidak ditarik
                relations: ["user", "skills"] 
            });
        } catch (err) {
            console.error("Error getProfiles:", err);
            throw new Error("Gagal mengambil data profil aktif");
        }
    }

    @Mutation(() => Profile)
    async createProfile(
        @Arg("fullName") fullName: string,
        @Arg("bio") bio: string,
        @Arg("position") position: string,
        @Arg("userId", () => Int) userId: number
    ) {
        const user = await User.findOneBy({ id: userId, deletedAt: IsNull() });
        if (!user) throw new Error("User tidak ditemukan atau sudah tidak aktif!");

        const profile = Profile.create({ 
            fullName, 
            bio, 
            position, 
            user 
        });

        await profile.save();
        
        await Profile.updateAiContext(profile.id);

        // PERBAIKAN: Ambil ulang profil dengan relasi user agar frontend langsung menerima data lengkap
        const freshProfile = await Profile.findOne({
            where: { id: profile.id },
            relations: ["user"]
        });

        return freshProfile!;
    }

    @Mutation(() => Profile)
    async updateProfile(
        @Arg("id", () => Int) id: number,
        @Arg("fullName", { nullable: true }) fullName?: string,
        @Arg("bio", { nullable: true }) bio?: string,
        @Arg("position", { nullable: true }) position?: string
    ) {
        // PERBAIKAN: Pastikan tidak mengupdate profil yang sudah dihapus
        const profile = await Profile.findOneBy({ id, deletedAt: IsNull() });

        if (!profile) throw new Error("Profil tidak ditemukan atau sudah dihapus!");
        
        if (fullName) profile.fullName = fullName;
        if (bio) profile.bio = bio;
        if (position) profile.position = position;

        await profile.save();
        await Profile.updateAiContext(profile.id);

        return profile;
    }

    @Mutation(() => Profile)
    async deleteProfile(@Arg("id", () => Int) id: number) {
        const profile = await Profile.findOneBy({ id });
        if (!profile) throw new Error("Profil tidak ditemukan!");
        
        // Soft delete akan otomatis mengisi kolom deletedAt
        return await Profile.softRemove(profile);
    }
}