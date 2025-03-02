import { Elysia, t } from 'elysia';
import { db } from '../index.js';
import { Session } from '../entities/session.entity.js';
import { Capsule } from '../entities/capsule.entity.js';
import { raw, sql, wrap } from '@mikro-orm/libsql';

// TODO: HTTP status code standardization.
// TODO: Error process refactor.

export const capsule = new Elysia({ prefix: '/capsule' })
    .post('/post', async ({ body: { content, is_private }, cookie: { session_token }, set }) => {
        try {
            const session = await db.em.findOneOrFail(Session, { session_token: session_token.value });
            
            const capsule = new Capsule(content, session.owner_id, (is_private ? is_private : false));
            const result = db.em.create(Capsule, capsule);
            await db.em.flush();

            return { id: result.id }

        } catch (e: any) {
            set.status = 400;
            return { message: `error occured: ${ e.message }` }
        }
    }, {
        body: t.Object({
            content: t.String(),
            is_private: t.Optional(t.Boolean())
        }),
        cookie: t.Object({
            session_token: t.String()
        })
    })
    .get('/:id?', async ({ params: { id }, set }) => {
        // ⚠ Need further test.
        try {
            let capsule; // Tricky
            if (typeof id === 'number') capsule = await db.em.findOneOrFail(Capsule, { id: id });
            else capsule = await db.em.findOneOrFail(Capsule, {
                is_deleted: false, 
                is_private: false
            }, {
                last: 1,
                orderBy: { [sql`random()`]: '' } // Tricky
            })
            capsule = wrap(capsule).toObject();

            const { content, created_at } = capsule;
            
            return { content, created_at };

        } catch (e: any) {
            // 我要先在这里摆个烂 -.-
            set.status = 400;
            return { message: `error occured: ${ e.message }` }
        }

    }, {
        params: t.Object({
            id: t.Optional(t.Number())
        })
    })
    .delete('/:id', async ({ params: { id }, cookie: { session_token }, set }) => {
        try {
            const session = await db.em.findOneOrFail(Session, { session_token: session_token.value });

            const capsule = await db.em.findOneOrFail(Capsule, { id: id });
            if (session.owner_id === capsule.owner_id) capsule.is_deleted = true;
            else throw Error('403');

            return { message: 'delete success.' }

        } catch (e: any) {
            if ( !Number.isNaN(Number(e.message)) ) set.status = Number(e.message);
            if ( e.message === '403' ) return { message: 'access denied.' }

            // default behavior
            set.status = 500;
            return { message: `error occured: ${ e.message }` }
        }
    }, {
        params: t.Object({
            id: t.Number(),
        }),
        cookie: t.Cookie({
            session_token: t.String()
        })
    })