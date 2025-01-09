import { createBunServeHandler } from "trpc-bun-adapter";
import { t } from "./trpc";
import { channelsRouter } from "./routers/channels";
import { usersRouter } from "./routers/users";
import { createContext } from "./context";

export const router = t.router({
  channels: channelsRouter,
  users: usersRouter,
});

export type AppRouter = typeof router;

Bun.serve(
  createBunServeHandler(
    {
      createContext,
      endpoint: "/trpc",
      responseMeta() {
        return {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
          },
        };
      },
      router,
    },
    {
      port: 3333,
      fetch(req) {
        return new Response("Not found", { status: 404 });
      },
    }
  )
);
