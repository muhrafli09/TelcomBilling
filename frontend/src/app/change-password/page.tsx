'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }
    
    const userData = JSON.parse(user)
    if (!userData.must_change_password) {
      router.push(userData.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Password baru tidak cocok')
      setLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Password berhasil diubah! Redirecting...')
        
        // Update user data
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        user.must_change_password = false
        localStorage.setItem('user', JSON.stringify(user))
        
        setTimeout(() => {
          router.push(user.role === 'admin' ? '/admin' : '/dashboard')
        }, 2000)
      } else {
        setError(result.message || 'Gagal mengubah password')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '2px', textTransform: 'uppercase'}}>
            PBX.BIZ.ID
          </h1>
          <h2 className="text-lg font-bold text-red-600 mb-1" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
            GANTI PASSWORD
          </h2>
          <p className="text-gray-600 text-sm" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
            PASSWORD DEFAULT HARUS DIGANTI
          </p>
        </div>

        <Card className="border-2 border-red-600 shadow-lg bg-white">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                  PASSWORD LAMA
                </label>
                <input
                  type="password"
                  required
                  placeholder="MASUKKAN PASSWORD LAMA"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-800 bg-white focus:outline-none focus:border-red-600"
                  style={{fontFamily: 'Courier New, monospace'}}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                  PASSWORD BARU
                </label>
                <input
                  type="password"
                  required
                  placeholder="MASUKKAN PASSWORD BARU"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-800 bg-white focus:outline-none focus:border-red-600"
                  style={{fontFamily: 'Courier New, monospace'}}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                  KONFIRMASI PASSWORD
                </label>
                <input
                  type="password"
                  required
                  placeholder="ULANGI PASSWORD BARU"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-800 bg-white focus:outline-none focus:border-red-600"
                  style={{fontFamily: 'Courier New, monospace'}}
                />
              </div>

              {error && (
                <div className="bg-red-100 border-2 border-red-800 text-red-800 px-3 py-2 font-mono text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border-2 border-green-800 text-green-800 px-3 py-2 font-mono text-sm">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full py-3 font-bold bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white border-2 border-red-600"
                style={{fontFamily: 'Courier New, monospace', letterSpacing: '2px', textTransform: 'uppercase'}}
              >
                {loading ? 'MENGUBAH...' : 'GANTI PASSWORD'}
              </Button>

              <div className="bg-yellow-100 border-2 border-yellow-600 p-3 text-sm font-mono">
                <div className="font-bold text-yellow-800 mb-1">PERSYARATAN PASSWORD:</div>
                <ul className="text-yellow-700 text-xs space-y-1">
                  <li>• Minimal 8 karakter</li>
                  <li>• Kombinasi huruf dan angka</li>
                  <li>• Hindari password yang mudah ditebak</li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}