import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Profile } from "./Profile";
import { TimestampEntity } from "./TimestampEntities";

@ObjectType()
@Entity()
export class Skill extends TimestampEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ unique: true })
    name: string;

    @Field(() => [Profile], { nullable: true })
    @ManyToMany(() => Profile, profile => profile.skills)
    profiles: Profile[];
}