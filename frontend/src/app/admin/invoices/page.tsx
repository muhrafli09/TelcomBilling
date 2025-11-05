'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Invoice {
  id: number
  invoice_number: string
  accountcode: string
  period_start: string
  period_end: string
  total_amount: number
  total_calls: number
  status: string
  sent_at: string
  due_date: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateData, setGenerateData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    accountcode: ''
  })
  const router = useRouter()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const token = localStorage.getItem('token')
      const payload = {
        month: generateData.month,
        year: generateData.year,
        ...(generateData.accountcode && { accountcode: generateData.accountcode })
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`${result.message}\n\n${result.results.join('\n')}`)
        fetchInvoices()
        setShowGenerateForm(false)
      } else {
        const error = await response.text()
        alert(`Error: ${error}`)
      }
    } catch (error) {
      console.error('Error generating invoices:', error)
      alert('Network error occurred')
    } finally {
      setGenerating(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        fetchInvoices()
      }
    } catch (error) {
      console.error('Error approving payment:', error)
    }
  }

  const handleReject = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        fetchInvoices()
      }
    } catch (error) {
      console.error('Error rejecting payment:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
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
              INVOICE MANAGEMENT
            </h1>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowGenerateForm(true)}
                className="font-mono bg-green-600 hover:bg-green-700 border-2 border-gray-800"
              >
                GENERATE INVOICE
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
        {/* Generate Invoice Form */}
        {showGenerateForm && (
          <Card className="border-2 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="font-mono text-lg">GENERATE INVOICE</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-mono font-bold mb-2">MONTH:</label>
                    <select
                      value={generateData.month}
                      onChange={(e) => setGenerateData({...generateData, month: parseInt(e.target.value)})}
                      className="w-full p-2 border-2 border-gray-800 font-mono"
                      required
                    >
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i+1} value={i+1}>
                          {new Date(0, i).toLocaleString('en', {month: 'long'})}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-bold mb-2">YEAR:</label>
                    <input
                      type="number"
                      value={generateData.year}
                      onChange={(e) => setGenerateData({...generateData, year: parseInt(e.target.value)})}
                      className="w-full p-2 border-2 border-gray-800 font-mono"
                      min="2020"
                      max="2030"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-bold mb-2">ACCOUNT CODE (Optional):</label>
                    <input
                      type="text"
                      value={generateData.accountcode}
                      onChange={(e) => setGenerateData({...generateData, accountcode: e.target.value})}
                      className="w-full p-2 border-2 border-gray-800 font-mono"
                      placeholder="Leave empty for all accounts"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={generating}
                    className="font-mono bg-green-600 hover:bg-green-700"
                  >
                    {generating ? 'GENERATING...' : 'GENERATE'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowGenerateForm(false)}
                    variant="outline"
                    className="font-mono border-2 border-gray-800"
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        {/* Invoices Table */}
        <Card className="border-2 border-gray-800">
          <CardHeader>
            <CardTitle className="font-mono text-lg">INVOICES ({invoices.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2">INVOICE #</th>
                    <th className="text-left py-2">ACCOUNT</th>
                    <th className="text-left py-2">PERIOD</th>
                    <th className="text-left py-2">AMOUNT</th>
                    <th className="text-left py-2">CALLS</th>
                    <th className="text-left py-2">STATUS</th>
                    <th className="text-left py-2">DUE DATE</th>
                    <th className="text-left py-2">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={invoice.id} className="border-b border-gray-300">
                      <td className="py-2">{invoice.invoice_number}</td>
                      <td className="py-2 font-bold text-blue-600">{invoice.accountcode}</td>
                      <td className="py-2">
                        {new Date(invoice.period_start).toLocaleDateString('id-ID')} - {new Date(invoice.period_end).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-2 font-bold text-green-600">{formatCurrency(invoice.total_amount)}</td>
                      <td className="py-2">{invoice.total_calls}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(invoice.status)}`}>
                          {invoice.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="py-2">
                        {invoice.status === 'pending_approval' && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleApprove(invoice.id)}
                              className="font-mono bg-green-600 hover:bg-green-700 text-xs mr-2"
                            >
                              APPROVE
                            </Button>
                            <Button
                              onClick={() => handleReject(invoice.id)}
                              variant="outline"
                              className="font-mono border-2 border-red-600 text-red-600 text-xs"
                            >
                              REJECT
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-mono">
                  NO INVOICES FOUND
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}