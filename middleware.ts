import { NextRequest, NextResponse } from "next/server";
import { createClient } from "./utils/supabase/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

export default async function middleware(req: NextRequest) {
  const supabase = await createClient();
  const res = NextResponse.next();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  if (user && (path.startsWith("/masuk") || path.startsWith("/daftar"))) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return res;
}
