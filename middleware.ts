import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/editor(.*)",
  "/preview(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";
  const path = url.pathname;

  // Define your main app domain
  const mainDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost";
  const mainPort = process.env.PORT || "3000";

  // Check if it's a custom project subdomain
  let isSubdomain = false;
  let subdomain: string | null = null;

  // Handle localhost subdomains (e.g., "projectid.localhost:3000")
  if (hostname.includes(".localhost")) {
    isSubdomain = true;
    subdomain = hostname.split(".localhost")[0];
  }
  // Handle production subdomains (e.g., "projectid.yourdomain.com")
  else if (
    hostname !== mainDomain &&
    !hostname.includes("vercel.app") &&
    hostname.includes(".")
  ) {
    const parts = hostname.split(".");
    if (parts.length > 1) {
      isSubdomain = true;
      subdomain = parts[0];
    }
  }

  console.log(
    `Debug: Hostname: ${hostname}, isSubdomain: ${isSubdomain}, subdomain: ${subdomain}, path: ${path}`
  );

  if (isSubdomain) {
    if (path === "/" || path === "") {
      url.pathname = `/preview/${subdomain}`;
      console.log(`Redirecting to: ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
  }

  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
