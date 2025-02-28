import { Elysia, t } from 'elysia';
import { db } from '../index.js';
import { Session } from '../entities/session.entity.js';
import { Capsule } from '../entities/capsule.entity.js';
import { raw } from '@mikro-orm/libsql';

export const capsule = new Elysia({ prefix: '/capsule' })
    .post('/post', async ({ body: { session_token, content, is_private }, set }) => {
        try {
            const session = await db.em.findOneOrFail(Session, { session_token: session_token });
            
            const capsule = new Capsule(content, session.owner_id, (is_private ? is_private : false));
            db.em.create(Capsule, capsule);
            await db.em.flush();

            return { message: 'post success.' }

        } catch (e: any) {
            set.status = 400;
            return { message: `error occured: ${ e.message }` }
        }
    }, {
        body: t.Object({
            session_token: t.String(),
            content: t.String(),
            is_private: t.Optional(t.Boolean())
        })
    })
    .get('/:id?', async ({ params: { id }, set }) => {
        // ⚠ Need further test.
        try {
            let capsule;
            if (id) capsule = await db.em.findOneOrFail(Capsule, { id: id });
            else capsule = await db.em.createQueryBuilder(Capsule)
                .select('*')
                .where({ is_deleted: false, is_private: false })
                .orderBy(raw(`RANDOM()`)) // 使用数据库的随机函数
                .limit(1)
                .getSingleResult();
        
            return capsule;
        } catch (e: any) {
            set.status = 400;
            return { message: `error occured: ${ e.message }` }
        }

    }, {
        params: t.Object({
            id: t.Optional(t.Number())
        })
    })
    .delete('/:id?', () => {
        // TODO
    })