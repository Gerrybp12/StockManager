'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { UserProfile } from '@/types/user'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform(val => val.trim().toLowerCase()),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password is too long'),
})

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  // Extract form data
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  // Validate with Zod
  const result = loginSchema.safeParse(rawData)
  
  if (!result.success) {
    const firstError = result.error.errors[0]
    return { error: firstError.message }
  }

  const { error } = await supabase.auth.signInWithPassword(result.data)
  
  if (error) {
    return { error: error.message }
  }

  // Get the current user after successful login
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'Failed to get user data after login' }
  }

  // Fetch user profile to determine role using user ID instead of email
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id) // Use user ID instead of email for more reliable lookup
    .single()

  if (profileError || !profile) {
    return { error: 'Failed to fetch user role' }
  }

  revalidatePath('/', 'layout')
  
  // Redirect based on role
  switch (profile.role) {
    case 'manager':
      redirect('/')
      break // Add break statements
    case 'tiktok':
      redirect('/cart/tiktok') // Add leading slash for absolute path
      break
    case 'shopee':
      redirect('/cart/shopee') // Add leading slash for absolute path
      break
    case 'toko':
      redirect('/cart/toko') // Add leading slash for absolute path
      break
    default:
      redirect('/login')
  }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function getProfile(): Promise<{ user: any; profile: UserProfile | null; error?: string }> {
  const supabase = await createClient()
  
  try {
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return { user: null, profile: null, error: 'User not authenticated' }
    }

    // Get user profile from the users table
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, role")
      .eq("id", user.id)
      .single()

    if (error) {
      return { user, profile: null, error: error.message }
    }

    return { user, profile: data }
  } catch (error) {
    console.error('Error in getProfile:', error)
    return { user: null, profile: null, error: 'Failed to load profile' }
  }
}

export async function logout() {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { error: error.message }
    }
    
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    console.error('Error during logout:', error)
    return { error: 'Failed to logout' }
  }
}

// Uncomment and fix signup if needed
// export async function signup(formData: FormData) {
//   const supabase = await createClient()
  
//   const signupSchema = z.object({
//     email: z.string().email('Please enter a valid email address'),
//     password: z.string().min(6, 'Password must be at least 6 characters long'),
//     username: z.string().min(2, 'Username must be at least 2 characters long').optional(),
//   })

//   const rawData = {
//     email: formData.get('email'),
//     password: formData.get('password'),
//     username: formData.get('username'),
//   }

//   const result = signupSchema.safeParse(rawData)
  
//   if (!result.success) {
//     const firstError = result.error.errors[0]
//     return { error: firstError.message }
//   }

//   const { data, error } = await supabase.auth.signUp({
//     email: result.data.email,
//     password: result.data.password,
//   })

//   if (error) {
//     return { error: error.message }
//   }

//   // Optionally create user profile record
//   if (data.user) {
//     const { error: profileError } = await supabase
//       .from('users')
//       .insert({
//         id: data.user.id,
//         email: data.user.email,
//         username: result.data.username || data.user.email?.split('@')[0],
//         role: 'user' // default role
//       })
    
//     if (profileError) {
//       console.error('Error creating user profile:', profileError)
//     }
//   }

//   revalidatePath('/', 'layout')
//   redirect('/')
// }