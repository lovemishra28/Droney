import { NextResponse, type NextRequest } from "next/server";
import { jwtDecrypt } from "jose";

const SESSION_COOKIE_NAME = "aero_session";

function getEncryptionKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET environment variable is missing or less than 32 characters."
    );
  }
  return new TextEncoder().encode(secret.slice(0, 32));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Auto-redirect authenticated admin to /admin when loading root URL (/)
  // UNLESS explicitly viewing the live storefront with ?live=true
  if (pathname === "/") {
    const isLivePreview = request.nextUrl.searchParams.get("live") === "true";
    if (!isLivePreview && sessionCookie) {
      try {
        const secretKey = getEncryptionKey();
        const { payload } = await jwtDecrypt(sessionCookie, secretKey, {
          clockTolerance: 15,
        });
        if (payload?.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      } catch {
        // Ignore invalid session token and proceed as guest
      }
    }
  }

  // Guard all administrative portal routes (/admin and /admin/*)
  if (pathname.startsWith("/admin")) {
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secretKey = getEncryptionKey();
      const { payload } = await jwtDecrypt(sessionCookie, secretKey, {
        clockTolerance: 15,
      });

      // Role-Based Access Control: ensure role is 'admin'
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // Invalid or tampered token: redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
  }

  // Prevent authenticated users from visiting /login again
  if (pathname === "/login" && sessionCookie) {
    try {
      const secretKey = getEncryptionKey();
      const { payload } = await jwtDecrypt(sessionCookie, secretKey);
      if (payload?.sub) {
        return NextResponse.redirect(
          new URL(payload.role === "admin" ? "/admin" : "/", request.url)
        );
      }
    } catch {
      // Ignore invalid cookie and allow reaching login
    }
  }

  const response = NextResponse.next();

  // Edge micro-cache: 60s cache at edge, 300s stale-while-revalidate background refresh
  if (
    pathname.startsWith("/catalog") ||
    pathname.startsWith("/product/") ||
    pathname === "/"
  ) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/catalog",
    "/product/:path*",
    "/",
  ],
};
