import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Recommendation } from "./Recommendation";
import { TimestampEntity } from "./TimestampEntities";
import { ProjectStatus } from "../enums";

@ObjectType()
@Entity()
export class Project extends TimestampEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    title: string;

    @Field()
    @Column({ type: "text" })
    description: string;

    @Field(() => [Recommendation], { nullable: true })
    @OneToMany(() => Recommendation, (rec) => rec.project)
    recommendations: Recommendation[];

    @Field(() => ProjectStatus) // ini adalah Enum
    @Column({
        type: "enum",
        enum: ProjectStatus,
        default: ProjectStatus.OPEN 
    })
    status: ProjectStatus;
}