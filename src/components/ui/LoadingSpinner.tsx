// components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'red' | 'green' | 'gray' | 'white'
  fullScreen?: boolean
  text?: string
}

export default function LoadingSpinner({ 
  size = 'lg', 
  color = 'blue', 
  fullScreen = false,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-16 w-16',
    xl: 'h-32 w-32'
  }

  const colorClasses = {
    blue: 'border-blue-600',
    red: 'border-red-600',
    green: 'border-green-600', 
    gray: 'border-gray-600',
    white: 'border-white'
  }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div 
        className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && (
        <p className="text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}