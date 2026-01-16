import api from './api'

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data?.data
}

export const getMe = async () => {
  const { data } = await api.get('/auth/me')
  return data?.data?.user
}

export const createStudent = async (payload) => {
  const { data } = await api.post('/auth/create-student', payload)
  return data?.data
}

export const createAdmin = async (payload) => {
  const { data } = await api.post('/auth/create-admin', payload)
  return data?.data
}
