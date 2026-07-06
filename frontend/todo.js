const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

document.getElementById('userEmail').textContent = localStorage.getItem('email') || '';

const todoList = document.getElementById('todoList');
const emptyMsg = document.getElementById('emptyMsg');
const addTodoForm = document.getElementById('addTodoForm');
const todoInput = document.getElementById('todoInput');
const logoutBtn = document.getElementById('logoutBtn');

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function handleAuthError(res) {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    window.location.href = 'index.html';
    return true;
  }
  return false;
}

async function loadTodos() {
  try {
    const res = await fetch(`${API_BASE}/todos`, { headers: authHeaders() });
    if (await handleAuthError(res)) return;

    const todos = await res.json();
    renderTodos(todos);
  } catch (err) {
    console.error('Failed to load todos', err);
  }
}

function renderTodos(todos) {
  todoList.innerHTML = '';
  emptyMsg.classList.toggle('hidden', todos.length > 0);

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
    const res = await fetch(`${API_BASE}/todos`, {
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
    const res = await fetch(`${API_BASE}/todos/${id}`, {
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
    const res = await fetch(`${API_BASE}/todos/${id}`, {
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
  window.location.href = 'index.html';
});

loadTodos();
