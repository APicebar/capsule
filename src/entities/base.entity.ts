import { PrimaryKey, Property } from '@mikro-orm/libsql';

export abstract class BaseEntity {
    @PrimaryKey({ autoincrement: true })
    id!: number;

    @Property()
    created_at: Date = new Date();
}