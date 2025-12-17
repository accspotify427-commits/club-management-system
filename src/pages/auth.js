import { auth } from '../auth.js';

export function renderLogin() {
  setTimeout(() => {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', handleLogin);
  }, 0);

  return `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Welcome Back</h1>
        <p>Sign in to your club account</p>
        
        <div id="error-message"></div>
        
        <form id="login-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" required placeholder="your@email.com">
          </div>
          
          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" required placeholder="••••••••">
          </div>
          
          <button type="submit" class="btn btn-primary">Sign In</button>
        </form>
        
        <p style="margin-top: 20px; text-align: center;">
          Don't have an account? 
          <a href="/register" onclick="event.preventDefault(); navigate('/register')" class="text-link">
            Register
          </a>
        </p>
        
        <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px; font-size: 14px;">
          <strong>Test Accounts:</strong><br>
          Owner: owner@club.com / password123<br>
          Admin: admin@club.com / password123<br>
          User: user@club.com / password123
        </div>
      </div>
    </div>
  `;
}

export function renderRegister() {
  setTimeout(() => {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', handleRegister);
  }, 0);

  return `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Create Account</h1>
        <p>Join our exclusive club</p>
        
        <div id="error-message"></div>
        
        <form id="register-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" name="name" required placeholder="John Doe">
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" required placeholder="your@email.com">
          </div>
          
          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" required placeholder="••••••••" minlength="6">
          </div>
          
          <button type="submit" class="btn btn-primary">Create Account</button>
        </form>
        
        <p style="margin-top: 20px; text-align: center;">
          Already have an account? 
          <a href="/login" onclick="event.preventDefault(); navigate('/login')" class="text-link">
            Sign In
          </a>
        </p>
      </div>
    </div>
  `;
}

async function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    await auth.login(email, password);
    window.navigate('/dashboard');
  } catch (error) {
    showError(error.message);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    await auth.register(email, password, name);
    window.navigate('/dashboard');
  } catch (error) {
    showError(error.message);
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.innerHTML = `<div class="alert alert-error">${message}</div>`;
}
