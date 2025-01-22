// TODO: Implement the code here to add rate limiting with Redis
// Refer to the Next.js Docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
// Refer to Redis docs on Rate Limiting: https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Create a new ratelimiter that allows 5 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  try {
    // Get IP address from request
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // Rate limit by IP address
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    // Set rate limit headers
    const response = success
      ? NextResponse.next()
      : NextResponse.json(
          { error: "Too many requests" },
          { status: 429, statusText: "Too Many Requests" }
        );

    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());

    return response;
  } catch (error) {
    console.error("Rate limiting error:", error);
    return NextResponse.next();
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match API routes and protect them with rate limiting
     * Exclude static files, images, and other assets
     */
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
