import { initTRPC, TRPCError } from "@trpc/server";
import { SuperJSON } from "superjson";
import { type Context } from "./context";
import { users, eq, userRoleEnum } from "@app/database";

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

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.token?.sub) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Получаем адрес из токена (формат: "wallet:chain:address")
  const address = ctx.token.sub.split(":")[2];
  if (!address) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Пытаемся найти пользователя по адресу
  let user = await ctx.db.query.users.findFirst({
    where: eq(users.address, address),
  });

  // Если пользователь не найден, создаем нового
  if (!user) {
    const [newUser] = await ctx.db
      .insert(users)
      .values({
        name: `User ${address.slice(0, 6)}`,
        address: address,
      })
      .returning();
    user = newUser;
  }

  return next({ ctx: { ...ctx, user } });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ctx.user?.role !== userRoleEnum.enumValues[1][0]) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});
