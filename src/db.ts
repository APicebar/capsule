import { MikroORM, Options, EntityManager, EntityRepository } from '@mikro-orm/libsql';
import config from './config/mikro-orm.config.js';
import { User } from './entities/user.entity.js';
import { Capsule } from './entities/capsule.entity.js';
import { Session } from './entities/session.entity.js';

export interface Services {
    orm: MikroORM;
    em: EntityManager;
    user: EntityRepository<User>;
    capsule: EntityRepository<Capsule>;
    session: EntityRepository<Session>;
}

let cache: Services;

export async function initORM(options?: Options): Promise<Services> {
    if (cache) {
        return cache;
    }

    // allow overriding config options for testing
    const orm = await MikroORM.init({
        ...config,
        ...options,
    });

    await orm.schema.refreshDatabase();

    // save to cache before returning
    return cache = {
        orm,
        em: orm.em.fork(),
        user: orm.em.getRepository(User),
        capsule: orm.em.getRepository(Capsule),
        session: orm.em.getRepository(Session),
    };
}