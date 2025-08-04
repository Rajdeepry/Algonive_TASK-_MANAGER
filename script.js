const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('search');
const darkToggle = document.getElementById('darkModeToggle');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  const filtered = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchInput.value.toLowerCase());
    if (!matchesSearch) return false;
    if (currentFilter === 'completed') return task.completed;
    if (currentFilter === 'incomplete') return !task.completed;
    return true;
  });

  filtered.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `task ${task.priority.toLowerCase()}`;

    li.innerHTML = `
      <div class="task-info">
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <div class="meta">
          Due: ${new Date(task.dueDate).toLocaleString()}
          <div class="priority">${task.priority}</div>
        </div>
      </div>
      <div class="task-actions">
        <button onclick="toggleComplete(${index})">
          ${task.completed ? '✅' : '⬜'}
        </button>
        <button onclick="editTask(${index})">✏️</button>
        <button onclick="deleteTask(${index})">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function addTask(e) {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const dueDate = document.getElementById('dueDate').value;
  const priority = document.getElementById('priority').value;

  if (!title || !dueDate) return;

  const newTask = { title, description, dueDate, priority, completed: false };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  taskForm.reset();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function editTask(index) {
  const task = tasks[index];
  document.getElementById('title').value = task.title;
  document.getElementById('description').value = task.description;
  document.getElementById('dueDate').value = task.dueDate;
  document.getElementById('priority').value = task.priority;
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

searchInput.addEventListener('input', renderTasks);

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active').classList.remove('active');
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

darkToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Load dark mode from storage
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  darkToggle.checked = true;
}

// Reminder notifications
function checkReminders() {
  const now = new Date().getTime();
  tasks.forEach((task, index) => {
    const taskTime = new Date(task.dueDate).getTime();
    if (!task.notified && taskTime - now < 3600000 && !task.completed) {
      task.notified = true;
      showNotification(`Reminder: "${task.title}" is due soon!`);
      saveTasks();
    }
  });
}

function showNotification(message) {
  if (Notification.permission === 'granted') {
    new Notification('📌 Task Reminder', { body: message });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('📌 Task Reminder', { body: message });
      }
    });
  }
}

setInterval(checkReminders, 60000); // Check every minute

taskForm.addEventListener('submit', addTask);
renderTasks();

