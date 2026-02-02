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

export const removeUser = async (email, password) => {
  const { data } = await api.delete('/auth/remove-user', {
    data: { email, password }
  })
  return data?.data
}

export const removeUserByEmail = async (email) => {
  const { data } = await api.delete('/auth/remove-user-by-email', {
    data: { email }
  })
  return data?.data
}

export const getAllStudents = async () => {
  const { data } = await api.get('/auth/students')
  return data?.data?.students || []
}

export const getAllAdmins = async () => {
  const { data } = await api.get('/auth/admins')
  return data?.data?.admins || []
}

