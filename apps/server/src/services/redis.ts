import Redis from "ioredis";
import { z } from "zod";

declare global {
  var redisClient: Redis | undefined;
}

const envSchema = z.object({
  REDIS_URL: z
    .string({
      required_error: "REDIS_URL is required",
      invalid_type_error: "REDIS_URL must be a string",
    })
    .url({
      message: "REDIS_URL must be a valid URL",
    }),
  REDIS_PASSWORD: z
    .string({
      required_error: "REDIS_PASSWORD is required",
      invalid_type_error: "REDIS_PASSWORD must be a string",
    })
    .min(1, "REDIS_PASSWORD cannot be empty"),
});

const env = envSchema.parse({
  REDIS_URL: process.env.REDIS_URL,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
});

let redisInstance: Redis | undefined;

if (!globalThis.redisClient) {
  const createClient = () => {
    if (redisInstance) {
      return redisInstance;
    }

    redisInstance = new Redis(env.REDIS_URL, {
      password: env.REDIS_PASSWORD,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 1000, 5000);
        console.log(
          `Retrying Redis connection in ${delay}ms... (Attempt ${times})`
        );
        return delay;
      },
      maxRetriesPerRequest: 10,
      enableReadyCheck: true,
      autoResubscribe: true,
      connectTimeout: 10000,
      keepAlive: 10000,
      reconnectOnError: (err: Error) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        console.error("Redis reconnection error:", err.message);
        return false;
      },
    });

    redisInstance.on("error", (err) => {
      console.error("Redis connection error:", err.message);
    });

    redisInstance.on("connect", () => {
      console.log("Connected to Redis");
    });

    redisInstance.on("ready", () => {
      console.log("Redis client ready");
    });

    redisInstance.on("reconnecting", (params: { attempt: number }) => {
      console.log(
        `Redis client reconnecting... Attempt ${params?.attempt || "unknown"}`
      );
    });

    redisInstance.on("end", () => {
      console.log("Redis connection ended");
      redisInstance = undefined;
    });

    redisInstance.on("wait", () => {
      console.log("Redis waiting for connection");
    });

    return redisInstance;
  };

  globalThis.redisClient = createClient();
}

export const redis = globalThis.redisClient;
