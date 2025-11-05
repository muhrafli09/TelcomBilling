'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RateCard {
  id: number
  destination_prefix: string
  destination_name: string
  rate_per_minute: number
  minimum_duration: number
  billing_increment: number
  connection_fee: number
  active: boolean
}

export default function RatesPage() {
  const [rates, setRates] = useState<RateCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRate, setEditingRate] = useState<RateCard | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    destination_prefix: '',
    destination_name: '',
    rate_per_minute: '',
    minimum_duration: '1',
    billing_increment: '1',
    connection_fee: '0'
  })

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://sip.pbx.biz.id/api/rates', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setRates(data)
      }
    } catch (error) {
      console.error('Error fetching rates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = editingRate 
        ? `https://sip.pbx.biz.id/api/rates/${editingRate.id}`
        : 'https://sip.pbx.biz.id/api/rates'
      
      const response = await fetch(url, {
        method: editingRate ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchRates()
        setShowForm(false)
        setEditingRate(null)
        setFormData({
          destination_prefix: '',
          destination_name: '',
          rate_per_minute: '',
          minimum_duration: '1',
          billing_increment: '1',
          connection_fee: '0'
        })
      }
    } catch (error) {
      console.error('Error saving rate:', error)
    }
  }

  const handleEdit = (rate: RateCard) => {
    setEditingRate(rate)
    setFormData({
      destination_prefix: rate.destination_prefix,
      destination_name: rate.destination_name,
      rate_per_minute: rate.rate_per_minute.toString(),
      minimum_duration: rate.minimum_duration.toString(),
      billing_increment: rate.billing_increment.toString(),
      connection_fee: rate.connection_fee.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('DELETE THIS RATE?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://sip.pbx.biz.id/api/rates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) fetchRates()
    } catch (error) {
      console.error('Error deleting rate:', error)
    }
  }

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
              RATE MANAGEMENT
            </h1>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowForm(true)}
                className="font-bold bg-green-600 hover:bg-green-700 border-2 border-gray-800"
                style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
              >
                ADD RATE
              </Button>
              <Button
                onClick={() => router.push('/admin')}
                variant="outline"
                className="font-bold border-2 border-gray-800"
                style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
              >
                BACK TO DASHBOARD
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add/Edit Form */}
        {showForm && (
          <Card className="border-2 border-gray-800 bg-white mb-8">
            <CardHeader className="border-b-2 border-gray-300">
              <CardTitle className="font-bold" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                {editingRate ? 'EDIT RATE' : 'ADD NEW RATE'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                    DESTINATION PREFIX
                  </label>
                  <input
                    type="text"
                    value={formData.destination_prefix}
                    onChange={(e) => setFormData({...formData, destination_prefix: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-800 bg-white focus:outline-none focus:border-black"
                    style={{fontFamily: 'Courier New, monospace'}}
                    placeholder="E.G., 62811, 1, 44"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                    DESTINATION NAME
                  </label>
                  <input
                    type="text"
                    value={formData.destination_name}
                    onChange={(e) => setFormData({...formData, destination_name: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-800 bg-white focus:outline-none focus:border-black"
                    style={{fontFamily: 'Courier New, monospace'}}
                    placeholder="E.G., INDONESIA TELKOMSEL"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                    RATE PER MINUTE (RP)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate_per_minute}
                    onChange={(e) => setFormData({...formData, rate_per_minute: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-800 bg-white focus:outline-none focus:border-black"
                    style={{fontFamily: 'Courier New, monospace'}}
                    placeholder="150.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                    CONNECTION FEE (RP)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.connection_fee}
                    onChange={(e) => setFormData({...formData, connection_fee: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-800 bg-white focus:outline-none focus:border-black"
                    style={{fontFamily: 'Courier New, monospace'}}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                    MINIMUM DURATION (SEC)
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_duration}
                    onChange={(e) => setFormData({...formData, minimum_duration: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-800 bg-white focus:outline-none focus:border-black"
                    style={{fontFamily: 'Courier New, monospace'}}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                    BILLING INCREMENT (SEC)
                  </label>
                  <input
                    type="number"
                    value={formData.billing_increment}
                    onChange={(e) => setFormData({...formData, billing_increment: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-800 bg-white focus:outline-none focus:border-black"
                    style={{fontFamily: 'Courier New, monospace'}}
                  />
                </div>
                <div className="md:col-span-2 flex space-x-4">
                  <Button 
                    type="submit" 
                    className="font-bold bg-blue-600 hover:bg-blue-700 border-2 border-gray-800"
                    style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
                  >
                    {editingRate ? 'UPDATE RATE' : 'ADD RATE'}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {setShowForm(false); setEditingRate(null)}}
                    variant="outline"
                    className="font-bold border-2 border-gray-800"
                    style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Rates Table */}
        <Card className="border-2 border-gray-800 bg-white">
          <CardHeader>
            <CardTitle className="font-bold" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
              RATE CARDS ({rates.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2 px-4">PREFIX</th>
                    <th className="text-left py-2 px-4">DESTINATION</th>
                    <th className="text-left py-2 px-4">RATE/MIN</th>
                    <th className="text-left py-2 px-4">CONN FEE</th>
                    <th className="text-left py-2 px-4">MIN DUR</th>
                    <th className="text-left py-2 px-4">STATUS</th>
                    <th className="text-left py-2 px-4">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-b border-gray-300">
                      <td className="py-2 px-4 font-bold">{rate.destination_prefix}</td>
                      <td className="py-2 px-4">{rate.destination_name}</td>
                      <td className="py-2 px-4 font-bold text-green-600">RP {rate.rate_per_minute.toLocaleString()}</td>
                      <td className="py-2 px-4">RP {rate.connection_fee.toLocaleString()}</td>
                      <td className="py-2 px-4">{rate.minimum_duration}S</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 text-xs rounded ${
                          rate.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {rate.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEdit(rate)}
                            className="font-mono bg-blue-600 hover:bg-blue-700 text-xs"
                          >
                            EDIT
                          </Button>
                          <Button
                            onClick={() => handleDelete(rate.id)}
                            variant="outline"
                            className="font-mono border-2 border-red-600 text-red-600 text-xs"
                          >
                            DELETE
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rates.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-mono">
                  NO RATES FOUND
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}