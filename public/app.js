// -------------------- CONFIG --------------------

const API_URL = "https://task-manager-2snb.vercel.app/api/v1"; // << Change this to your backend base URL
console.log("API_URL:", API_URL);
let token = null; // store auth token after login
let tasks = [];
let currentEditId = null; // store ID of task to edit

// -------------------- PAGE NAVIGATION --------------------
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
  document.getElementById(pageId).classList.add('active');
}

// -------------------- AUTH --------------------
document.getElementById('signin-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data?.token) {  // ✅ Correct condition
      token = data.token; // store JWT token
      localStorage.setItem('token', token);
      await fetchTasks(); // get tasks after login
      showPage('dashboard-page');
      document.getElementById('signin-page').classList.remove('active');
    } else {
      alert(data.msg || 'Login failed');
    }
  } catch (err) {
    console.error(err);
    alert('Server error while logging in');
  }
});


// Go to register page
document.getElementById('go-register').addEventListener('click', () => {
  showPage('register-page');
  document.getElementById('signin-page').classList.remove('active');
});

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Registered successfully! Please log in.');
      showPage('signin-page');
      document.getElementById('register-page').classList.remove('active');
    } else {
      alert(data.msg || 'Registration failed');
    }
  } catch (err) {
    console.error(err);
    alert('Server error while registering');
  }
});

// Go back to sign in page
document.getElementById('go-signin').addEventListener('click', () => {
  showPage('signin-page');
  document.getElementById('register-page').classList.remove('active');
});
// Fetch tasks
async function fetchTasks() {
  try {
    const res = await fetch(`${API_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok) {
      tasks = data.tasks || [];
      renderTasks();
    } else {
      alert(data.msg || 'Failed to fetch tasks');
    }
  } catch (err) {
    console.error(err);
    alert('Error fetching tasks');
  }
}

// Add task
document.getElementById('add-task')?.addEventListener('click', async () => {
  const taskText = document.getElementById('new-task').value;
  if (!taskText.trim()) return;

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: taskText, completed: false })
    });

    const data = await res.json();
    if (res.ok) {
      tasks.push(data.task);
      document.getElementById('new-task').value = '';
      renderTasks();
    } else {
      alert(data.msg || 'Failed to add task');
    }
  } catch (err) {
    console.error(err);
    alert('Error adding task');
  }
});

// Render tasks
function renderTasks(filter = 'all') {
  const allList = document.getElementById('all-tasks');
  const completedList = document.getElementById('completed-tasks');
  const uncompletedList = document.getElementById('uncompleted-tasks');

  if (!allList || !completedList || !uncompletedList) return;

  allList.innerHTML = '';
  completedList.innerHTML = '';
  uncompletedList.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed task' : 'uncompleted task';
    li.dataset.id = task._id;
    li.innerHTML = `
      ${task.name}
      <div class="task-buttons">
        <button class="edit-task"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-task"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    // ---------- FIXED: attach edit event for inline editing ----------
    li.querySelector('.edit-task').addEventListener('click', () => startInlineEdit(task._id));


    // Delete button
    const deleteBtn = li.querySelector('.delete-task');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => removeTask(task._id));
    }

    // Double click to toggle complete
    li.addEventListener('dblclick', () => toggleComplete(task._id));

    // Append to correct list
    allList.appendChild(li);
    if (task.completed) completedList.appendChild(li.cloneNode(true));
    else uncompletedList.appendChild(li.cloneNode(true));
  });

  // Show only selected list
  document.querySelectorAll('.task-list').forEach(list => list.classList.remove('active'));
  if (filter === 'all') allList.classList.add('active');
  if (filter === 'completed') completedList.classList.add('active');
  if (filter === 'uncompleted') uncompletedList.classList.add('active');
}


// Toggle complete
async function toggleComplete(id) {
  const task = tasks.find(t => t._id === id);
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...task, completed: !task.completed })
    });

    if (res.ok) {
      task.completed = !task.completed;
      renderTasks();
      alert('Task Completed 🎉');
    } else {
      const data = await res.json();
      alert(data.msg || 'Failed to update task');
    }
  } catch (err) {
    console.error(err);
    alert('Error updating task');
  }
}

// Remove task
async function removeTask(id) {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      tasks = tasks.filter(t => t._id !== id);
      renderTasks();
    } else {
      const data = await res.json();
      alert(data.msg || 'Failed to delete task');
    }
  } catch (err) {
    console.error(err);
    alert('Error deleting task');
  }
}




/// ---------- Cancel edit ----------
function cancelInlineEdit(input, id) {
  const task = tasks.find(t => t._id === id);
  if (!input) return;
  const span = document.createElement('span');
  span.className = 'task-name';
  span.dataset.id = id;
  span.textContent = task ? task.name : '';
  input.replaceWith(span);
}

// ---------- Edit task (matches backend updateTask) ----------
async function editTask(id, newName, newStatus = undefined) {
  if (!newName || !newName.trim()) {
    return cancelInlineEdit(document.querySelector(`input.inline-edit[data-id="${id}"]`), id);
  }

  const bodyData = { name: newName };
  if (newStatus !== undefined) bodyData.status = newStatus;

  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bodyData)
    });

    // Parse response safely
    let data;
    try {
      const text = await res.text();
      data = JSON.parse(text);
    } catch {
      data = { msg: text || 'Unknown server response' };
    }

    if (res.ok) {
      // Update local task
      return newName;
    } else {
      alert(data.msg || `Failed to update task (status ${res.status})`);
      cancelInlineEdit(document.querySelector(`input.inline-edit[data-id="${id}"]`), id);
    }

  } catch (err) {
    console.error(err);
    alert('Error updating task — check console');
    cancelInlineEdit(document.querySelector(`input.inline-edit[data-id="${id}"]`), id);
  }
}


// ---------- Start inline edit ----------
function startInlineEdit(id) {


  const taskSpan = document.querySelector(`.task[data-id="${id}"]`);
  console.log(taskSpan.textContent.trim());

  const formControl = `<form class="single-task-form">
  <div class="form-control">
    <input type="text" class="inline-edit" data-id="${id}" value="${taskSpan.textContent.trim()}" />
    <button type="submit" class="btn task-edit-btn">save</button>
  </div>
  </form>`;

  taskSpan.innerHTML = formControl;
  const input = document.querySelector(`input.inline-edit[data-id="${id}"]`);
  if (!input) return;

  // get the new task name from input then call the backend
  const editButton = document.querySelector('.task-edit-btn');
  editButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const newName = input.value;
    const data = await editTask(id, newName);
    if (data) {
      tasks.find(t => t._id === id).name = data;
      renderTasks();
    }
  });

}




// Tabs
const tabs = document.querySelectorAll('.tabs button');
const lists = document.querySelectorAll('.task-list');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    lists.forEach(list => list.classList.remove('active'));
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Filter buttons
document.getElementById('filter-all')?.addEventListener('click', () => renderTasks('all'));
document.getElementById('filter-completed')?.addEventListener('click', () => renderTasks('completed'));
document.getElementById('filter-uncompleted')?.addEventListener('click', () => renderTasks('uncompleted'));
