import { auth } from '../auth.js';
import { api } from '../api.js';

let events = [];
let bookings = [];
let notifications = [];

export async function renderUserDashboard() {
  const user = auth.getUser();
  
  try {
    [events, bookings, notifications] = await Promise.all([
      api.getEvents(),
      api.getMyBookings(),
      api.getNotifications()
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
          <h1>Welcome, ${user.name}!</h1>
          <p>Discover and book exclusive club events</p>
        </div>
        
        <div id="content-area">
          ${renderEventsView()}
        </div>
      </div>
    </div>
  `;

  attachEventListeners();
}

function renderSidebar(user) {
  const unreadCount = notifications.filter(n => !n.read).length;
  
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
            🎫 My Bookings
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" data-view="notifications">
            🔔 Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}
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

function renderEventsView() {
  if (events.length === 0) {
    return '<div class="card"><p>No events available at the moment.</p></div>';
  }

  return `
    <div class="events-grid">
      ${events.map(event => `
        <div class="event-card">
          <div class="event-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
          <div class="event-content">
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${event.description || 'No description'}</p>
            
            <div class="event-meta">
              <div class="event-meta-item">
                <span class="event-meta-label">Date</span>
                <span class="event-meta-value">${event.date}</span>
              </div>
              <div class="event-meta-item">
                <span class="event-meta-label">Time</span>
                <span class="event-meta-value">${event.time}</span>
              </div>
            </div>
            
            <div class="event-price">₹${event.price}</div>
            
            <div class="event-capacity">
              ${event.booked} / ${event.capacity} tickets booked
            </div>
            
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(event.booked / event.capacity) * 100}%"></div>
            </div>
            
            ${event.booked < event.capacity 
              ? `<button class="btn btn-primary" onclick="bookEvent(${event.id})">Book Now</button>`
              : `<button class="btn btn-primary" disabled>Sold Out</button>`
            }
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderBookingsView() {
  if (bookings.length === 0) {
    return '<div class="card"><p>You haven\'t made any bookings yet.</p></div>';
  }

  return `
    <div class="card">
      <div class="card-header">
        <h2>My Bookings</h2>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Time</th>
              <th>Tickets</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(booking => `
              <tr>
                <td>${booking.title}</td>
                <td>${booking.date}</td>
                <td>${booking.time}</td>
                <td>${booking.tickets}</td>
                <td>₹${booking.total_price}</td>
                <td><span style="color: var(--success); font-weight: 600;">${booking.payment_status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderNotificationsView() {
  if (notifications.length === 0) {
    return '<div class="card"><p>No notifications yet.</p></div>';
  }

  return `
    <div class="card">
      <div class="card-header">
        <h2>Notifications</h2>
        <button class="btn btn-sm btn-primary" onclick="markAllNotificationsRead()">
          Mark All Read
        </button>
      </div>
      <div class="notifications-list">
        ${notifications.map(notif => `
          <div class="notification-item ${!notif.read ? 'unread' : ''} ${notif.type}">
            <div class="notification-message">${notif.message}</div>
            <div class="notification-time">${new Date(notif.created_at).toLocaleString()}</div>
          </div>
        `).join('')}
      </div>
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
          contentArea.innerHTML = renderEventsView();
          break;
        case 'bookings':
          contentArea.innerHTML = renderBookingsView();
          break;
        case 'notifications':
          contentArea.innerHTML = renderNotificationsView();
          break;
      }
    });
  });
}

window.bookEvent = async function(eventId) {
  const tickets = prompt('How many tickets would you like to book?', '1');
  if (!tickets || tickets < 1) return;

  try {
    await api.createBooking({ event_id: eventId, tickets: parseInt(tickets) });
    alert('Booking successful!');
    renderUserDashboard();
  } catch (error) {
    alert('Booking failed: ' + error.message);
  }
};

window.markAllNotificationsRead = async function() {
  try {
    await api.markAllAsRead();
    renderUserDashboard();
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

window.auth = auth;
