'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

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

  revalidatePath('/', 'layout')
  redirect('/')
}

// export async function signup(formData: FormData) {
//   const supabase = await createClient()

//   // type-casting here for convenience
//   // in practice, you should validate your inputs
//   const data = {
//     email: formData.get('email') as string,
//     password: formData.get('password') as string,
//   }

//   const { error } = await supabase.auth.signUp(data)

//   if (error) {
//     return { error: error.message }
//   }

//   revalidatePath('/', 'layout')
//   redirect('/')
// }
