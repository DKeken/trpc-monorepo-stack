import { createBunServeHandler } from "trpc-bun-adapter";
import { t } from "./trpc";
import { channelsRouter } from "./routers/channels";

export const router = t.router({
  channels: channelsRouter,
});

export type AppRouter = typeof router;

Bun.serve(
  createBunServeHandler(
    {
      endpoint: "/trpc",
      responseMeta() {
        return {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
