import { redis } from "./redis";
import { channels, db, type Channel } from "@app/database";

class ChannelService {
  private readonly TYPING_KEY_PREFIX = "typing:";
  private readonly TYPING_EXPIRY = 3; // seconds

  constructor() {
    this.initTypingCleanup();
  }

  private initTypingCleanup() {
    setInterval(async () => {
      const keys = await redis.keys(`${this.TYPING_KEY_PREFIX}*`);

      for (const key of keys) {
        const channelId = key.replace(this.TYPING_KEY_PREFIX, "");
        const typers = await this.getTypingUsersFromRedis(channelId);
        const now = Date.now();

        let hasChanges = false;
        for (const [username, data] of Object.entries(typers)) {
          if (
            now - new Date(data.lastTyped).getTime() >
            this.TYPING_EXPIRY * 1000
          ) {
            delete typers[username];
            hasChanges = true;
          }
        }

        if (hasChanges) {
          if (Object.keys(typers).length === 0) {
            await redis.del(key);
          } else {
            await redis.set(key, JSON.stringify(typers));
          }
          this.publishTypingUpdate(channelId);
        }
      }
    }, this.TYPING_EXPIRY * 1000).unref();
  }

  public async listChannels(): Promise<Channel[]> {
    const result = await db.select().from(channels);
    return result;
  }

  public async createChannel(name: string): Promise<string> {
    const [channel] = await db
      .insert(channels)
      .values({
        name,
      })
      .returning();

    return channel.id;
  }

  public async updateTypingStatus(
    channelId: string,
    username: string,
    typing: boolean
  ) {
    const key = this.TYPING_KEY_PREFIX + channelId;
    const typers = await this.getTypingUsersFromRedis(channelId);

    if (!typing) {
      delete typers[username];
    } else {
      typers[username] = {
        lastTyped: new Date(),
      };
    }

    if (Object.keys(typers).length === 0) {
      await redis.del(key);
    } else {
      await redis.set(key, JSON.stringify(typers));
    }

    this.publishTypingUpdate(channelId);
  }

  public async getTypingUsers(
    channelId: string
  ): Promise<Record<string, { lastTyped: Date }>> {
    return this.getTypingUsersFromRedis(channelId);
  }

  private async getTypingUsersFromRedis(
    channelId: string
  ): Promise<Record<string, { lastTyped: Date }>> {
    const data = await redis.get(this.TYPING_KEY_PREFIX + channelId);
    if (!data) return {};

    const parsedData = JSON.parse(data) as Record<
      string,
      { lastTyped: string }
    >;
    const typers: Record<string, { lastTyped: Date }> = {};

    // Convert string dates to Date objects in a new object
    for (const [username, data] of Object.entries(parsedData)) {
      typers[username] = {
        lastTyped: new Date(data.lastTyped),
      };
    }

    return typers;
  }

  private async publishTypingUpdate(channelId: string) {
    const typers = await this.getTypingUsersFromRedis(channelId);
    redis.publish(
      "typing",
      JSON.stringify({
        channelId,
        who: typers,
      })
    );
  }
}

export const channelService = new ChannelService();
