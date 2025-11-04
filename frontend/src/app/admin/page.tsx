'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Stats {
  total_tenants: number
  active_tenants: number
  total_extensions: number
  active_extensions: number
  total_users: number
}

interface Tenant {
  id: number
  name: string
  domain: string
  active: boolean
  extensions_count: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([])
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
      const response = await fetch('https://sip.pbx.biz.id/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentTenants(data.recent_tenants)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center font-mono">
          <div className="text-2xl font-bold mb-4">LOADING...</div>
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
            <h1 className="text-2xl font-bold font-mono" style={{letterSpacing: '2px'}}>
              ADMIN DASHBOARD
            </h1>
            <div className="flex space-x-4">
              <Button
                onClick={() => router.push('/admin/tenants')}
                className="font-mono bg-blue-600 hover:bg-blue-700"
              >
                MANAGE TENANTS
              </Button>
              <Button
                onClick={() => router.push('/admin/extensions')}
                className="font-mono bg-green-600 hover:bg-green-700"
              >
                MANAGE EXTENSIONS
              </Button>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="border-2 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">TOTAL TENANTS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stats?.total_tenants || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">ACTIVE TENANTS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-green-600">{stats?.active_tenants || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">TOTAL EXTENSIONS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stats?.total_extensions || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">ACTIVE EXTENSIONS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-blue-600">{stats?.active_extensions || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono text-gray-600">TOTAL USERS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-purple-600">{stats?.total_users || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tenants */}
        <Card className="border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="font-mono text-lg">RECENT TENANTS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2">NAME</th>
                    <th className="text-left py-2">DOMAIN</th>
                    <th className="text-left py-2">EXTENSIONS</th>
                    <th className="text-left py-2">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-gray-300">
                      <td className="py-2">{tenant.name}</td>
                      <td className="py-2">{tenant.domain}</td>
                      <td className="py-2">{tenant.extensions_count}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs ${
                          tenant.active 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {tenant.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
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