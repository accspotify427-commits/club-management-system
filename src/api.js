import { auth } from './auth.js';

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = auth.getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (response.status === 401) {
    auth.logout();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Events
  getEvents: () => request('/events'),
  getEvent: (id) => request(`/events/${id}`),

  // Bookings
  createBooking: (data) => request('/bookings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getMyBookings: () => request('/bookings/my-bookings'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Admin
  createEvent: (data) => request('/admin/events', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateEvent: (id, data) => request(`/admin/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteEvent: (id) => request(`/admin/events/${id}`, { method: 'DELETE' }),
  getAllBookings: () => request('/admin/bookings'),
  getStats: () => request('/admin/stats'),
  broadcastNotification: (data) => request('/admin/notifications/broadcast', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Owner
  getSettings: () => request('/owner/settings'),
  updateSetting: (key, value) => request(`/owner/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value })
  }),
  toggleMaintenance: (enabled) => request('/owner/maintenance', {
    method: 'POST',
    body: JSON.stringify({ enabled })
  }),
  getUsers: () => request('/owner/users'),
  createAdmin: (data) => request('/owner/admins', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateUserRole: (id, role) => request(`/owner/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  }),
  deleteUser: (id) => request(`/owner/users/${id}`, { method: 'DELETE' })
};
