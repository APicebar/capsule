import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Session {
    @PrimaryKey()
    session_token: string;

    @Property()
    owner_id: number;

    @Property({ onUpdate: () => new Date() })
    last_active_at = new Date();

    // use day as unit.
    @Property()
    active_duration = 7;

    constructor(session_token: string, owner_id: number) {
        this.session_token = session_token;
        this.owner_id = owner_id;
    }
}