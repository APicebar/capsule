import { Elysia } from "elysia";
import { routes } from "./controllers/index.js";
import { initORM } from "./db.js";
import { rateLimit } from "elysia-rate-limit";
import rateLimitConfig from "./config/rate-limit.config.js"

export const db = await initORM();

const app = new Elysia()
    .use(routes)
    .use(rateLimit(rateLimitConfig))
    .listen(3000);

console.log(
    `💊 Flashing Capsule is running at ${app.server?.hostname}:${app.server?.port}`
);
