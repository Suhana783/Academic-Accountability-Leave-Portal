import api from './api'

export const applyLeave = async (payload) => {
  const { data } = await api.post('/leave', payload)
  return data?.data?.leave
}

export const getMyLeaves = async () => {
  const { data } = await api.get('/leave/my-leaves')
  return data?.data?.leaves || []
}

export const getLeave = async (id) => {
  const { data } = await api.get(`/leave/${id}`)
  return data?.data?.leave
}

export const getAllLeaves = async (params = {}) => {
  const { data } = await api.get('/leave', { params })
  return data?.data?.leaves || []
}

export const updateLeaveStatus = async (id, payload) => {
  const { data } = await api.put(`/leave/${id}/status`, payload)
  return data?.data?.leave
}

export const deleteLeave = async (id) => {
  await api.delete(`/leave/${id}`)
}

export const updateLeave = async (id, payload) => {
  const { data } = await api.put(`/leave/${id}`, payload)
  return data?.data?.leave
}
