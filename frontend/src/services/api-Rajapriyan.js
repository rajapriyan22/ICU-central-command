import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token if exists
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('icu_user') || '{}');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle API errors consistently
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('icu_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = !error.response
      ? 'Cannot reach the server. Make sure the backend is running.'
      : (error.response.data?.message || error.message || 'Server Communication Error');
    return Promise.reject(new Error(message));
  }
);

// Service Methods
export const AuthService = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const DashboardService = {
  getSummary: () => api.get('/dashboard'),
  getDoctorDashboard: (username) => api.get('/doctor/dashboard', { params: { username } }),
  getNurseDashboard: (username) => api.get('/nurse/dashboard', { params: { username } }),
};

export const UserService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  toggleStatus: (id, active) => api.put(`/users/${id}/status`, null, { params: { active } }),
};

export const BedService = {
  getAll: (params) => api.get('/beds', { params }),
  getById: (id) => api.get(`/beds/${id}`),
  updateStatus: (id, data) => api.put(`/beds/${id}/status`, data),
  create: (data) => api.post('/beds', data),
  delete: (id) => api.delete(`/beds/${id}`),
};

export const PatientService = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  getDetails: (id) => api.get(`/patients/${id}/details`),
  create: (patientData, doctorId) => api.post('/patients', patientData, { params: { doctorId } }),
  update: (id, patientData) => api.put(`/patients/${id}`, patientData),
  delete: (id) => api.delete(`/patients/${id}`),
};

export const BedAssignmentService = {
  assign: (data) => api.post('/bed-assignments', data),
  release: (assignmentId, targetStatus = 'CLEANING') =>
    api.post(`/bed-assignments/${assignmentId}/release`, null, { params: { targetStatus } }),
  releaseByBedId: (bedId, targetStatus = 'CLEANING') =>
    api.post(`/bed-assignments/beds/${bedId}/release`, null, { params: { targetStatus } }),
  getActive: () => api.get('/bed-assignments/active'),
};

export const WardService = {
  getAll: () => api.get('/wards'),
  getById: (id) => api.get(`/wards/${id}`),
  getAvailability: () => api.get('/wards/availability'),
  create: (data) => api.post('/wards', data),
};

export const DoctorService = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
};

export const AlertService = {
  getAll: (category) => api.get('/alerts', { params: { category } }),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  create: (data) => api.post('/alerts', data),
};

export const VitalService = {
  getPatientVitals: (patientId) => api.get(`/vitals/${patientId}`),
  getLatest: (patientId) => api.get(`/vitals/${patientId}/latest`),
  getLiveDashboard: () => api.get('/vitals/live'),
  simulate: (patientId) => api.post(`/vitals/${patientId}/simulate`),
};

export default api;
