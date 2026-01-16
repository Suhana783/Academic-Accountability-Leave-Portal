import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL
})

// Request interceptor - always add token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401, token is invalid or expired - clear local storage
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Could optionally redirect to /login here if needed
    }
    
    const message =
      error?.response?.data?.message || error?.response?.data?.error || error.message
    return Promise.reject(new Error(message))
  }
)

export default api
export const getBaseUrl = () => API_BASE_URL
