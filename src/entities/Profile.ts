import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Skill } from "./Skill";
import { Experience } from "./Experience";
import { Recommendation } from "./Recommendation";
import { TimestampEntity } from "./TimestampEntities";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    @Field({ nullable: true })
    @Column({ type: "text", nullable: true })
    aiContext: string;

    @Field(() => [Number], { nullable: true })
    @Column({ type: "float", array: true, nullable: true })
    embeddingVector: number[];

    @Field(() => User, { nullable: true })
    @OneToOne(() => User, (user) => user.profile)
    @JoinColumn()
    user: User;

    @Field(() => [Skill], { nullable: true })
    @ManyToMany(() => Skill, (skills) => skills.profiles, { cascade: true, onDelete: "CASCADE" })
    @JoinTable()
    skills: Skill[];

    @Field(() => [Experience], { nullable: true })
    @OneToMany(() => Experience, (experience) => experience.profile, { cascade: true, onDelete: "CASCADE" })
    experiences: Experience[];

    @Field(() => [Recommendation], { nullable: true })
    @OneToMany(() => Recommendation, (rec) => rec.profile, { cascade: true, onDelete: "CASCADE" })
    recommendations: Recommendation[];

    static async updateAiContext(profileId: number) {
      const profile = await this.findOne({
          where: { id: profileId },
          relations: ["skills", "experiences"]
      });
      if (!profile) return;

      const skillList = profile.skills?.map(s => s.name).join(", ") || "Tidak ada data skill";
      const expList = profile.experiences?.map(e => `${e.title}: ${e.description}`).join(". ");
      
      profile.aiContext = `Nama: ${profile.fullName}. Posisi: ${profile.position}. Keahlian: ${skillList}. Pengalaman: ${expList}.`;
      await profile.save();

      await this.generateEmbedding(profileId);
    }

    static async generateEmbedding(profileId: number) {
      const profile = await this.findOneBy({ id: profileId });
      if (!profile || !profile.aiContext) return;

      // Inisialisasi Google AI
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

      // PERBAIKAN: Secara eksplisit menggunakan apiVersion: "v1"
      const model = genAI.getGenerativeModel(
        { model: "text-embedding-004" },
        { apiVersion: "v1" }
      );

      try {
        // Proses mengubah teks menjadi vektor
        const result = await model.embedContent(profile.aiContext);
        const embedding = result.embedding;

        // Simpan ke kolom embeddingVector
        profile.embeddingVector = embedding.values;
        await profile.save();
        console.log(`Embedding sukses untuk: ${profile.fullName}`);
      } catch (error) {
        console.error("Error saat generate embedding:", error);
      }
    }
}