import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Profile } from "../entities/Profile";
import { Skill } from "../entities/Skill";
import { Project } from "../entities/Project";
import { Recommendation } from "../entities/Recommendation";
import { Experience } from "../entities/Experience";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"), 
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [User, Profile, Skill, Recommendation, Project, Experience],
});