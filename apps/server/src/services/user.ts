import { db, users, type User, and, eq } from "@app/database";
import { TRPCError } from "@trpc/server";
import { redis } from "./redis";

interface CreateUserData {
  name: string;
  address: string;
}

interface ListUsersOptions {
  limit?: number;
  offset?: number;
}

class UserService {
  private static readonly CACHE_PREFIX = "user:";
  private static readonly CACHE_TTL = 60 * 60; // 1 hour in seconds
  private static readonly CACHE_KEYS = {
    byId: (id: string) => `${UserService.CACHE_PREFIX}id:${id}`,
    byAddress: (address: string) =>
      `${UserService.CACHE_PREFIX}address:${address}`,
  };

  /**
   * Creates a new user and caches the result
   */
  public async createUser(data: CreateUserData): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();

    await this.cacheUser(user);
    return user;
  }

  /**
   * Retrieves a user by ID with caching
   */
  public async getUserById(id: string): Promise<User | null> {
    const cachedUser = await this.getCachedUserById(id);
    if (cachedUser) {
      return cachedUser;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user) {
      await this.cacheUser(user);
    }

    return user ?? null;
  }

  /**
   * Retrieves a user by wallet address with caching
   */
  public async getUserByAddress(address: string): Promise<User | null> {
    const cachedUser = await this.getCachedUserByAddress(address);
    if (cachedUser) {
      return cachedUser;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.address, address))
      .limit(1);

    if (user) {
      await this.cacheUser(user);
    }

    return user ?? null;
  }

  /**
   * Lists all users with pagination support
   */
  public async listUsers({ limit, offset }: ListUsersOptions = {}): Promise<
    User[]
  > {
    const query = db.select().from(users);

    if (limit != null) {
      query.limit(limit);
    }

    if (offset != null) {
      query.offset(offset);
    }

    return query;
  }

  /**
   * Updates user information by ID and refreshes cache
   */
  public async updateUser(
    id: string,
    data: Partial<Pick<User, "name" | "address">>
  ): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    await this.cacheUser(updatedUser);
    return updatedUser;
  }

  /**
   * Deletes a user by ID and clears cache
   */
  public async deleteUser(id: string): Promise<void> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    await this.clearUserCache(deletedUser);
  }

  /**
   * Cache management methods
   */
  private async cacheUser(user: User): Promise<void> {
    const userJson = JSON.stringify(user);
    await Promise.all([
      redis.setex(
        UserService.CACHE_KEYS.byId(user.id),
        UserService.CACHE_TTL,
        userJson
      ),
      redis.setex(
        UserService.CACHE_KEYS.byAddress(user.address),
        UserService.CACHE_TTL,
        userJson
      ),
    ]);
  }

  private async getCachedUserById(id: string): Promise<User | null> {
    const data = await redis.get(UserService.CACHE_KEYS.byId(id));
    return data ? JSON.parse(data) : null;
  }

  private async getCachedUserByAddress(address: string): Promise<User | null> {
    const data = await redis.get(UserService.CACHE_KEYS.byAddress(address));
    return data ? JSON.parse(data) : null;
  }

  private async clearUserCache(user: User): Promise<void> {
    await Promise.all([
      redis.del(UserService.CACHE_KEYS.byId(user.id)),
      redis.del(UserService.CACHE_KEYS.byAddress(user.address)),
    ]);
  }
}

export const userService = new UserService();
