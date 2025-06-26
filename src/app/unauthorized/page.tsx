"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'

export default function Unauthorized() {
  const [countdown, setCountdown] = useState(5)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  
  const handleRedirect = () => {
    if (!isRedirecting) {
      setIsRedirecting(true)
      // Use setTimeout to ensure this happens after render
      setTimeout(() => {
        router.push('/')
      }, 0)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Delay the navigation to avoid render conflicts
          setTimeout(() => {
            handleRedirect()
          }, 100)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [handleRedirect]) // Added handleRedirect to the dependency array

  if (isRedirecting) {
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
            You don&apos;t have permission to view this page.
          </p>
          
          {/* Countdown */}
          <p className="text-sm text-gray-500 mb-4">
            Redirecting in {countdown} {countdown === 1 ? 'second' : 'seconds'}
          </p>
          
          {/* Button */}
          <button
            onClick={handleRedirect}
            disabled={isRedirecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded transition-colors"
          >
            {isRedirecting ? 'Redirecting...' : 'Go to Home'}
          </button>
        </div>
      </div>
    </div>
  )
}