/// <reference types="@cloudflare/workers-types" />
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./src/server/router";
import { createContext, type Env } from "./src/server/context";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle tRPC API requests
    if (url.pathname.startsWith("/api/trpc")) {
      const response = await fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext: (opts) => createContext(opts, env),
      });
      return response;
    }

    // For /owner SPA routes (excluding actual static assets),
    // serve the owner/index.html so client-side routing works.
    if (
      url.pathname.startsWith("/owner") &&
      !url.pathname.startsWith("/owner/assets/")
    ) {
                      const ownerIndexUrl = new URL("/owner/index.html", url.origin);
      return env.ASSETS.fetch(new Request(ownerIndexUrl, request));
    }

    // Fall through to static assets
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
