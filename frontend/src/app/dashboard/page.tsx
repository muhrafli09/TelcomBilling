'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CallRecord {
  id: number
  extension: string
  destination: string
  duration: number
  cost: number
  timestamp: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [callHistory, setCallHistory] = useState<CallRecord[]>([])
  const [stats, setStats] = useState({
    total_calls: 0,
    total_cost: 0,
    active_calls: 0
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    // Mock data untuk customer dashboard
    setStats({
      total_calls: Math.floor(Math.random() * 100) + 50,
      total_cost: Math.floor(Math.random() * 50000) + 10000,
      active_calls: Math.floor(Math.random() * 5)
    })
    
    // Mock call history
    const mockCalls: CallRecord[] = [
      {
        id: 1,
        extension: '1001',
        destination: '+628123456789',
        duration: 180,
        cost: 2500,
        timestamp: '2025-11-04 14:30:00'
      },
      {
        id: 2,
        extension: '1001',
        destination: '+628987654321',
        duration: 95,
        cost: 1200,
        timestamp: '2025-11-04 13:15:00'
      },
      {
        id: 3,
        extension: '1002',
        destination: '+628555666777',
        duration: 320,
        cost: 4800,
        timestamp: '2025-11-04 12:45:00'
      }
    ]
    setCallHistory(mockCalls)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center font-mono">LOADING...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold font-mono" style={{letterSpacing: '2px'}}>
                CUSTOMER DASHBOARD
              </h1>
              <p className="text-sm font-mono text-gray-600">Welcome, {user.name}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="font-mono border-2 border-gray-800"
            >
              LOGOUT
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-blue-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">TOTAL CALLS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-blue-600">{stats.total_calls}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">TOTAL COST</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-green-600">
                {formatCurrency(stats.total_cost)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">ACTIVE CALLS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-orange-600">{stats.active_calls}</div>
            </CardContent>
          </Card>
        </div>

        {/* Call History */}
        <Card className="border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="font-mono text-lg">RECENT CALL HISTORY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2">EXTENSION</th>
                    <th className="text-left py-2">DESTINATION</th>
                    <th className="text-left py-2">DURATION</th>
                    <th className="text-left py-2">COST</th>
                    <th className="text-left py-2">TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {callHistory.map((call) => (
                    <tr key={call.id} className="border-b border-gray-300">
                      <td className="py-2 font-bold">{call.extension}</td>
                      <td className="py-2">{call.destination}</td>
                      <td className="py-2">{formatDuration(call.duration)}</td>
                      <td className="py-2 text-green-600 font-bold">
                        {formatCurrency(call.cost)}
                      </td>
                      <td className="py-2">{call.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}