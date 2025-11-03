const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

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
  }
  message?: string
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
      name: null
    }
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    return response.json()
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