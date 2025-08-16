// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// Global variables
let currentUser = null;
let authToken = null;
let tasks = [];

// DOM Elements
const authForms = document.getElementById('authForms');
const mainApp = document.getElementById('mainApp');
const userInfo = document.getElementById('userInfo');
const username = document.getElementById('username');
const logoutBtn = document.getElementById('logoutBtn');
const taskList = document.getElementById('taskList');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const addTaskBtn = document.getElementById('addTaskBtn');
const statusFilter = document.getElementById('statusFilter');
const searchFilter = document.getElementById('searchFilter');
const loadingSpinner = document.getElementById('loadingSpinner');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

function initializeApp() {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showMainApp();
    }
}

function setupEventListeners() {
    // Auth form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Task management
    addTaskBtn.addEventListener('click', () => openTaskModal());
    taskForm.addEventListener('submit', handleTaskSubmit);
    
    // Modal controls
    document.querySelector('.close').addEventListener('click', closeTaskModal);
    document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
    
    // Filters
    statusFilter.addEventListener('change', filterTasks);
    searchFilter.addEventListener('input', filterTasks);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeTaskModal();
        }
    });
}

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === `${tabName}Form`);
    });
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    showLoading(true);
    
    const formData = new FormData();
    formData.append('username', document.getElementById('loginUsername').value);
    formData.append('password', document.getElementById('loginPassword').value);
    
    try {
        const response = await fetch(`${API_BASE_URL}/token`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            authToken = data.access_token;
            
            // Get user info
            const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (userResponse.ok) {
                currentUser = await userResponse.json();
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                showMainApp();
                loadTasks();
                showToast('Login successful!', 'success');
            }
        } else {
            const error = await response.json();
            showToast(error.detail || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    showLoading(true);
    
    const userData = {
        username: document.getElementById('signupUsername').value,
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPassword').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showToast('Account created successfully! Please login.', 'success');
            // Switch to login tab
            switchTab('login');
            // Clear form
            document.getElementById('signupForm').reset();
        } else {
            const error = await response.json();
            showToast(error.detail || 'Signup failed', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    showAuthForms();
    showToast('Logged out successfully', 'success');
}

function checkAuthStatus() {
    if (authToken && currentUser) {
        showMainApp();
        loadTasks();
    } else {
        showAuthForms();
    }
}

// UI state management
function showAuthForms() {
    authForms.style.display = 'block';
    mainApp.style.display = 'none';
    userInfo.style.display = 'none';
}

function showMainApp() {
    authForms.style.display = 'none';
    mainApp.style.display = 'block';
    userInfo.style.display = 'flex';
    username.textContent = currentUser.username;
}

// Task management functions
async function loadTasks() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            tasks = await response.json();
            renderTasks(tasks);
        } else {
            showToast('Failed to load tasks', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function renderTasks(tasksToRender) {
    if (tasksToRender.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No tasks found</h3>
                <p>Create your first task to get started!</p>
            </div>
        `;
        return;
    }
    
    taskList.innerHTML = tasksToRender.map(task => createTaskCard(task)).join('');
    
    // Add event listeners to task action buttons
    document.querySelectorAll('.edit-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = parseInt(e.target.dataset.taskId);
            editTask(taskId);
        });
    });
    
    document.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = parseInt(e.target.dataset.taskId);
            deleteTask(taskId);
        });
    });
}

function createTaskCard(task) {
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date';
    const statusClass = `status-${task.status.toLowerCase().replace(' ', '-')}`;
    
    return `
        <div class="task-card" data-task-id="${task.id}">
            <div class="task-header">
                <div>
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description || 'No description'}</div>
                </div>
                <span class="task-status ${statusClass}">${task.status}</span>
            </div>
            <div class="task-meta">
                <div class="task-due-date">
                    <i class="fas fa-calendar"></i> Due: ${dueDate}
                </div>
                <div class="task-created">
                    <i class="fas fa-clock"></i> Created: ${new Date(task.created_at).toLocaleDateString()}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-secondary edit-task-btn" data-task-id="${task.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger delete-task-btn" data-task-id="${task.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Task modal functions
function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('taskForm');
    
    if (taskId) {
        // Edit mode
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            modalTitle.textContent = 'Edit Task';
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskStatus').value = task.status;
            if (task.due_date) {
                const dueDate = new Date(task.due_date);
                const localDateTime = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000);
                document.getElementById('taskDueDate').value = localDateTime.toISOString().slice(0, 16);
            } else {
                document.getElementById('taskDueDate').value = '';
            }
        }
    } else {
        // Create mode
        modalTitle.textContent = 'Add New Task';
        form.reset();
        document.getElementById('taskId').value = '';
    }
    
    modal.style.display = 'block';
}

function closeTaskModal() {
    taskModal.style.display = 'none';
    document.getElementById('taskForm').reset();
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    showLoading(true);
    
    const taskId = document.getElementById('taskId').value;
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        status: document.getElementById('taskStatus').value,
        due_date: document.getElementById('taskDueDate').value || null
    };
    
    try {
        let response;
        if (taskId) {
            // Update existing task
            response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(taskData)
            });
        } else {
            // Create new task
            response = await fetch(`${API_BASE_URL}/tasks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(taskData)
            });
        }
        
        if (response.ok) {
            showToast(taskId ? 'Task updated successfully!' : 'Task created successfully!', 'success');
            closeTaskModal();
            loadTasks();
        } else {
            const error = await response.json();
            showToast(error.detail || 'Operation failed', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function editTask(taskId) {
    openTaskModal(taskId);
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showToast('Task deleted successfully!', 'success');
            loadTasks();
        } else {
            showToast('Failed to delete task', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Filtering functions
function filterTasks() {
    const statusValue = statusFilter.value;
    const searchValue = searchFilter.value.toLowerCase();
    
    let filteredTasks = tasks;
    
    // Filter by status
    if (statusValue) {
        filteredTasks = filteredTasks.filter(task => task.status === statusValue);
    }
    
    // Filter by search term
    if (searchValue) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchValue) ||
            (task.description && task.description.toLowerCase().includes(searchValue))
        );
    }
    
    renderTasks(filteredTasks);
}

// Utility functions
function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Error handling for network issues
window.addEventListener('online', () => {
    showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    showToast('No internet connection', 'warning');
}); 