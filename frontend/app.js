const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');

function showDashboard() {
  authSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  document.getElementById('userEmail').textContent = localStorage.getItem('email') || '';
  loadTodos();
}

function showAuth() {
  dashboardSection.classList.add('hidden');
  authSection.classList.remove('hidden');
}

// ---------- AUTH LOGIC ----------
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
    showDashboard();
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
    showDashboard();
  } catch (err) {
    console.error('Registration request error:', err);
    showError('Could not connect to server');
  }
});

// ---------- TODO LOGIC ----------
const todoList = document.getElementById('todoList');
const emptyMsg = document.getElementById('emptyMsg');
const addTodoForm = document.getElementById('addTodoForm');
const todoInput = document.getElementById('todoInput');
const logoutBtn = document.getElementById('logoutBtn');

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

async function handleAuthError(res) {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    showAuth();
    return true;
  }
  return false;
}

async function loadTodos() {
  try {
    const res = await fetch(`${window.API_URL}/todos`, { headers: authHeaders() });
    if (await handleAuthError(res)) return;
    const todos = await res.json();
    renderTodos(todos);
  } catch (err) {
    console.error('Failed to load todos', err);
  }
}

function renderTodos(todos) {
  todoList.innerHTML = '';
  if (emptyMsg) {
    emptyMsg.classList.toggle('hidden', todos.length > 0);
  }
  todos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id, checkbox.checked));
    const title = document.createElement('span');
    title.className = 'todo-title';
    title.textContent = todo.title;
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
    li.appendChild(checkbox);
    li.appendChild(title);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });
}

addTodoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = todoInput.value.trim();
  if (!title) return;
  try {
    const res = await fetch(`${window.API_URL}/todos`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title }),
    });
    if (await handleAuthError(res)) return;
    todoInput.value = '';
    loadTodos();
  } catch (err) {
    console.error('Failed to add todo', err);
  }
});

async function toggleTodo(id, completed) {
  try {
    const res = await fetch(`${window.API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ completed }),
    });
    if (await handleAuthError(res)) return;
    loadTodos();
  } catch (err) {
    console.error('Failed to update todo', err);
  }
}

async function deleteTodo(id) {
  try {
    const res = await fetch(`${window.API_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (await handleAuthError(res)) return;
    loadTodos();
  } catch (err) {
    console.error('Failed to delete todo', err);
  }
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  showAuth();
});

// ---------- INITIAL CHECK ----------
if (localStorage.getItem('token')) {
  showDashboard();
} else {
  showAuth();
}