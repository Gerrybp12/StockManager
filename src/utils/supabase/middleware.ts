import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define your route permissions
const ROUTE_PERMISSIONS = {
  '/cart/tiktok': ['tiktok', 'manager'],
  '/cart/shopee': ['shopee', 'manager'],
  '/cart/toko': ['toko', 'manager'],
  '/': ['manager'],
  '/profile' :['tiktok', 'shopee','toko', 'manager']
} as const

// Define default routes for each role
const ROLE_DEFAULT_ROUTES = {
  'tiktok': '/cart/tiktok',
  'shopee': '/cart/shopee',
  'toko': '/cart/toko',
  'manager': '/'
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
      .from('users') // or 'profiles' table
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      return null
    }

    return profile?.role || null
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

  // Check for nested routes (e.g., /cart/tiktok/something)
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route + '/') && route !== '/') {
      return allowedRoles.includes(userRole as any)
    }
  }

  // Special handling for root path nested routes
  if (pathname.startsWith('/') && pathname !== '/' && ROUTE_PERMISSIONS['/']) {
    return ROUTE_PERMISSIONS['/'].includes(userRole as any)
  }

  // If no specific route permission is defined, deny access by default
  return false
}

// Helper function to get default route for user role
function getDefaultRouteForRole(userRole: string): string {
  return ROLE_DEFAULT_ROUTES[userRole as keyof typeof ROLE_DEFAULT_ROUTES] || '/unauthorized'
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
    const userRole = await getUserRole(supabase, user.id)
    const url = request.nextUrl.clone()
    
    if (userRole) {
      url.pathname = getDefaultRouteForRole(userRole)
    } else {
      url.pathname = '/unauthorized'
    }
    
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
      // If we can't determine the user role, redirect to unauthorized page
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }

    // Check if user has permission to access the current route
    if (!hasRoutePermission(userRole, pathname)) {
      const url = request.nextUrl.clone()
      
      // If user is trying to access root and doesn't have permission,
      // redirect to their default route
      if (pathname === '/') {
        url.pathname = getDefaultRouteForRole(userRole)
      } else {
        url.pathname = '/unauthorized'
      }
      
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}