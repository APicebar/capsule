import { Elysia, t } from 'elysia';
import { db } from '../index.js';
import { User } from '../entities/user.entity.js';
import { randomBytes } from 'crypto';
import { Session } from '../entities/session.entity.js';

// TODO: HTTP status code standardization.
// TODO: Error process refactor.

export const auth = new Elysia({ prefix: '/auth' })
    .post('/register', async ({ body: { username, nickname, password }, set }) => {
        // Register a user.
        try {
            const user = new User(
                nickname, 
                username,
                await Bun.password.hash(password),
                1
            );
            db.em.create(User, user);
            await db.em.flush();

            return { message: "registered successfully." };

        } catch (e: any) {
            set.status = 400;
            return { message: `error occured: ${ e.message }` }
        }
    }, {
        body: t.Object({
            username: t.String(),
            nickname: t.String(),
            password: t.String(),
        })
    })
    .post('/login', async ({ body: { username, password }, cookie: { session_token }, set }) => {
        try {
            const user = await db.em.findOneOrFail(User, { username: username });

            if (!await Bun.password.verify(password, user.password)) throw Error('password not match.');
            if (user.state === -1) throw Error('user has been banned.');

            const token = randomBytes(32).toString('hex');
            const session = new Session(token, user.id);
            db.em.create(Session, session);
            await db.em.flush();

            session_token.value = token;

            return { message: "logged in." };

        } catch (e: any) {
            set.status = 403;
            return { message: `error occured: ${ e.message }` }
        }
    }, {
        body: t.Object({
            username: t.String(),
            password: t.String(),
        })
    })
    .post('/logout', async ({ body: { logout_all }, cookie: { session_token }, set }) => {
        try {
            const session = await db.em.findOneOrFail(Session, {session_token: session_token.value});

            if (logout_all) db.em.removeAndFlush(
                await db.em.find(Session, {owner_id: session.owner_id})
            );
            else db.em.removeAndFlush(session);

            session_token.remove();

            return { message: 'logged out successfully.' }

        } catch (e: any) {
            set.status = 400
            return { message: `error occured: ${ e.message }` }
        }
    }, {
        body: t.Object({
            logout_all: t.Optional(t.Boolean())
        }),
        cookie: t.Cookie({
            session_token: t.String()
        })
    })