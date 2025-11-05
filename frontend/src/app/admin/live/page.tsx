'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ActiveCall {
  id: number
  src: string
  dst: string
  state: string
  start_time: string
  answer_time?: string
  current_duration: number
  tenant: {
    name: string
    context: string
  }
  channel: string
}

interface Stats {
  active_calls: number
  ringing: number
  answered: number
  today_total: number
  today_answered: number
  today_success_rate: number
}

export default function LiveMonitoringPage() {
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
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

    fetchData()
    
    // Auto refresh every 3 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchData()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [router, autoRefresh])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch active calls (using mock data for demo)
      const callsResponse = await fetch('https://sip.pbx.biz.id/api/live/mock-calls', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Fetch statistics
      const statsResponse = await fetch('https://sip.pbx.biz.id/api/live/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (callsResponse.ok) {
        const callsData = await callsResponse.json()
        setActiveCalls(callsData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching live data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'RINGING': return 'text-yellow-600 bg-yellow-100 animate-pulse'
      case 'ANSWERED': return 'text-green-600 bg-green-100'
      case 'HANGUP': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const hangupCall = async (callId: number) => {
    if (!confirm('Are you sure you want to hangup this call?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://sip.pbx.biz.id/api/live/hangup/${callId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Error hanging up call:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center font-mono">
          <div className="text-2xl font-bold mb-4">LOADING LIVE DATA...</div>
          <div className="flex space-x-1">
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
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold font-mono">LIVE MONITORING</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm font-mono">{autoRefresh ? 'LIVE' : 'PAUSED'}</span>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`font-mono ${autoRefresh ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {autoRefresh ? 'PAUSE' : 'RESUME'}
              </Button>
              <Button
                onClick={() => router.push('/admin')}
                variant="outline"
                className="font-mono border-2 border-gray-800"
              >
                BACK TO DASHBOARD
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card className="border-2 border-green-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">ACTIVE CALLS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-green-600">{stats?.active_calls || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">RINGING</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-yellow-600">{stats?.ringing || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">ANSWERED</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-blue-600">{stats?.answered || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">TODAY TOTAL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-purple-600">{stats?.today_total || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-indigo-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">TODAY ANSWERED</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-indigo-600">{stats?.today_answered || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">SUCCESS RATE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-pink-600">{stats?.today_success_rate || 0}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Calls Table */}
        <Card className="border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="font-mono">ACTIVE CALLS ({activeCalls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2">TENANT</th>
                    <th className="text-left py-2">SRC</th>
                    <th className="text-left py-2">DST</th>
                    <th className="text-left py-2">STATE</th>
                    <th className="text-left py-2">DURATION</th>
                    <th className="text-left py-2">CHANNEL</th>
                    <th className="text-left py-2">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCalls.map((call) => (
                    <tr key={call.id} className="border-b border-gray-300 hover:bg-gray-50">
                      <td className="py-2">{call.tenant.name}</td>
                      <td className="py-2 font-bold">{call.src}</td>
                      <td className="py-2">{call.dst}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs rounded ${getStateColor(call.state)}`}>
                          {call.state}
                        </span>
                      </td>
                      <td className="py-2 font-bold">{formatDuration(call.current_duration)}</td>
                      <td className="py-2 text-xs">{call.channel}</td>
                      <td className="py-2">
                        <Button
                          onClick={() => hangupCall(call.id)}
                          size="sm"
                          variant="outline"
                          className="font-mono text-xs border-red-600 text-red-600 hover:bg-red-50"
                        >
                          HANGUP
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {activeCalls.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-mono">
                  NO ACTIVE CALLS
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}