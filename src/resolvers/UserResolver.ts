import { Resolver, Query, Mutation, Arg, Int } from "type-graphql";
import { IsNull } from "typeorm";
import { User } from "../entities/User";
import { Profile } from "../entities/Profile";
import { Experience } from "../entities/Experience";

@Resolver()
export class UserResolver {
    // Mengambil semua data user yang belum dihapus
    @Query(() => [User])
    async getUsers() {
        return await User.find({ 
            where: { deletedAt: IsNull() }, 
            relations: ["profile"] 
        });
    }

    @Mutation(() => User)
    async createUser(
        @Arg('email') email: string,
        @Arg('password') password: string
    ) {
        const user = User.create({ email, password });
        await user.save();
        return user;
    }

    @Mutation(() => User)
    async updatePassword(
        @Arg("id", () => Int) id: number,
        @Arg("newPassword") newPassword: string
    ) {
        const user = await User.findOneBy({ id, deletedAt: IsNull() });
        if (!user) throw new Error("User tidak ditemukan!");

        user.password = newPassword;
        return await user.save();
    }

    // PERBAIKAN: Proses Soft Delete Berantai yang lebih solid
    @Mutation(() => User)
    async deleteUser(@Arg("id", () => Int) id: number) {
        // 1. Cari user beserta profilnya secara eksplisit
        const user = await User.findOne({
            where: { id },
            relations: ["profile"]
        });

        if (!user) throw new Error("User tidak ditemukan!");

        // 2. Jika user memiliki profile, bersihkan semua data terkait profil tersebut
        if (user.profile) {
            const profileId = user.profile.id;

            // Soft delete semua pengalaman kerja agar tidak membingungkan AI
            const experiences = await Experience.find({ 
                where: { profile: { id: profileId } } 
            });
            
            if (experiences.length > 0) {
                await Experience.softRemove(experiences);
            }

            // Soft delete profil talenta
            await Profile.softRemove(user.profile);
            
            // Opsional: Kamu bisa mematikan AI Context untuk profil ini agar tidak diproses lagi
            // await Profile.updateAiContext(profileId); 
        }

        // 3. Terakhir, soft delete akun user itu sendiri
        // Data tetap ada di DB dengan kolom deletedAt terisi, aman untuk audit AI
        return await User.softRemove(user);
    }
}