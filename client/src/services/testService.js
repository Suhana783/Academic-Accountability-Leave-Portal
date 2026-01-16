import api from './api'

export const createTest = async (payload) => {
  const { data } = await api.post('/test', payload)
  return data?.data?.test
}

export const getAllTests = async () => {
  const { data } = await api.get('/test')
  return data?.data?.tests || []
}

export const getTestById = async (id) => {
  const { data } = await api.get(`/test/${id}`)
  return data?.data?.test
}

export const getTestByLeave = async (leaveId) => {
  const { data } = await api.get(`/test/leave/${leaveId}`)
  return data?.data?.test
}

export const submitTest = async (id, payload) => {
  const { data } = await api.post(`/test/${id}/submit`, payload)
  return data?.data
}

export const getTestResult = async (id) => {
  const { data } = await api.get(`/test/${id}/result`)
  return data?.data?.result
}

export const getMyResults = async () => {
  const { data } = await api.get('/test/results/my-results')
  return data?.data?.results || []
}

export const getMyStatistics = async () => {
  const { data } = await api.get('/test/statistics/me')
  return data?.data?.statistics
}

export const getAllResults = async () => {
  const { data } = await api.get('/test/results/all')
  return data?.data?.results || []
}

export const getResultsByStudent = async (studentId) => {
  const { data } = await api.get(`/test/results/student/${studentId}`)
  return {
    results: data?.data?.results || [],
    statistics: data?.data?.statistics
  }
}
