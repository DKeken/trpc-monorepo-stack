import { initTRPC } from "@trpc/server";
import { SuperJSON } from "superjson";
import { type Context } from "./context";

export const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter({ shape }) {
    return shape;
  },
  sse: {
    maxDurationMs: 5 * 60 * 1_000,
    ping: {
      enabled: true,
      intervalMs: 3_000,
    },
    client: {
      reconnectAfterInactivityMs: 5_000,
    },
  },
});

export const createCallerFactory = t.createCallerFactory;
export const mergeRouters = t.mergeRouters;
