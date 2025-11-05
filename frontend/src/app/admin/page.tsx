'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Stats {
  total_cdr: number
  answered_calls: number
  unique_accounts: number
  total_users: number
}

interface HourlyStats {
  hour: number
  call_count: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }
    
    const userData = JSON.parse(user)
    if (userData.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [dashboardResponse, reportsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cdr/reports`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (dashboardResponse.ok) {
        const data = await dashboardResponse.json()
        setStats(data.stats)
      }

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setHourlyStats(reportsData.hourly_stats || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const maxCalls = Math.max(...hourlyStats.map(h => h.call_count), 1)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4" style={{fontFamily: 'Courier New, monospace', letterSpacing: '2px'}}>
            LOADING...
          </div>
          <div className="flex space-x-1 justify-center">
            <span className="animate-pulse">█</span>
            <span className="animate-pulse" style={{animationDelay: '0.2s'}}>█</span>
            <span className="animate-pulse" style={{animationDelay: '0.4s'}}>█</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold" style={{fontFamily: 'Courier New, monospace', letterSpacing: '2px', textTransform: 'uppercase'}}>
              ADMIN DASHBOARD
            </h1>
            <div className="flex space-x-4">
              <Button
                onClick={() => router.push('/admin/contracts')}
                className="font-bold bg-indigo-600 hover:bg-indigo-700 border-2 border-gray-800"
                style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
              >
                📋 CONTRACTS
              </Button>
              <Button
                onClick={() => router.push('/admin/rate-groups')}
                className="font-bold bg-green-600 hover:bg-green-700 border-2 border-gray-800"
                style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
              >
                💰 RATES
              </Button>
              <Button
                onClick={() => router.push('/admin/invoices')}
                className="font-bold bg-purple-600 hover:bg-purple-700 border-2 border-gray-800"
                style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
              >
                📄 INVOICES
              </Button>
              <Button
                onClick={() => router.push('/admin/cdr')}
                className="font-bold bg-blue-600 hover:bg-blue-700 border-2 border-gray-800"
                style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
              >
                📊 CDR
              </Button>
              <Button
                onClick={() => router.push('/admin/live')}
                className="font-bold bg-orange-600 hover:bg-orange-700 border-2 border-gray-800"
                style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
              >
                🔴 LIVE
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="font-bold border-2 border-gray-800"
                style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
              >
                🚪 LOGOUT
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-gray-800 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-600" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                TOTAL CDR RECORDS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{fontFamily: 'Courier New, monospace'}}>
                {stats?.total_cdr?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-600 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-600" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                SUCCESSFUL CALLS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600" style={{fontFamily: 'Courier New, monospace'}}>
                {stats?.answered_calls?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-600 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-600" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                ACTIVE ACCOUNTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600" style={{fontFamily: 'Courier New, monospace'}}>
                {stats?.unique_accounts || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-600 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-600" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                SYSTEM USERS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600" style={{fontFamily: 'Courier New, monospace'}}>
                {stats?.total_users || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call Traffic Chart */}
        <Card className="border-2 border-gray-800 bg-white mb-8">
          <CardHeader>
            <CardTitle className="font-bold" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
              📈 HOURLY CALL TRAFFIC (LAST 30 DAYS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-1 bg-gray-50 p-4 border-2 border-gray-300">
              {Array.from({length: 24}, (_, i) => {
                const hourData = hourlyStats.find(h => h.hour === i)
                const callCount = hourData?.call_count || 0
                const height = maxCalls > 0 ? (callCount / maxCalls) * 200 : 0
                
                return (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-blue-600 border border-gray-800 min-h-[4px] w-full flex items-end justify-center relative group"
                      style={{height: `${Math.max(height, 4)}px`}}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {i.toString().padStart(2, '0')}:00 - {callCount} calls
                      </div>
                    </div>
                    <div className="text-xs mt-1 font-mono text-gray-600 transform -rotate-45 origin-top-left">
                      {i.toString().padStart(2, '0')}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-mono text-gray-600">
                PEAK HOURS: {hourlyStats.length > 0 ? 
                  hourlyStats.reduce((max, curr) => curr.call_count > max.call_count ? curr : max).hour.toString().padStart(2, '0') + ':00' 
                  : 'N/A'} 
                ({hourlyStats.length > 0 ? Math.max(...hourlyStats.map(h => h.call_count)) : 0} CALLS)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2 border-gray-800 bg-white">
            <CardHeader className="border-b-2 border-gray-300">
              <CardTitle className="font-bold" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                📄 INVOICE MANAGEMENT
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/admin/invoices')}
                  className="w-full py-3 font-bold bg-purple-600 hover:bg-purple-700 border-2 border-gray-800"
                  style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
                >
                  MANAGE CUSTOMER INVOICES
                </Button>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-100 p-3 border-2 border-gray-300">
                    <p className="text-sm font-mono text-gray-600">PENDING APPROVAL</p>
                    <p className="text-xl font-bold text-yellow-600 font-mono">0</p>
                  </div>
                  <div className="bg-gray-100 p-3 border-2 border-gray-300">
                    <p className="text-sm font-mono text-gray-600">TOTAL REVENUE</p>
                    <p className="text-xl font-bold text-green-600 font-mono">RP 490K</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-800 bg-white">
            <CardHeader className="border-b-2 border-gray-300">
              <CardTitle className="font-bold" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                💰 RATE MANAGEMENT
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/admin/rates')}
                  className="w-full py-3 font-bold bg-green-600 hover:bg-green-700 border-2 border-gray-800"
                  style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
                >
                  CONFIGURE BILLING RATES
                </Button>
                <div className="bg-gray-100 p-4 border-2 border-gray-300 text-center">
                  <p className="text-sm font-mono text-gray-600 mb-2">ACTIVE RATE CARDS</p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 border border-gray-800"></div>
                    <span className="text-green-600 font-bold font-mono">18 ACTIVE</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}