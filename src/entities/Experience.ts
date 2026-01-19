import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Profile } from "./Profile";
import { TimestampEntity } from "./TimestampEntities";

@ObjectType()
@Entity()
export class Experience extends TimestampEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    company: string;

    @Field()
    @Column()
    title: string;

    @Field({ nullable: true })
    @Column({ type: "text", nullable: true })
    description: string;

    @Field()
    @Column()
    startDate: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    endDate: string;

    @Field(() => Profile)
    @ManyToOne(() => Profile, (profile) => profile.experiences)
    profile: Profile;
}