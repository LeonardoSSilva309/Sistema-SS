import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "ADMIN" | "STAFF" | "MEMBER";
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STAFF" | "MEMBER";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "STAFF" | "MEMBER";
  }
}
