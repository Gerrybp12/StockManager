"use client"
import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import { useNavigation } from '@/hooks/useNavigation'

export default function Unauthorized() {
  const [countdown, setCountdown] = useState(5)
  const { navigateTo, isLoading, isAnyLoading } = useNavigation()
  
  const handleRedirect = () => {
    navigateTo('/', 'home-redirect')
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleRedirect()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (isLoading('home-redirect') || isAnyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          {/* Icon */}
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />

          {/* Title */}
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            You don't have permission to view this page.
          </p>

          {/* Countdown */}
          <p className="text-sm text-gray-500 mb-4">
            Redirecting in {countdown} {countdown === 1 ? 'second' : 'seconds'}
          </p>

          {/* Button */}
          <button
            onClick={handleRedirect}
            disabled={isLoading('home-redirect')}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded transition-colors"
          >
            {isLoading('home-redirect') ? 'Redirecting...' : 'Go to Home'}
          </button>
        </div>
      </div>
    </div>
  )
}