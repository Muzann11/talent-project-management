import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ObjectType, Field, Int, ID } from "type-graphql";
import { TimestampEntity } from "./TimestampEntities";
import { Profile } from "./Profile";
import { Project } from "./Project";
import { RecommendationStatus } from "../enums"; // Import Enum baru

@ObjectType()
@Entity()
export class Recommendation extends TimestampEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ type: "text" })
    content: string;

    @Field(() => Int)
    @Column()
    score: number; // skor kecocokan dengan project 1-100

    @Field(() => RecommendationStatus)
    @Column({
        type: "enum",
        enum: RecommendationStatus,
        default: RecommendationStatus.PENDING 
    })
    status: RecommendationStatus;

    @Field(() => [String], { nullable: true })
    @Column("simple-array", { nullable: true })
    matchedSkills: string[]; // skill yang cocok antara talenta & proyek

    @Field({ nullable: true })
    @Column({ type: "text", nullable: true })
    reason: string;

    // Relasi
    @Field(() => Profile)
    @ManyToOne(() => Profile, (profile) => profile.recommendations)
    profile: Profile;

    @Field(() => Project)
    @ManyToOne(() => Project, (project) => project.recommendations)
    project: Project;
}