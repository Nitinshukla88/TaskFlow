import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  searchUsers: (q) => api.get('/auth/users/search', { params: { q } })
}

export const boardAPI = {
  getAll: () => api.get('/boards'),
  getOne: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
  addMember: (id, userId) => api.post(`/boards/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/boards/${id}/members/${userId}`),
  getActivities: (id, params) => api.get(`/boards/${id}/activities`, { params })
}

export const listAPI = {
  create: (data) => api.post('/lists', data),
  update: (id, data) => api.put(`/lists/${id}`, data),
  delete: (id) => api.delete(`/lists/${id}`),
  reorder: (listPositions) => api.put('/lists/reorder/positions', { listPositions })
}

export const taskAPI = {
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  move: (id, data) => api.put(`/tasks/${id}/move`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  search: (boardId, params) => api.get(`/tasks/board/${boardId}/search`, { params }),
  reorder: (taskPositions) => api.put('/tasks/reorder/positions', { taskPositions })
}

export default api