import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define your route permissions
const ROUTE_PERMISSIONS = {
  '/cart/tiktok': ['tiktok', 'manager'],
  '/cart/shopee': ['shopee', 'manager'],
  '/cart/toko'  : ['toko', 'manager'],
} as const

// Helper function to get user role
async function getUserRole(supabase: any, userId: string) {
  try {
    // Option 1: If role is stored in auth.users metadata
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.role) {
      return user.user_metadata.role
    }

    // Option 2: If role is stored in a separate profiles/users table
    const { data: profile, error } = await supabase
      .from('users') // or 'users' table
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      return null
    }

    return profile?.role || 'user' // default to 'user' role
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return null
  }
}

// Helper function to check if user has permission for route
function hasRoutePermission(userRole: string, pathname: string): boolean {
  // Check exact route match first
  if (ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]) {
    return ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS].includes(userRole as any)
  }

  // Check for nested routes (e.g., /admin/something)
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route + '/') || pathname === route) {
      return allowedRoles.includes(userRole as any)
    }
  }

  // If no specific route permission is defined, allow all authenticated users
  return true
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Allow access to unauthorized page for all authenticated users
  if (pathname === '/unauthorized') {
    return supabaseResponse
  }

  // Redirect authenticated users away from login/auth pages
  if (
    user &&
    (pathname.startsWith('/login') || pathname.startsWith('/auth'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users to login page (except for auth-related pages)
  if (
    !user &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/api/auth') // Allow auth API routes
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based route protection for authenticated users
  if (user) {
    const userRole = await getUserRole(supabase, user.id)
    
    if (!userRole) {
      // If we can't determine the user role, redirect to a safe page
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Check if user has permission to access the current route
    if (!hasRoutePermission(userRole, pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}