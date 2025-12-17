import { auth } from '../auth.js';
import { api } from '../api.js';

let events = [];
let bookings = [];
let stats = {};
let users = [];
let settings = {};

export async function renderOwnerDashboard() {
  const user = auth.getUser();
  
  try {
    [events, bookings, stats, users, settings] = await Promise.all([
      api.getEvents(),
      api.getAllBookings(),
      api.getStats(),
      api.getUsers(),
      api.getSettings()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="dashboard">
      ${renderSidebar(user)}
      <div class="main-content">
        <div class="page-header">
          <h1>Owner Dashboard</h1>
          <p>Full control over your club</p>
        </div>
        
        ${renderStats()}
        
        <div id="content-area">
          ${renderSettingsView()}
        </div>
      </div>
    </div>
    
    <div id="modal-container"></div>
  `;

  attachEventListeners();
}

function renderSidebar(user) {
  return `
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>Elite Club</h2>
        <div class="user-info">
          ${user.name}<br>
          <span class="role-badge">${user.role}</span>
        </div>
      </div>
      
      <ul class="nav-menu">
        <li class="nav-item">
          <a href="#" class="nav-link active" data-view="settings">
            ⚙️ Settings
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" data-view="events">
            📅 Events
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" data-view="bookings">
            🎫 Bookings
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" data-view="users">
            👥 Users
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" data-view="notifications">
            📢 Send Notification
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" onclick="event.preventDefault(); auth.logout()">
            🚪 Logout
          </a>
        </li>
      </ul>
    </div>
  `;
}

function renderStats() {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Events</h3>
        <div class="stat-value">${stats.totalEvents || 0}</div>
      </div>
      <div class="stat-card">
        <h3>Total Bookings</h3>
        <div class="stat-value">${stats.totalBookings || 0}</div>
      </div>
      <div class="stat-card">
        <h3>Total Revenue</h3>
        <div class="stat-value">₹${stats.totalRevenue || 0}</div>
      </div>
      <div class="stat-card">
        <h3>Total Users</h3>
        <div class="stat-value">${stats.totalUsers || 0}</div>
      </div>
    </div>
  `;
}

function renderSettingsView() {
  const maintenanceMode = settings.maintenance_mode === 'true';
  
  return `
    <div class="card">
      <div class="card-header">
        <h2>Club Settings</h2>
      </div>
      
      <form id="settings-form">
        <div class="form-group">
          <label>Club Name</label>
          <input type="text" name="club_name" value="${settings.club_name || ''}" required>
        </div>
        
        <div class="form-group">
          <label>Club Description</label>
          <textarea name="club_description" rows="3">${settings.club_description || ''}</textarea>
        </div>
        
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 12px;">
            <span>Maintenance Mode</span>
            <label class="toggle-switch">
              <input type="checkbox" id="maintenance-toggle" ${maintenanceMode ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </label>
          <p style="font-size: 14px; color: var(--text-light); margin-top: 8px;">
            When enabled, only owners can access the site. Users and admins will see a maintenance page.
          </p>
        </div>
        
        <button type="submit" class="btn btn-primary">Save Settings</button>
      </form>
    </div>
  `;
}

function renderEventsManagement() {
  return `
    <div class="card">
      <div class="card-header">
        <h2>Events Management</h2>
        <button class="btn btn-primary" onclick="showCreateEventModal()">
          + Create Event
        </button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Capacity</th>
              <th>Booked</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(event => `
              <tr>
                <td>${event.title}</td>
                <td>${event.date}</td>
                <td>${event.time}</td>
                <td>₹${event.price}</td>
                <td>${event.capacity}</td>
                <td>${event.booked}</td>
                <td>${event.created_by_name || 'N/A'}</td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick="showEditEventModal(${event.id})">Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteEvent(${event.id})">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderBookingsView() {
  return `
    <div class="card">
      <div class="card-header">
        <h2>All Bookings</h2>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Event</th>
              <th>Tickets</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(booking => `
              <tr>
                <td>${booking.user_name}</td>
                <td>${booking.user_email}</td>
                <td>${booking.event_title}</td>
                <td>${booking.tickets}</td>
                <td>₹${booking.total_price}</td>
                <td><span style="color: var(--success); font-weight: 600;">${booking.payment_status}</span></td>
                <td>${new Date(booking.booking_date).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderUsersView() {
  return `
    <div class="card">
      <div class="card-header">
        <h2>User Management</h2>
        <button class="btn btn-primary" onclick="showCreateAdminModal()">
          + Create Admin
        </button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="role-badge">${user.role}</span></td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <select onchange="changeUserRole(${user.id}, this.value)" style="padding: 6px; border-radius: 4px;">
                    <option value="">Change Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                  <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderNotificationsView() {
  return `
    <div class="card">
      <div class="card-header">
        <h2>Send Notification to All Users</h2>
      </div>
      <form id="notification-form">
        <div class="form-group">
          <label>Message</label>
          <textarea name="message" rows="4" style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px;" required></textarea>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select name="type" style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px;">
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Send Notification</button>
      </form>
    </div>
  `;
}

function attachEventListeners() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.target.dataset.view;
      if (!view) return;

      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');

      const contentArea = document.getElementById('content-area');
      switch (view) {
        case 'settings':
          contentArea.innerHTML = renderSettingsView();
          setTimeout(() => {
            document.getElementById('settings-form').addEventListener('submit', handleSaveSettings);
            document.getElementById('maintenance-toggle').addEventListener('change', handleMaintenanceToggle);
          }, 0);
          break;
        case 'events':
          contentArea.innerHTML = renderEventsManagement();
          break;
        case 'bookings':
          contentArea.innerHTML = renderBookingsView();
          break;
        case 'users':
          contentArea.innerHTML = renderUsersView();
          break;
        case 'notifications':
          contentArea.innerHTML = renderNotificationsView();
          setTimeout(() => {
            document.getElementById('notification-form').addEventListener('submit', handleSendNotification);
          }, 0);
          break;
      }
    });
  });

  // Attach settings form listener
  setTimeout(() => {
    const settingsForm = document.getElementById('settings-form');
    const maintenanceToggle = document.getElementById('maintenance-toggle');
    
    if (settingsForm) {
      settingsForm.addEventListener('submit', handleSaveSettings);
    }
    if (maintenanceToggle) {
      maintenanceToggle.addEventListener('change', handleMaintenanceToggle);
    }
  }, 0);
}

async function handleSaveSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  try {
    await api.updateSetting('club_name', formData.get('club_name'));
    await api.updateSetting('club_description', formData.get('club_description'));
    alert('Settings saved successfully!');
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function handleMaintenanceToggle(e) {
  const enabled = e.target.checked;
  
  try {
    await api.toggleMaintenance(enabled);
    alert(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    alert('Error: ' + error.message);
    e.target.checked = !enabled;
  }
}

window.showCreateEventModal = function() {
  const modal = document.getElementById('modal-container');
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Create Event</h2>
          <button class="close-btn" onclick="closeModal()">×</button>
        </div>
        <form id="event-form">
          <div class="form-group">
            <label>Title</label>
            <input type="text" name="title" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea name="description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" name="date" required>
          </div>
          <div class="form-group">
            <label>Time</label>
            <input type="time" name="time" required>
          </div>
          <div class="form-group">
            <label>Price (₹)</label>
            <input type="number" name="price" required min="0">
          </div>
          <div class="form-group">
            <label>Capacity</label>
            <input type="number" name="capacity" required min="1">
          </div>
          <button type="submit" class="btn btn-primary">Create Event</button>
        </form>
      </div>
    </div>
  `;
  
  document.getElementById('event-form').addEventListener('submit', handleCreateEvent);
};

window.showEditEventModal = function(eventId) {
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  const modal = document.getElementById('modal-container');
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Edit Event</h2>
          <button class="close-btn" onclick="closeModal()">×</button>
        </div>
        <form id="event-form" data-event-id="${eventId}">
          <div class="form-group">
            <label>Title</label>
            <input type="text" name="title" value="${event.title}" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea name="description" rows="3">${event.description || ''}</textarea>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" name="date" value="${event.date}" required>
          </div>
          <div class="form-group">
            <label>Time</label>
            <input type="time" name="time" value="${event.time}" required>
          </div>
          <div class="form-group">
            <label>Price (₹)</label>
            <input type="number" name="price" value="${event.price}" required min="0">
          </div>
          <div class="form-group">
            <label>Capacity</label>
            <input type="number" name="capacity" value="${event.capacity}" required min="1">
          </div>
          <button type="submit" class="btn btn-primary">Update Event</button>
        </form>
      </div>
    </div>
  `;
  
  document.getElementById('event-form').addEventListener('submit', handleUpdateEvent);
};

window.showCreateAdminModal = function() {
  const modal = document.getElementById('modal-container');
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Create Admin</h2>
          <button class="close-btn" onclick="closeModal()">×</button>
        </div>
        <form id="admin-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" name="name" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" required minlength="6">
          </div>
          <button type="submit" class="btn btn-primary">Create Admin</button>
        </form>
      </div>
    </div>
  `;
  
  document.getElementById('admin-form').addEventListener('submit', handleCreateAdmin);
};

window.closeModal = function() {
  document.getElementById('modal-container').innerHTML = '';
};

async function handleCreateEvent(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    await api.createEvent(data);
    closeModal();
    renderOwnerDashboard();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function handleUpdateEvent(e) {
  e.preventDefault();
  const eventId = e.target.dataset.eventId;
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    await api.updateEvent(eventId, data);
    closeModal();
    renderOwnerDashboard();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function handleCreateAdmin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    await api.createAdmin(data);
    closeModal();
    renderOwnerDashboard();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

window.deleteEvent = async function(eventId) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  
  try {
    await api.deleteEvent(eventId);
    renderOwnerDashboard();
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

window.changeUserRole = async function(userId, role) {
  if (!role) return;
  if (!confirm(`Change user role to ${role}?`)) return;
  
  try {
    await api.updateUserRole(userId, role);
    renderOwnerDashboard();
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

window.deleteUser = async function(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  
  try {
    await api.deleteUser(userId);
    renderOwnerDashboard();
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

async function handleSendNotification(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    await api.broadcastNotification(data);
    alert('Notification sent successfully!');
    e.target.reset();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

window.auth = auth;
