import { z } from "zod";
import { protectedProcedure, t } from "../trpc";
import { channelService } from "../services/channels";
import { redis } from "../services/redis";

export const channelsRouter = t.router({
  list: protectedProcedure.query(async (ctx) => {
    return channelService.listChannels();
  }),

  create: t.procedure
    .input(z.object({ name: z.string().trim().min(2) }))
    .mutation(async ({ input }) => {
      return channelService.createChannel(input.name);
    }),

  isTyping: t.procedure
    .input(
      z.object({
        channelId: z.string().uuid(),
        typing: z.boolean(),
        username: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { channelId, typing, username } = input;
      channelService.updateTypingStatus(channelId, username, typing);
    }),

  whoIsTyping: t.procedure
    .input(z.object({ channelId: z.string().uuid() }))
    .subscription(async function* ({ input }) {
      const { channelId } = input;
      let lastTyping = "";

      // Initial state
      const initial = {
        channelId,
        who: await channelService.getTypingUsers(channelId),
      };
      yield Object.keys(initial.who);

      // Subscribe to typing updates
      const subscriber = redis.duplicate();

      // Create a promise that resolves when we receive a message
      const messageHandler = new Promise<void>((resolve) => {
        subscriber.subscribe("typing", (err, message) => {
          if (err || !message) return;

          const data = JSON.parse(message.toString()) as {
            channelId: string;
            who: Record<string, unknown>;
          };

          if (data.channelId === channelId) {
            const typingUsers = Object.keys(data.who).sort().toString();
            if (typingUsers !== lastTyping) {
              lastTyping = typingUsers;
              resolve();
            }
          }
        });
      });

      try {
        await messageHandler;
        yield Object.keys(await channelService.getTypingUsers(channelId));
      } finally {
        await subscriber.unsubscribe("typing");
        await subscriber.disconnect();
      }
    }),

  randomNumber: t.procedure.subscription(async function* () {
    while (true) {
      yield Math.floor(Math.random() * 1000);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }),
});
