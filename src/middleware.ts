import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    const {
        data: { session },
        error,
    } = await supabase.auth.getSession()

    if (request.nextUrl.pathname.startsWith("/admin")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url))
        }

        const { data: userRoleData, error: roleError } = await supabase
            .from("admin_users")
            .select("is_admin")
            .eq("user_id", session.user.id)
            .single()

        if (roleError || !userRoleData?.is_admin) {
            return NextResponse.redirect(new URL("/", request.url))
        }
    }

    return res
}

export const config = {
    matcher: ["/admin", "/admin/:path*"],
}
