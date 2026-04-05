/// <reference types="@cloudflare/workers-types" />
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifyJWT } from "../lib/jwt";

export interface Env {
  JWT_SECRET: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  APPOINTMENTS?: KVNamespace;
  ASSETS: Fetcher;
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
  env: Env
) {
  const cookies = parseCookies(opts.req.headers.get("cookie") ?? "");
  const sessionToken = cookies["session"];

  let adminEmail: string | null = null;
  if (sessionToken) {
    try {
      const payload = await verifyJWT(sessionToken, env.JWT_SECRET);
      if (typeof payload["email"] === "string") {
        adminEmail = payload["email"];
      }
    } catch {
      // invalid token — ignore
    }
  }

  const resHeaders = new Headers();

  return {
    env,
    adminEmail,
    req: opts.req,
    resHeaders,
    setCookie(name: string, value: string) {
      resHeaders.append(
        "Set-Cookie",
        `${name}=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`
      );
    },
    clearCookie(name: string) {
      resHeaders.append(
        "Set-Cookie",
        `${name}=; HttpOnly; Path=/; Max-Age=0`
      );
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

function parseCookies(cookieHeader: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of cookieHeader.split(";")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (key) result[key] = val;
  }
  return result;
}
