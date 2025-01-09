import { z } from "zod";
import { adminProcedure, protectedProcedure, t } from "../trpc";
import { userService } from "../services/user";
import type { Context } from "../context";

// Input validation schemas
const userInputSchema = {
  id: z.string().uuid(),
  name: z.string().min(2).trim(),
  address: z.string(),
};

const paginationSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

export const usersRouter = t.router({
  // Profile operations
  me: protectedProcedure.query(async ({ ctx }) => {
    const address = ctx.token?.sub?.split(":")[2] || "";
    return userService.getUserByAddress(address);
  }),

  // User lookup operations - доступно только админам
  getById: adminProcedure
    .input(userInputSchema.id)
    .query(({ input }) => userService.getUserById(input)),

  getByAddress: adminProcedure
    .input(userInputSchema.address)
    .query(({ input }) => userService.getUserByAddress(input)),

  list: adminProcedure
    .input(paginationSchema)
    .query(({ input }) => userService.listUsers(input)),

  // User management operations - доступно только админам
  create: adminProcedure
    .input(
      z.object({
        name: userInputSchema.name,
        address: userInputSchema.address,
      })
    )
    .mutation(({ input }) => userService.createUser(input)),

  update: adminProcedure
    .input(
      z.object({
        id: userInputSchema.id,
        data: z.object({
          name: userInputSchema.name.optional(),
          address: userInputSchema.address.optional(),
        }),
      })
    )
    .mutation(({ input }) => userService.updateUser(input.id, input.data)),

  delete: adminProcedure
    .input(userInputSchema.id)
    .mutation(async ({ input }) => {
      await userService.deleteUser(input);
      return { success: true };
    }),
});
