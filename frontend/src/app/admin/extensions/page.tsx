'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Extension {
  id: number
  extension: string
  name: string
  tenant: {
    id: number
    name: string
  }
  active: boolean
}

interface Tenant {
  id: number
  name: string
  domain: string
}

export default function ExtensionsPage() {
  const [extensions, setExtensions] = useState<Extension[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    tenant_id: '',
    extension: '',
    name: '',
    secret: '',
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

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch extensions
      const extResponse = await fetch('https://sip.pbx.biz.id/api/extensions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Fetch tenants
      const tenantResponse = await fetch('https://sip.pbx.biz.id/api/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (extResponse.ok) {
        const extData = await extResponse.json()
        setExtensions(extData.data || [])
      }

      if (tenantResponse.ok) {
        const tenantData = await tenantResponse.json()
        setTenants(tenantData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://sip.pbx.biz.id/api/extensions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          tenant_id: '',
          extension: '',
          name: '',
          secret: '',
          context: 'default',
          active: true
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error creating extension:', error)
    }
  }

  const deleteExtension = async (id: number) => {
    if (!confirm('Are you sure you want to delete this extension?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://sip.pbx.biz.id/api/extensions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting extension:', error)
    }
  }

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({...formData, secret: result})
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
            <h1 className="text-2xl font-bold font-mono">EXTENSION MANAGEMENT</h1>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowForm(!showForm)}
                className="font-mono bg-green-600 hover:bg-green-700"
              >
                {showForm ? 'CANCEL' : 'ADD EXTENSION'}
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
        {/* Add Extension Form */}
        {showForm && (
          <Card className="border-2 border-green-600 mb-8">
            <CardHeader>
              <CardTitle className="font-mono">ADD NEW EXTENSION</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-mono font-bold mb-2">TENANT</label>
                    <select
                      required
                      value={formData.tenant_id}
                      onChange={(e) => setFormData({...formData, tenant_id: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-800 font-mono"
                    >
                      <option value="">SELECT TENANT</option>
                      {tenants.map(tenant => (
                        <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-bold mb-2">EXTENSION</label>
                    <input
                      type="text"
                      required
                      value={formData.extension}
                      onChange={(e) => setFormData({...formData, extension: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-800 font-mono"
                      placeholder="e.g. 1001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-bold mb-2">NAME</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-800 font-mono"
                      placeholder="User Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-bold mb-2">SECRET</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        required
                        value={formData.secret}
                        onChange={(e) => setFormData({...formData, secret: e.target.value})}
                        className="flex-1 px-3 py-2 border-2 border-gray-800 font-mono"
                        placeholder="Password"
                      />
                      <Button
                        type="button"
                        onClick={generateSecret}
                        className="font-mono bg-blue-600 hover:bg-blue-700"
                      >
                        GENERATE
                      </Button>
                    </div>
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
                  CREATE EXTENSION
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Extensions List */}
        <Card className="border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="font-mono">EXTENSIONS LIST</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2">EXTENSION</th>
                    <th className="text-left py-2">NAME</th>
                    <th className="text-left py-2">TENANT</th>
                    <th className="text-left py-2">STATUS</th>
                    <th className="text-left py-2">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {extensions.map((extension) => (
                    <tr key={extension.id} className="border-b border-gray-300">
                      <td className="py-2 font-bold">{extension.extension}</td>
                      <td className="py-2">{extension.name}</td>
                      <td className="py-2">{extension.tenant.name}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs ${
                          extension.active 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {extension.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-2">
                        <Button
                          onClick={() => deleteExtension(extension.id)}
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