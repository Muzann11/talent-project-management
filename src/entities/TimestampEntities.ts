import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BaseEntity } from "typeorm";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export abstract class TimestampEntity extends BaseEntity {
    @Field()
    @CreateDateColumn()
    createdAt: Date; // kapan data pertama kali dibuat

    @Field()
    @UpdateDateColumn()
    updatedAt: Date; // kapan data terakhir diubah

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date; // kapan data "dihapus" (Soft Delete)
}