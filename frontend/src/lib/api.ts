const API_BASE_URL = 'https://sip.pbx.biz.id/api'
console.log('API_BASE_URL:', API_BASE_URL)

interface CheckEmailResponse {
  exists: boolean
  name?: string
}

interface LoginResponse {
  success: boolean
  token?: string
  user?: {
    id: number
    name: string
    email: string
    role: string
    account_codes: string[]
    must_change_password: boolean
  }
  message?: string
  waitTime?: number
}

// Rate limiting storage
const getFailedAttempts = (): number => {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('loginFailedAttempts') || '0')
}

const setFailedAttempts = (count: number): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('loginFailedAttempts', count.toString())
}

const getLastFailedTime = (): number => {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('lastFailedTime') || '0')
}

const setLastFailedTime = (time: number): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('lastFailedTime', time.toString())
}

const calculateWaitTime = (attempts: number): number => {
  if (attempts <= 2) return 0
  return Math.min(Math.pow(2, attempts - 2) * 5, 300) // Max 5 minutes
}

const checkRateLimit = (): { canAttempt: boolean; waitTime: number } => {
  const attempts = getFailedAttempts()
  const lastFailed = getLastFailedTime()
  const now = Date.now()
  
  if (attempts <= 2) return { canAttempt: true, waitTime: 0 }
  
  const waitTime = calculateWaitTime(attempts)
  const timeElapsed = (now - lastFailed) / 1000
  
  if (timeElapsed >= waitTime) {
    return { canAttempt: true, waitTime: 0 }
  }
  
  return { canAttempt: false, waitTime: Math.ceil(waitTime - timeElapsed) }
}

export const api = {
  async checkEmail(email: string): Promise<CheckEmailResponse> {
    // Use login endpoint with invalid password to check if email exists
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password: 'check_email_only' }),
    })
    
    const result = await response.json()
    
    // If we get "Invalid password", email exists
    // If we get "Email not found", email doesn't exist
    return {
      exists: result.message === 'Invalid password',
      name: undefined
    }
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    // Check rate limit
    const { canAttempt, waitTime } = checkRateLimit()
    
    if (!canAttempt) {
      return {
        success: false,
        message: `Terlalu banyak percobaan login. Coba lagi dalam ${waitTime} detik.`,
        waitTime
      }
    }

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    const result = await response.json()
    
    if (result.success) {
      // Reset failed attempts on successful login
      setFailedAttempts(0)
    } else {
      // Increment failed attempts
      const attempts = getFailedAttempts() + 1
      setFailedAttempts(attempts)
      setLastFailedTime(Date.now())
      
      // Add wait time info for next attempt
      if (attempts > 2) {
        const nextWaitTime = calculateWaitTime(attempts)
        result.waitTime = nextWaitTime
        result.message = `Login gagal. Coba lagi dalam ${nextWaitTime} detik.`
      }
    }
    
    return result
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('token')
    if (token) {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  async getDashboard(): Promise<any> {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/customer/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    return response.json()
  }
}