import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isProtected = [
    "/overview",
    "/tasks",
    "/approvals",
    "/upload",
    "/activity",
    "/documents",
  ].some((path) => req.nextUrl.pathname.startsWith(path));

  if (isProtected && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
    return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl));
  }

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/overview", req.nextUrl));
  }
});

export const config = {
  matcher: [
    "/overview/:path*",
    "/tasks/:path*",
    "/approvals/:path*",
    "/upload/:path*",
    "/activity/:path*",
    "/documents/:path*",
    "/login",
  ],
};
