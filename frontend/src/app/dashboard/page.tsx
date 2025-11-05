'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CallRecord {
  id: number
  src: string
  dst: string
  duration: number
  cost: number
  calldate: string
  disposition: string
  tenant: string
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
    
    // Fetch real data from API
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://sip.pbx.biz.id/api/customer/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || { total_calls: 0, total_cost: 0, active_calls: 0 })
        setCallHistory(data.recent_calls || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

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
            <div className="flex space-x-4">
              <Button
                onClick={() => router.push('/invoices')}
                className="font-mono bg-purple-600 hover:bg-purple-700"
              >
                📄 MY INVOICES
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="font-mono border-2 border-gray-800"
              >
                🚪 LOGOUT
              </Button>
            </div>
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
                    <th className="text-left py-2">SRC</th>
                    <th className="text-left py-2">DST</th>
                    <th className="text-left py-2">DURATION</th>
                    <th className="text-left py-2">STATUS</th>
                    <th className="text-left py-2">COST</th>
                    <th className="text-left py-2">TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {callHistory.map((call) => (
                    <tr key={call.id} className="border-b border-gray-300">
                      <td className="py-2 font-bold">{call.src}</td>
                      <td className="py-2">{call.dst}</td>
                      <td className="py-2">{formatDuration(call.duration)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          call.disposition === 'ANSWERED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {call.disposition}
                        </span>
                      </td>
                      <td className="py-2 text-green-600 font-bold">
                        {formatCurrency(call.cost)}
                      </td>
                      <td className="py-2">{call.calldate}</td>
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