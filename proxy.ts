import { NextResponse, type NextRequest } from "next/server";
/* La détection de langue vit dans `lib/dictionaries` : les pages « introuvable » en ont
   besoin aussi, et deux copies de cette règle finiraient par diverger. */
import { detectLocale, locales } from "@/lib/dictionaries";

const PUBLIC_FILE =
  /\.(?:png|jpe?g|svg|webp|avif|gif|ico|woff2?|ttf|otf|xml|txt|json|webmanifest|mp4|webm|ogv|mov|m4v|mp3|wav|m4a|pdf)$/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();

  const locale = detectLocale(
    request.cookies.get("belora-locale")?.value,
    request.headers.get("accept-language") ?? undefined,
  );
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/webpack-hmr).*)"],
};