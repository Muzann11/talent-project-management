import { Resolver, Query, Mutation, Arg, Int } from "type-graphql";
import { User } from "../entities/User";

@Resolver()
export class UserResolver {
    // mengambil semua data user
    @Query(() => [User])
    async getUsers() {
        return await User.find({ relations: ["profile"] });
    }

    // menambahkan user baru
    @Mutation(() => User)
    async createUser(
        @Arg('email') email: string,
        @Arg('password') password: string
    ) {
        const user = User.create({ email, password });
        await user.save();
        return user;
    }

    // update Password
    @Mutation(() => User)
    async updatePassword(
        @Arg("id", () => Int) id: number,
        @Arg("newPassword") newPassword: string
    ) {
        // cari user berdasarkan ID
        const user = await User.findOneBy({ id });
        if (!user) throw new Error("User tidak ditemukan!");

        // update password baru
        user.password = newPassword;
        return await user.save();
    }

    // delete User (Diubah ke Soft Delete) [cite: 2026-01-18]
    @Mutation(() => User)
    async deleteUser(@Arg("id", () => Int) id: number) {
        const user = await User.findOneBy({ id });
        if (!user) throw new Error("User tidak ditemukan!");

        // menggunakan softRemove agar data tetap ada di DB (dengan deletedAt) [cite: 2026-01-18]
        // sangat penting untuk histori data AI kamu [cite: 2026-01-19]
        return await User.softRemove(user);
    }
}