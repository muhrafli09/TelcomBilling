'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CdrRecord {
  id: number
  calldate: string
  src: string
  dst: string
  duration: number
  billsec: number
  disposition: string
  cost: number
  accountcode: string
  userfield: string
}

interface Tenant {
  id: number
  name: string
  context: string
}

export default function CdrPage() {
  const [cdrs, setCdrs] = useState<CdrRecord[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    src: '',
    dst: '',
    type: ''
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

  const fetchData = async (page = 1) => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch CDRs
      const cdrParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) cdrParams.append(key, value)
      })
      cdrParams.append('page', page.toString())
      
      const cdrResponse = await fetch(`https://sip.pbx.biz.id/api/cdr?${cdrParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (cdrResponse.ok) {
        const cdrData = await cdrResponse.json()
        setCdrs(cdrData.data || [])
        setPagination({
          current_page: cdrData.current_page || 1,
          last_page: cdrData.last_page || 1,
          total: cdrData.total || 0
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setLoading(true)
    fetchData()
  }

  const clearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      src: '',
      dst: '',
      type: ''
    })
    setLoading(true)
    fetchData()
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
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getDispositionColor = (disposition: string) => {
    switch (disposition) {
      case 'ANSWERED': return 'text-green-600 bg-green-100'
      case 'BUSY': return 'text-yellow-600 bg-yellow-100'
      case 'NO ANSWER': return 'text-orange-600 bg-orange-100'
      case 'FAILED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center font-mono">LOADING CDR...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold font-mono">CDR LOGS</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="border-2 border-blue-600 mb-8">
          <CardHeader>
            <CardTitle className="font-mono">FILTERS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              <div>
                <label className="block text-sm font-mono font-bold mb-2">START DATE</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-800 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-mono font-bold mb-2">END DATE</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-800 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-mono font-bold mb-2">SOURCE</label>
                <input
                  type="text"
                  value={filters.src}
                  onChange={(e) => handleFilterChange('src', e.target.value)}
                  placeholder="Extension"
                  className="w-full px-3 py-2 border-2 border-gray-800 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-mono font-bold mb-2">DESTINATION</label>
                <input
                  type="text"
                  value={filters.dst}
                  onChange={(e) => handleFilterChange('dst', e.target.value)}
                  placeholder="Phone number"
                  className="w-full px-3 py-2 border-2 border-gray-800 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-mono font-bold mb-2">CALL TYPE</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-800 font-mono text-sm"
                >
                  <option value="">ALL TYPES</option>
                  <option value="Domestic">DOMESTIC</option>
                  <option value="International">INTERNATIONAL</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4 mt-4">
              <Button onClick={applyFilters} className="font-mono bg-blue-600 hover:bg-blue-700">
                APPLY FILTERS
              </Button>
              <Button onClick={clearFilters} variant="outline" className="font-mono border-2 border-gray-800">
                CLEAR FILTERS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CDR Table */}
        <Card className="border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="font-mono">CALL DETAIL RECORDS ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2">DATE/TIME</th>
                    <th className="text-left py-2">ACCOUNT CODE</th>
                    <th className="text-left py-2">SRC</th>
                    <th className="text-left py-2">DST</th>
                    <th className="text-left py-2">DURATION</th>
                    <th className="text-left py-2">BILLSEC</th>
                    <th className="text-left py-2">TYPE</th>
                    <th className="text-left py-2">STATUS</th>
                    <th className="text-left py-2">COST</th>
                  </tr>
                </thead>
                <tbody>
                  {cdrs.map((cdr) => (
                    <tr key={cdr.id} className="border-b border-gray-300 hover:bg-gray-50">
                      <td className="py-2">{new Date(cdr.calldate).toLocaleString()}</td>
                      <td className="py-2 font-bold text-blue-600">{cdr.accountcode}</td>
                      <td className="py-2 font-bold">{cdr.src}</td>
                      <td className="py-2">{cdr.dst}</td>
                      <td className="py-2">{formatDuration(cdr.duration)}</td>
                      <td className="py-2">{formatDuration(cdr.billsec)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          cdr.userfield === 'Domestic' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {cdr.userfield || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs rounded ${getDispositionColor(cdr.disposition)}`}>
                          {cdr.disposition}
                        </span>
                      </td>
                      <td className="py-2 font-bold text-green-600">
                        {formatCurrency(cdr.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cdrs.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-mono">
                  NO CDR RECORDS FOUND
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-gray-800">
                <div className="font-mono text-sm">
                  Page {pagination.current_page} of {pagination.last_page} (Total: {pagination.total} records)
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => fetchData(pagination.current_page - 1)}
                    disabled={pagination.current_page <= 1}
                    variant="outline"
                    className="font-mono border-2 border-gray-800"
                  >
                    PREV
                  </Button>
                  <Button
                    onClick={() => fetchData(pagination.current_page + 1)}
                    disabled={pagination.current_page >= pagination.last_page}
                    variant="outline"
                    className="font-mono border-2 border-gray-800"
                  >
                    NEXT
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}