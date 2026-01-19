import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { AppDataSource } from "./database/data-source";
import { UserResolver } from "./resolvers/UserResolver";
import { RecommendationResolver } from "./resolvers/RecommendationResolver";
import { ProjectResolver } from "./resolvers/ProjectResolver";
import { ProfileResolver } from "./resolvers/ProfileResolver";
import { SkillResolver } from "./resolvers/SkillResolver";
import { ExperienceResolver } from "./resolvers/ExperienceResolver";

async function main() {
    await AppDataSource.initialize();
    console.log("Database Connected!");

    const schema = await buildSchema({
        resolvers: [
            UserResolver, 
            ProfileResolver, 
            SkillResolver, 
            ExperienceResolver, 
            ProjectResolver, 
            RecommendationResolver
        ],
        validate: false,
    });

    const apolloServer = new ApolloServer({ schema });
    const app = express();

    await apolloServer.start();
    apolloServer.applyMiddleware({ app: app as any });

    app.listen(4000, () => {
        console.log("Server ready at http://localhost:4000/graphql");
    });
}

main().catch(err => console.error(err));