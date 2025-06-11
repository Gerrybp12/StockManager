'use client'

import { useState, useEffect } from 'react'
import { useNavigation } from '@/hooks/useNavigation'
import { useFormStatus } from 'react-dom'
import { login, getCurrentUser } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <LoadingSpinner size="sm" color="white" />
          <span className="ml-2">Logging in...</span>
        </>
      ) : (
        'Log in'
      )}
    </Button>
  )
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const { navigateTo, isLoading } = useNavigation()

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser()
        if (user) {
          navigateTo('/', 'auth-redirect')
          return
        }
      } catch (error) {
        // User is not authenticated, continue with login page
        console.log('User not authenticated')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [navigateTo])

  async function handleLogin(formData: FormData) {
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
    }
    // No need to manually redirect here since your login action already redirects
  }

  // Show loading spinner while checking authentication or navigating
  if (isChecking || isLoading('auth-redirect')) {
    return (
      <LoadingSpinner 
        fullScreen={true} 
        text={isChecking ? "Checking authentication..." : "Redirecting..."} 
        size="lg" 
        color="blue" 
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          <form action={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex flex-col space-y-2 pt-4">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}