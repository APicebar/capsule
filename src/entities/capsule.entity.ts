import { Entity, Property } from "@mikro-orm/libsql";
import { BaseEntity } from "./base.entity.js";

@Entity()
export class Capsule extends BaseEntity {
    // Content of this capsule.
    @Property({ type: 'text' })
    content!: string;

    // Owner uid of this capsule.
    @Property()
    owner_id!: number;

    // Availablity of this capsule.
    @Property({ type: 'boolean' })
    is_private = false;

    // Vote score of this capsule. +1 for every upvote, and -1 for every downvote.
    @Property()
    vote_score = 0;

    // Delete status of capsule.
    @Property()
    is_deleted = false;

    constructor(
        content: string,
        owner_id: number,
        is_private?: boolean,
        vote_score?: number
    ) {
        super();
        this.content = content;
        this.owner_id = owner_id;
        if (is_private !== undefined) this.is_private = is_private;
        if (vote_score !== undefined) this.vote_score = vote_score;
    }
}