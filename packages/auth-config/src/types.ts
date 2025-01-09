import { type SIWESession } from "@reown/appkit-siwe";

declare module "next-auth" {
  interface Session extends SIWESession {
    address: string;
    chainId: number;
  }

  interface User extends SIWESession {
    address: string;
    chainId: number;
  }
}
