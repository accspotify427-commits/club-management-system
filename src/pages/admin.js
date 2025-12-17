import { auth } from '../auth.js';
import { api } from '../api.js';

let events = [];
let bookings = [];
let stats = {};

export async function renderAdminDashboard() {
  const user = auth.getUser();
  
  try {
    [events, bookings, stats] = await Promise.all([
      api.getEvents(),
      api.getAllBookings(),
      api.getStats()
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
          <h1>Admin Dashboard</h1>
          <p>Manage events and bookings</p>
        </div>
        
        ${renderStats()}
        
        <div id="content-area">
          ${renderEventsManagement()}
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
          <a href="#" class="nav-link active" data-view="events">
            📅 Events
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" data-view="bookings">
            🎫 Bookings
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
        case 'events':
          contentArea.innerHTML = renderEventsManagement();
          break;
        case 'bookings':
          contentArea.innerHTML = renderBookingsView();
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
    renderAdminDashboard();
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
    renderAdminDashboard();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

window.deleteEvent = async function(eventId) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  
  try {
    await api.deleteEvent(eventId);
    renderAdminDashboard();
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
