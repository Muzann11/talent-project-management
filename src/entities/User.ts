import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Profile } from "./Profile";
import { TimestampEntity } from "./TimestampEntities";

@ObjectType() // Memberitahu GraphQL bahwa kelas ini adalah sebuah objek yang bisa dipanggil di GraphQL Playground.
@Entity()     // Memberitahu TypeORM untuk membuatkan tabel bernama "user" di PostgreSQL kamu.
export class User extends TimestampEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Field(() => Profile, { nullable: true })
    @OneToOne(() => Profile, (profile) => profile.user)
    profile: Profile;
}

/*
Fields:
- Hanya properti yang memiliki @Field() yang bisa dilihat hasilnya saat melakukan query di browser http://localhost:4000/graphql.
- Itulah alasan kenapa id dan email punya @Field(), sedangkan password sengaja dikosongkan.

tabel:
- id: Menggunakan @PrimaryGeneratedColumn(), artinya sistem akan otomatis memberikan nomor urut (1, 2, 3...) sebagai kunci unik untuk tiap user.
- email: Menggunakan @Column({ unique: true }), sehingga database akan menolak jika ada dua orang mendaftar dengan email yang sama.
- password: Hanya menggunakan @Column(). Karena tidak ada @Field(), maka password ini akan disimpan di database tapi tidak akan pernah muncul di hasil pencarian GraphQL (aman dari sisi privasi).
*/