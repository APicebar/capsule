import { Elysia } from 'elysia';
import { auth } from './01-auth.js';
import { capsule } from './02-capsule.js';

export const routes = new Elysia({ prefix: '/api' })
    .use(auth)
    .use(capsule);
