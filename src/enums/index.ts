import { registerEnumType } from "type-graphql";

// Enum untuk Status Proyek
export enum ProjectStatus {
    OPEN = "open",
    ONGOING = "ongoing",
    COMPLETED = "completed",
    CLOSED = "closed"
}

// Enum untuk Status Rekomendasi
export enum RecommendationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected"
}

    registerEnumType(ProjectStatus, {
        name: "ProjectStatus", 
        description: "Status ketersediaan proyek",
    });

    registerEnumType(RecommendationStatus, {
        name: "RecommendationStatus",
        description: "Status keputusan rekomendasi talenta",
    });