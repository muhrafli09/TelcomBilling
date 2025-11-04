'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [step, setStep] = useState<'choice' | 'login' | 'register'>('choice')
  const [userName, setUserName] = useState('')
  const [waitTime, setWaitTime] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const router = useRouter()

  // Countdown timer effect
  useEffect(() => {
    if (waitTime > 0) {
      setIsBlocked(true)
      const timer = setInterval(() => {
        setWaitTime(prev => {
          if (prev <= 1) {
            setIsBlocked(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [waitTime])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.login(email, password)
      
      if (response.success && response.token && response.user) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        // Check if user must change password
        if (response.user.must_change_password) {
          router.push('/change-password')
        } else {
          // Redirect based on user role
          if (response.user.role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }
      } else {
        setError(response.message || 'Invalid password')
        if (response.waitTime) {
          setWaitTime(response.waitTime)
        }
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('choice')
    setEmail('')
    setPassword('')
    setError('')
    setWaitTime(0)
    setIsBlocked(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Pixel People Image - Full Width */}
      {step === 'choice' && (
        <div className="w-full bg-white p-8">
          <img 
            src="/pixel-people.png" 
            alt="Pixel People" 
            className="w-full max-w-2xl mx-auto h-64 object-contain"
            style={{imageRendering: 'pixelated'}}
          />
        </div>
      )}
      
      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="mb-8">
            {step === 'choice' ? (
              <div className="text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '2px', textTransform: 'uppercase'}}>
                  PBX.BIZ.ID
                </h1>
                <p className="text-gray-600" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                  SISTEM MONITORING TELECOM
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '2px', textTransform: 'uppercase'}}>
                  PBX.BIZ.ID
                </h1>
                <h2 className="text-lg font-bold text-gray-900 mb-1" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                  {step === 'login' ? 'SIGN IN' : 'REGISTER'}
                </h2>
                <p className="text-gray-600 text-sm" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                  {step === 'login' ? 'ENTER CREDENTIALS' : 'CONTACT ADMIN'}
                </p>
              </div>
            )}
          </div>

        <Card className="border-2 border-gray-800 shadow-lg bg-white">
          <CardContent className="p-6">
            {step === 'choice' ? (
              <div className="space-y-4">
                <Button
                  onClick={() => setStep('login')}
                  className="w-full py-3 font-bold bg-black hover:bg-gray-800 text-white border-2 border-gray-800"
                  style={{fontFamily: 'Courier New, monospace', letterSpacing: '2px', textTransform: 'uppercase'}}
                >
                  SIGN IN
                </Button>
                
                <div className="text-center">
                  <span className="text-gray-500 text-sm font-bold" style={{fontFamily: 'Courier New, monospace', letterSpacing: '2px'}}>OR</span>
                </div>
                
                <Button
                  onClick={() => setStep('register')}
                  variant="outline"
                  className="w-full py-3 font-bold border-2 border-gray-800 text-gray-900 hover:bg-gray-100"
                  style={{fontFamily: 'Courier New, monospace', letterSpacing: '2px', textTransform: 'uppercase'}}
                >
                  REGISTER
                </Button>
              </div>
            ) : step === 'login' ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="flex items-center mb-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-gray-600 hover:text-gray-900 font-mono"
                  >
                    ← Back
                  </button>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                    EMAIL
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="ENTER EMAIL"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value))
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-800 bg-white focus:outline-none focus:border-black"
                    style={{fontFamily: 'Courier New, monospace'}}
                    autoFocus
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2" style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}>
                    PASSWORD
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="ENTER PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-800 bg-white focus:outline-none focus:border-black"
                    style={{fontFamily: 'Courier New, monospace'}}
                  />
                </div>

                {error && (
                  <div className={`border-2 px-3 py-2 font-mono text-sm ${
                    isBlocked 
                      ? 'bg-yellow-100 border-yellow-800 text-yellow-800' 
                      : 'bg-red-100 border-red-800 text-red-800'
                  }`}>
                    {error}
                    {isBlocked && waitTime > 0 && (
                      <div className="mt-2 text-center">
                        <div className="text-lg font-bold">{waitTime}s</div>
                        <div className="text-xs">TUNGGU SEBELUM MENCOBA LAGI</div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !isValidEmail || !password || isBlocked}
                  className="w-full py-3 font-bold bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white border-2 border-gray-800"
                  style={{fontFamily: 'Courier New, monospace', letterSpacing: '2px', textTransform: 'uppercase'}}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-1">
                      <span>LOADING</span>
                      <div className="flex space-x-1">
                        <span className="animate-pulse">█</span>
                        <span className="animate-pulse" style={{animationDelay: '0.2s'}}>█</span>
                        <span className="animate-pulse" style={{animationDelay: '0.4s'}}>█</span>
                      </div>
                    </div>
                  ) : isBlocked ? `TUNGGU ${waitTime}S` : 'SIGN IN'}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:text-gray-900"
                    style={{fontFamily: 'Courier New, monospace', letterSpacing: '1px', textTransform: 'uppercase'}}
                  >
                    FORGOT PASSWORD?
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center mb-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-gray-600 hover:text-gray-900 font-mono"
                  >
                    ← Back
                  </button>
                </div>
                
                <div className="text-center py-6">
                  <div className="bg-gray-100 border-2 border-gray-800 p-4 mb-6">
                    <h3 className="font-mono font-bold mb-2">Registration Required</h3>
                    <p className="text-sm font-mono text-gray-600">
                      Contact administrator to create your account
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => setStep('login')}
                    className="w-full py-3 font-mono font-bold bg-black hover:bg-gray-800 text-white border-2 border-gray-800"
                  >
                    Already have account? Sign In
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

    </div>
  )
}