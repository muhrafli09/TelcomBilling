'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center" style={{fontFamily: 'Courier New, monospace'}}>
        <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{letterSpacing: '2px', textTransform: 'uppercase'}}>
          PBX.BIZ.ID
        </h1>
        <div className="flex items-center justify-center space-x-2" style={{letterSpacing: '1px', textTransform: 'uppercase'}}>
          <span className="text-gray-600">REDIRECTING</span>
          <div className="flex space-x-1">
            <span className="animate-pulse text-gray-600">█</span>
            <span className="animate-pulse text-gray-600" style={{animationDelay: '0.3s'}}>█</span>
            <span className="animate-pulse text-gray-600" style={{animationDelay: '0.6s'}}>█</span>
          </div>
        </div>
      </div>
    </div>
  )
}