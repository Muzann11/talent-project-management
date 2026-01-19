import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Skill } from "./Skill";
import { Experience } from "./Experience";
import { Recommendation } from "./Recommendation";
import { TimestampEntity } from "./TimestampEntities";

@ObjectType()
@Entity()
export class Profile extends TimestampEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    fullName: string;

    @Field({ nullable: true })
    @Column({ type: "text", nullable: true })
    bio: string;

    @Field()
    @Column()
    position: string;

    @Field(() => User)
    @OneToOne(() => User, (user) => user.profile) // Mendefinisikan relasi 1-ke-1 ke entitas User
    @JoinColumn() // Dekorator ini menentukan bahwa tabel profile adalah "pemilik" relasi secara fisik di database.
    user: User;

    @Field(() => [Skill], { nullable: true })
    @ManyToMany(() => Skill, (skills) => skills.profiles)
    @JoinTable()
    skills: Skill[];

    @Field(() => [Experience], { nullable: true })
    @OneToMany(() => Experience, (experience) => experience.profile)
    experiences: Experience[];

    @Field(() => [Recommendation], { nullable: true })
    @OneToMany(() => Recommendation, (rec) => rec.profile)
    recommendations: Recommendation[];
}

/*
@JoinColumn() (Siapa Pemilik Kunci?):
- Di dalam profile.ts, diletakkan @JoinColumn() pada properti user.
- Fungsi: Dekorator ini menentukan bahwa tabel profile adalah "pemilik" relasi secara fisik di database.
- Dampak di PostgreSQL: TypeORM akan menciptakan kolom nyata bernama userId di dalam tabel profile.
- Kenapa tidak di User?: Kolom kunci (Foreign Key) hanya boleh ada di salah satu tabel. 
  Karena @JoinColumn() ada di Profile, maka tabel user tetap bersih tanpa kolom tambahan, sementara tabel profile menyimpan referensi ID user-nya.

*/