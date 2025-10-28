import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const config = {
  matcher: [
    "/admin/:path*",
    "/adminreg/:path*",
    "/adminsub/:path*",
    "/adminsubreg/:path*",
    "/aventureirocombate/:path*",
    "/aventureiroficha/:path*",
    "/aventureiromascote/:path*",
    "/aventureiromissoes/:path*",
    "/aventureirotaverna/:path*",
    "/configuracoes/:path*",
    "/escolha/:path*",
    "/mestreficha/:path*",
    "/mestretaverna/:path*",
  ],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////