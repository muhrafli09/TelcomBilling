'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Tenant {
  id: number
  name: string
  domain: string
  context: string
  active: boolean
  extensions_count: number
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    context: 'default',
    active: true
  })
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

    fetchTenants()
  }, [router])

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://sip.pbx.biz.id/api/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTenants(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://sip.pbx.biz.id/api/tenants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({ name: '', domain: '', context: 'default', active: true })
        fetchTenants()
      }
    } catch (error) {
      console.error('Error creating tenant:', error)
    }
  }

  const deleteTenant = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://sip.pbx.biz.id/api/tenants/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchTenants()
      }
    } catch (error) {
      console.error('Error deleting tenant:', error)
    }
  }

  if (loading) {
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
            <h1 className="text-2xl font-bold font-mono">TENANT MANAGEMENT</h1>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowForm(!showForm)}
                className="font-mono bg-green-600 hover:bg-green-700"
              >
                {showForm ? 'CANCEL' : 'ADD TENANT'}
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
        {/* Add Tenant Form */}
        {showForm && (
          <Card className="border-2 border-green-600 mb-8">
            <CardHeader>
              <CardTitle className="font-mono">ADD NEW TENANT</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-mono font-bold mb-2">NAME</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-bold mb-2">DOMAIN</label>
                    <input
                      type="text"
                      required
                      value={formData.domain}
                      onChange={(e) => setFormData({...formData, domain: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-bold mb-2">CONTEXT</label>
                    <input
                      type="text"
                      value={formData.context}
                      onChange={(e) => setFormData({...formData, context: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-bold mb-2">STATUS</label>
                    <select
                      value={formData.active.toString()}
                      onChange={(e) => setFormData({...formData, active: e.target.value === 'true'})}
                      className="w-full px-3 py-2 border-2 border-gray-800 font-mono"
                    >
                      <option value="true">ACTIVE</option>
                      <option value="false">INACTIVE</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="font-mono bg-green-600 hover:bg-green-700">
                  CREATE TENANT
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tenants List */}
        <Card className="border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="font-mono">TENANTS LIST</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2">NAME</th>
                    <th className="text-left py-2">DOMAIN</th>
                    <th className="text-left py-2">CONTEXT</th>
                    <th className="text-left py-2">EXTENSIONS</th>
                    <th className="text-left py-2">STATUS</th>
                    <th className="text-left py-2">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-gray-300">
                      <td className="py-2">{tenant.name}</td>
                      <td className="py-2">{tenant.domain}</td>
                      <td className="py-2">{tenant.context}</td>
                      <td className="py-2">{tenant.extensions_count || 0}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs ${
                          tenant.active 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {tenant.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-2">
                        <Button
                          onClick={() => deleteTenant(tenant.id)}
                          size="sm"
                          variant="outline"
                          className="font-mono text-xs border-red-600 text-red-600 hover:bg-red-50"
                        >
                          DELETE
                        </Button>
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