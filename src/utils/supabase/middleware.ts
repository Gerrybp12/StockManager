import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

// Define user role types
type UserRole = keyof typeof ROLE_DEFAULT_ROUTES

// Define your route permissions
const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/cart/tiktok': ['tiktok', 'manager'],
  '/cart/shopee': ['shopee', 'manager'],
  '/cart/toko': ['toko', 'manager'],
  '/': ['manager'],
  '/profile': ['tiktok', 'shopee', 'toko', 'manager'],
}

// Define default routes for each role
const ROLE_DEFAULT_ROUTES = {
  tiktok: '/cart/tiktok',
  shopee: '/cart/shopee',
  toko: '/cart/toko',
  manager: '/',
} as const

// Helper function to get user role
async function getUserRole(supabase: SupabaseClient, userId: string): Promise<UserRole | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.user_metadata?.role) {
      return user.user_metadata.role as UserRole
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      return null
    }

    return profile?.role as UserRole || null
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return null
  }
}

// Helper function to check if user has permission for route
function hasRoutePermission(userRole: UserRole, pathname: string): boolean {
  if (ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]) {
    return ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS].includes(userRole)
  }

  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route + '/') && route !== '/') {
      return allowedRoles.includes(userRole)
    }
  }

  if (pathname.startsWith('/') && pathname !== '/' && ROUTE_PERMISSIONS['/']) {
    return ROUTE_PERMISSIONS['/'].includes(userRole)
  }

  return false
}

// Helper function to get default route for user role
function getDefaultRouteForRole(userRole: UserRole): string {
  return ROLE_DEFAULT_ROUTES[userRole] || '/unauthorized'
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  if (pathname === '/unauthorized') {
    return supabaseResponse
  }

  if (user && (pathname.startsWith('/login') || pathname.startsWith('/auth'))) {
    const userRole = await getUserRole(supabase, user.id)
    const url = request.nextUrl.clone()

    if (userRole) {
      url.pathname = getDefaultRouteForRole(userRole)
    } else {
      url.pathname = '/unauthorized'
    }

    return NextResponse.redirect(url)
  }

  if (
    !user &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/api/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const userRole = await getUserRole(supabase, user.id)

    if (!userRole) {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }

    if (!hasRoutePermission(userRole, pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = pathname === '/' ? getDefaultRouteForRole(userRole) : '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
