import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary dark:text-primary-light animate-spin mb-3" />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  )
}