"use client"

import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
}

export default function LoadingState({ message = "Caricamento in corso..." }: LoadingStateProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}
