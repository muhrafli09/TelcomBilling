'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Invoice {
  id: number
  invoice_number: string
  period_start: string
  period_end: string
  total_amount: number
  total_calls: number
  status: string
  due_date: string
}

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://sip.pbx.biz.id/api/customer/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setInvoices(data || [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentRequest = async (id: number) => {
    if (!confirm('Submit payment request for this invoice?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://sip.pbx.biz.id/api/invoices/${id}/request-payment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        alert('Payment request submitted! Waiting for admin approval.')
        fetchInvoices()
      }
    } catch (error) {
      console.error('Error requesting payment:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📄</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">My Invoices</h1>
                <p className="text-sm text-slate-500">View and manage your billing invoices</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg transition-all"
            >
              🏠 Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Invoices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="bg-white shadow-lg border-0 rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-800">{invoice.invoice_number}</CardTitle>
                    <p className="text-sm text-slate-500">
                      {new Date(invoice.period_start).toLocaleDateString('id-ID')} - {new Date(invoice.period_end).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Amount</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Calls</span>
                    <span className="font-medium text-slate-800">{invoice.total_calls}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Due Date</span>
                    <span className="font-medium text-slate-800">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>
                  
                  {invoice.status === 'sent' && (
                    <Button
                      onClick={() => handlePaymentRequest(invoice.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                    >
                      💳 Request Payment
                    </Button>
                  )}
                  
                  {invoice.status === 'pending_approval' && (
                    <div className="w-full bg-yellow-100 text-yellow-800 text-center py-2 rounded-lg mt-4 text-sm font-medium">
                      ⏳ Waiting for Admin Approval
                    </div>
                  )}
                  
                  {invoice.status === 'paid' && (
                    <div className="w-full bg-green-100 text-green-800 text-center py-2 rounded-lg mt-4 text-sm font-medium">
                      ✅ Paid
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {invoices.length === 0 && (
          <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
            <CardContent className="p-12 text-center">
              <span className="text-6xl mb-4 block">📄</span>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Invoices Found</h3>
              <p className="text-slate-500">Your invoices will appear here once they are generated.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}