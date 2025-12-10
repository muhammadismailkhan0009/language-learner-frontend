import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const userId = request.cookies.get("userId")?.value;

    // ✅ EXTRA SAFETY GUARD (always do this)
    if (request.nextUrl.pathname === "/auth/register") {
        return NextResponse.next();
    }

    if (!userId) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/auth/register";

        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

/**
 * ✅ MUST be hard-coded literals
 */
export const config = {
    matcher: [
        "/decks/:path*",
        "/flashcards/:path*",
    ],
};
