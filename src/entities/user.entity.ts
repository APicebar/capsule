import { Entity, Property } from "@mikro-orm/libsql";
import { BaseEntity } from "./base.entity.js";

@Entity()
export class User extends BaseEntity {
    // Nickname of the user.
    @Property()
    nickname: string;

    // User's username, used for login.
    @Property({ unique: true })
    username: string;
    
    // Password. Should be encrypted/hashed.
    @Property()
    password: string;

    // Last login time of the user.
    @Property({ onUpdate: () => { new Date() } })
    last_login_at = new Date();

    // State of this account. 1 for normal, 0 for warned, -1 for banned.
    @Property()
    state: number;

    constructor(nickname: string, username: string, password: string, state: number) {
        super();
        this.nickname = nickname;
        this.username = username;
        this.password = password;
        this.state = state;
    }
}