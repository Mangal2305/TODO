// Redirect to workspace if already logged in
if (localStorage.getItem('token')) {
  // FIXED: Pointing this to todo.html to match your todo view file
  window.location.href = 'todo.html'; 
}

const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const errorMsg = document.getElementById('errorMsg');

loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  hideError();
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  hideError();
});

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}

function hideError() {
  errorMsg.classList.add('hidden');
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    // FIXED: Replaced API_BASE with window.API_URL
    const res = await fetch(`${window.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Login failed');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.user.email);
    
    // FIXED: Pointing to todo.html
    window.location.href = 'todo.html';
  } catch (err) {
    console.error('Login request error:', err);
    showError('Could not connect to server');
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    // FIXED: Replaced API_BASE with window.API_URL
    const res = await fetch(`${window.API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Registration failed');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.user.email);
    
    // FIXED: Pointing to todo.html
    window.location.href = 'todo.html';
  } catch (err) {
    console.error('Registration request error:', err);
    showError('Could not connect to server');
  }
});