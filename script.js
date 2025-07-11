class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }
    
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.errorMessage = document.getElementById('errorMessage');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.filterButtons = document.querySelectorAll('.filter-btn');
    }
    
    bindEvents() {
        // Add task events
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // Filter events
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        
        // Clear completed tasks
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        // Clear error message on input
        this.taskInput.addEventListener('input', () => this.clearError());
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    addTask() {
        const text = this.taskInput.value.trim();
        
        if (!text) {
            this.showError('Please enter a task');
            return;
        }
        
        if (text.length > 100) {
            this.showError('Task is too long (max 100 characters)');
            return;
        }
        
        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.tasks.unshift(task);
        this.taskInput.value = '';
        this.saveTasks();
        this.render();
        this.clearError();
        
        // Add success animation
        this.taskInput.style.borderColor = '#27ae60';
        setTimeout(() => {
            this.taskInput.style.borderColor = '#e1e5e9';
        }, 1000);
    }
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
        }
    }
    
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }
    
    editTask(id) {
        if (this.editingTaskId) {
            this.cancelEdit();
        }
        
        this.editingTaskId = id;
        this.render();
        
        // Focus on the edit input
        const editInput = document.querySelector(`[data-task-id="${id}"] .edit-input`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }
    
    saveEdit(id, newText) {
        const text = newText.trim();
        
        if (!text) {
            this.showError('Task cannot be empty');
            return;
        }
        
        if (text.length > 100) {
            this.showError('Task is too long (max 100 characters)');
            return;
        }
        
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.text = text;
            this.editingTaskId = null;
            this.saveTasks();
            this.render();
            this.clearError();
        }
    }
    
    cancelEdit() {
        this.editingTaskId = null;
        this.render();
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }
    
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }
    
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Update task count
        const activeCount = this.tasks.filter(t => !t.completed).length;
        const totalCount = this.tasks.length;
        this.taskCount.textContent = `${activeCount} of ${totalCount} tasks`;
        
        // Update clear button state
        const completedCount = this.tasks.filter(t => t.completed).length;
        this.clearCompletedBtn.disabled = completedCount === 0;
        this.clearCompletedBtn.textContent = `Clear Completed (${completedCount})`;
        
        // Show/hide empty state
        if (filteredTasks.length === 0) {
            this.taskList.style.display = 'none';
            this.emptyState.style.display = 'block';
            
            // Update empty state message based on filter
            const emptyStateTitle = this.emptyState.querySelector('h3');
            const emptyStateText = this.emptyState.querySelector('p');
            
            switch (this.currentFilter) {
                case 'active':
                    emptyStateTitle.textContent = 'No active tasks';
                    emptyStateText.textContent = 'All tasks are completed!';
                    break;
                case 'completed':
                    emptyStateTitle.textContent = 'No completed tasks';
                    emptyStateText.textContent = 'Complete some tasks to see them here.';
                    break;
                default:
                    emptyStateTitle.textContent = 'No tasks yet';
                    emptyStateText.textContent = 'Add a task above to get started!';
            }
        } else {
            this.taskList.style.display = 'block';
            this.emptyState.style.display = 'none';
        }
        
        // Render tasks
        this.taskList.innerHTML = filteredTasks.map(task => this.renderTask(task)).join('');
        
        // Bind task events
        this.bindTaskEvents();
    }
    
    renderTask(task) {
        const isEditing = this.editingTaskId === task.id;
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="app.toggleTask('${task.id}')"></div>
                
                <div class="task-content">
                    ${isEditing ? `
                        <input type="text" class="edit-input" value="${task.text}" 
                               onblur="app.saveEdit('${task.id}', this.value)"
                               onkeypress="if(event.key==='Enter') app.saveEdit('${task.id}', this.value); if(event.key==='Escape') app.cancelEdit()">
                    ` : `
                        <div class="task-text">${task.text}</div>
                        <div class="task-date">Created ${this.formatDate(task.createdAt)}</div>
                    `}
                </div>
                
                <div class="task-actions">
                    ${!isEditing ? `
                        <button class="edit-btn" onclick="app.editTask('${task.id}')" title="Edit task">
                            ✏️
                        </button>
                    ` : ''}
                    <button class="delete-btn" onclick="app.deleteTask('${task.id}')" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }
    
    bindTaskEvents() {
        // Handle edit input events
        const editInputs = document.querySelectorAll('.edit-input');
        editInputs.forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.cancelEdit();
                }
            });
        });
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.opacity = '1';
        this.taskInput.style.borderColor = '#e74c3c';
    }
    
    clearError() {
        this.errorMessage.textContent = '';
        this.errorMessage.style.opacity = '0';
        this.taskInput.style.borderColor = '#e1e5e9';
    }
    
    saveTasks() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Failed to save tasks to localStorage:', error);
        }
    }
    
    loadTasks() {
        try {
            const saved = localStorage.getItem('todoTasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load tasks from localStorage:', error);
            return [];
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});
