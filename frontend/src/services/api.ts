import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject bearer token on requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (email: string, password: string, name: string, role: string, department?: string, interestedFields?: string[]) =>
    api.post('/auth/register', { email, password, name, role, department, interestedFields }),

  getCurrentUser: () =>
    api.get('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
};

export const activityAPI = {
  uploadActivity: (formData: FormData) =>
    api.post('/activities/upload', formData),

  getMyActivities: (params?: { status?: string; type?: string }) =>
    api.get('/activities/my-activities', { params }),

  getActivityById: (id: string | number) =>
    api.get(`/activities/${id}`),

  getAllActivities: (params?: { status?: string; type?: string; studentId?: string | number; filterAssigned?: boolean }) =>
    api.get('/activities/all', { params }),

  reviewActivity: (id: string | number) =>
    api.post(`/activities/${id}/review`),

  approveActivity: (id: string | number, feedback?: string) =>
    api.post(`/activities/${id}/approve`, { feedback }),

  rejectActivity: (id: string | number, feedback: string) =>
    api.post(`/activities/${id}/reject`, { feedback }),

  requestRevision: (id: string | number, feedback: string) =>
    api.post(`/activities/${id}/reject`, { feedback }),

  resubmitActivity: (id: string | number, formData: FormData) =>
    api.put(`/activities/${id}/resubmit`, formData),

  deleteActivity: (id: string | number) =>
    api.delete(`/activities/${id}`),

  bulkApprove: (activityIds: (string | number)[], feedback?: string) =>
    api.post('/activities/bulk-approve', { activityIds, feedback }),
};

export const adminAPI = {
  getUsers: (params?: { role?: string; department?: string; search?: string }) =>
    api.get('/admin/users', { params }),

  createUser: (userData: any) =>
    api.post('/admin/users', userData),

  bulkImportUsers: (users: any[]) =>
    api.post('/admin/users/bulk', { users }),

  assignMentor: (studentId: string | number, mentorId: string | number | null) =>
    api.put(`/admin/users/${studentId}/assign-mentor`, { mentorId }),

  updateUser: (id: string | number, userData: any) =>
    api.put(`/admin/users/${id}`, userData),

  deactivateUser: (id: string | number) =>
    api.put(`/admin/users/${id}`, { isActive: false }),

  getDashboardStats: () =>
    api.get('/admin/dashboard-stats'),

  getReports: (period: string, department?: string) =>
    api.get('/admin/reports', { params: { period, department } }),

  getConfig: () =>
    api.get('/admin/config'),

  saveConfig: (config: any) =>
    api.post('/admin/config', config),

  getAuditLogs: (params?: { search?: string; action?: string }) =>
    api.get('/admin/audit-logs', { params }),
};

export const profileAPI = {
  updateProfile: (data: { name?: string; department?: string; phone?: string; program?: string }) =>
    api.put('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Notification store (client-side mock since backend uses email)
export const notificationAPI = {
  getNotifications: () => {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  },

  markAllRead: () => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const notifs = JSON.parse(stored).map((n: any) => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(notifs));
    }
  },

  markRead: (id: string) => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const notifs = JSON.parse(stored).map((n: any) =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(notifs));
    }
  },

  deleteNotification: (id: string) => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const notifs = JSON.parse(stored).filter((n: any) => n.id !== id);
      localStorage.setItem('notifications', JSON.stringify(notifs));
    }
  },

  addNotification: (notif: { title: string; message: string; type: string; link?: string }) => {
    const stored = localStorage.getItem('notifications');
    const notifs = stored ? JSON.parse(stored) : [];
    notifs.unshift({
      id: Date.now().toString(),
      ...notif,
      read: false,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('notifications', JSON.stringify(notifs.slice(0, 50)));
  },
};

export default api;
