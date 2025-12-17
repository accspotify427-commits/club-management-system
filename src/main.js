import { auth } from './auth.js';
import { renderLogin, renderRegister } from './pages/auth.js';
import { renderUserDashboard } from './pages/user.js';
import { renderAdminDashboard } from './pages/admin.js';
import { renderOwnerDashboard } from './pages/owner.js';
import { renderMaintenance } from './pages/maintenance.js';

const app = document.getElementById('app');

// Router
const routes = {
  '/': 'login',
  '/login': 'login',
  '/register': 'register',
  '/dashboard': 'dashboard'
};

async function router() {
  const path = window.location.pathname;
  const route = routes[path] || 'login';

  // Check if user is logged in
  const user = auth.getUser();

  if (!user && route !== 'login' && route !== 'register') {
    return navigate('/login');
  }

  if (user && (route === 'login' || route === 'register')) {
    return navigate('/dashboard');
  }

  // Check maintenance mode for non-owners
  if (user && user.role !== 'owner') {
    try {
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });
      
      if (response.status === 503) {
        app.innerHTML = renderMaintenance();
        return;
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
    }
  }

  // Render appropriate page
  switch (route) {
    case 'login':
      app.innerHTML = renderLogin();
      break;
    case 'register':
      app.innerHTML = renderRegister();
      break;
    case 'dashboard':
      if (user.role === 'owner') {
        await renderOwnerDashboard();
      } else if (user.role === 'admin') {
        await renderAdminDashboard();
      } else {
        await renderUserDashboard();
      }
      break;
  }
}

// Navigation helper
window.navigate = (path) => {
  window.history.pushState({}, '', path);
  router();
};

// Handle browser back/forward
window.addEventListener('popstate', router);

// Initial load
router();
