// Todo App JavaScript
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.currentSort = 'created';
        this.searchTerm = '';
        this.editingTodo = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadTheme();
        this.render();
    }

    initializeElements() {
        // Form elements
        this.todoForm = document.getElementById('todoForm');
        this.todoInput = document.getElementById('todoInput');
        this.categorySelect = document.getElementById('category');
        this.prioritySelect = document.getElementById('priority');
        this.dueDateInput = document.getElementById('dueDate');

        // Control elements
        this.searchInput = document.getElementById('searchInput');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sortBy');

        // Display elements
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTodos = document.getElementById('totalTodos');
        this.allCount = document.getElementById('allCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');

        // Theme and bulk actions
        this.themeToggle = document.getElementById('themeToggle');
        this.bulkActions = document.getElementById('bulkActions');
        this.selectAllBtn = document.getElementById('selectAll');
        this.deleteSelectedBtn = document.getElementById('deleteSelected');
        this.completeSelectedBtn = document.getElementById('completeSelected');
        this.clearCompletedBtn = document.getElementById('clearCompleted');

        // Modal elements
        this.editModal = document.getElementById('editModal');
        this.editForm = document.getElementById('editForm');
        this.editText = document.getElementById('editText');
        this.editCategory = document.getElementById('editCategory');
        this.editPriority = document.getElementById('editPriority');
        this.editDueDate = document.getElementById('editDueDate');
        this.closeModal = document.getElementById('closeModal');
        this.cancelEdit = document.getElementById('cancelEdit');
    }

    bindEvents() {
        // Form submission
        this.todoForm.addEventListener('submit', (e) => this.handleAddTodo(e));

        // Search and filters
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
        this.sortSelect.addEventListener('change', (e) => this.handleSort(e));

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Bulk actions
        this.selectAllBtn.addEventListener('click', () => this.selectAllTodos());
        this.deleteSelectedBtn.addEventListener('click', () => this.deleteSelectedTodos());
        this.completeSelectedBtn.addEventListener('click', () => this.completeSelectedTodos());
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTodos());

        // Modal events
        this.editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
        this.closeModal.addEventListener('click', () => this.closeEditModal());
        this.cancelEdit.addEventListener('click', () => this.closeEditModal());
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleAddTodo(e) {
        e.preventDefault();
        
        const text = this.todoInput.value.trim();
        if (!text) return;

        const newTodo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            category: this.categorySelect.value,
            priority: this.prioritySelect.value,
            dueDate: this.dueDateInput.value || null,
            createdAt: new Date().toISOString(),
            selected: false
        };

        this.todos.unshift(newTodo);
        this.saveTodos();
        this.render();
        this.resetForm();
        
        // Add animation class
        setTimeout(() => {
            const newTodoElement = this.todoList.firstElementChild;
            if (newTodoElement) {
                newTodoElement.classList.add('fade-in');
            }
        }, 100);
    }

    resetForm() {
        this.todoInput.value = '';
        this.categorySelect.value = 'personal';
        this.prioritySelect.value = 'medium';
        this.dueDateInput.value = '';
        this.todoInput.focus();
    }

    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
        this.render();
    }

    handleFilter(e) {
        const filter = e.target.dataset.filter;
        if (!filter) return;

        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.render();
    }

    handleSort(e) {
        this.currentSort = e.target.value;
        this.render();
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle icon
        const icon = this.themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    handleKeyboard(e) {
        // Escape to close modal
        if (e.key === 'Escape' && this.editModal.classList.contains('show')) {
            this.closeEditModal();
        }
        
        // Enter to focus input (when not in modal or form)
        if (e.key === '/' && !e.ctrlKey && !e.metaKey && 
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            e.preventDefault();
            this.todoInput.focus();
        }
    }

    getFilteredAndSortedTodos() {
        let filtered = this.todos.filter(todo => {
            // Filter by status
            if (this.currentFilter === 'active' && todo.completed) return false;
            if (this.currentFilter === 'completed' && !todo.completed) return false;
            
            // Filter by search term
            if (this.searchTerm && !todo.text.toLowerCase().includes(this.searchTerm)) {
                return false;
            }
            
            return true;
        });

        // Sort todos
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'dueDate':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                
                case 'priority':
                    const priorities = { high: 3, medium: 2, low: 1 };
                    return priorities[b.priority] - priorities[a.priority];
                
                case 'alphabetical':
                    return a.text.localeCompare(b.text);
                
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return filtered;
    }

    render() {
        const filteredTodos = this.getFilteredAndSortedTodos();
        
        // Update counts
        this.updateCounts();
        
        // Show/hide empty state
        if (filteredTodos.length === 0) {
            this.todoList.style.display = 'none';
            this.emptyState.style.display = 'block';
        } else {
            this.todoList.style.display = 'flex';
            this.emptyState.style.display = 'none';
        }

        // Render todos
        this.todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
        
        // Update bulk actions visibility
        const hasSelected = this.todos.some(todo => todo.selected);
        this.bulkActions.classList.toggle('show', hasSelected);
        
        // Bind todo events
        this.bindTodoEvents();
    }

    createTodoHTML(todo) {
        const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
        const now = new Date();
        const isOverdue = dueDate && dueDate < now && !todo.completed;
        const isDueSoon = dueDate && !isOverdue && !todo.completed && 
                         (dueDate - now) < (24 * 60 * 60 * 1000); // Due within 24 hours

        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''} ${todo.priority}-priority" 
                 data-id="${todo.id}">
                <div class="todo-header">
                    <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                         data-action="toggle">
                        ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                    <div class="todo-actions">
                        <button class="action-btn edit-btn" data-action="edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-action="delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="action-btn select-btn" data-action="select" title="Select">
                            <i class="fas ${todo.selected ? 'fa-check-square' : 'fa-square'}"></i>
                        </button>
                    </div>
                </div>
                <div class="todo-meta">
                    <span class="category-tag category-${todo.category}">${todo.category}</span>
                    <span class="priority-indicator priority-${todo.priority}">
                        <i class="fas fa-flag"></i>
                        ${todo.priority}
                    </span>
                    ${todo.dueDate ? `
                        <span class="due-date ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(todo.dueDate)}
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    bindTodoEvents() {
        const todoItems = this.todoList.querySelectorAll('.todo-item');
        
        todoItems.forEach(item => {
            const todoId = item.dataset.id;
            
            // Handle action clicks
            item.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                if (!action) return;
                
                e.stopPropagation();
                
                switch (action) {
                    case 'toggle':
                        this.toggleTodo(todoId);
                        break;
                    case 'edit':
                        this.openEditModal(todoId);
                        break;
                    case 'delete':
                        this.deleteTodo(todoId);
                        break;
                    case 'select':
                        this.toggleSelectTodo(todoId);
                        break;
                }
            });

            // Double-click to edit
            item.addEventListener('dblclick', () => this.openEditModal(todoId));
        });
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this todo?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
        }
    }

    toggleSelectTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.selected = !todo.selected;
            this.render();
        }
    }

    openEditModal(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.editingTodo = todo;
        this.editText.value = todo.text;
        this.editCategory.value = todo.category;
        this.editPriority.value = todo.priority;
        this.editDueDate.value = todo.dueDate || '';

        this.editModal.classList.add('show');
        this.editText.focus();
    }

    closeEditModal() {
        this.editModal.classList.remove('show');
        this.editingTodo = null;
    }

    handleEditSubmit(e) {
        e.preventDefault();
        
        if (!this.editingTodo) return;

        const text = this.editText.value.trim();
        if (!text) return;

        this.editingTodo.text = text;
        this.editingTodo.category = this.editCategory.value;
        this.editingTodo.priority = this.editPriority.value;
        this.editingTodo.dueDate = this.editDueDate.value || null;

        this.saveTodos();
        this.render();
        this.closeEditModal();
    }

    // Bulk Actions
    selectAllTodos() {
        const filteredTodos = this.getFilteredAndSortedTodos();
        const allSelected = filteredTodos.every(todo => todo.selected);
        
        filteredTodos.forEach(todo => {
            todo.selected = !allSelected;
        });
        
        this.render();
    }

    deleteSelectedTodos() {
        const selectedTodos = this.todos.filter(todo => todo.selected);
        if (selectedTodos.length === 0) return;
        
        if (confirm(`Are you sure you want to delete ${selectedTodos.length} selected todos?`)) {
            this.todos = this.todos.filter(todo => !todo.selected);
            this.saveTodos();
            this.render();
        }
    }

    completeSelectedTodos() {
        const selectedTodos = this.todos.filter(todo => todo.selected);
        if (selectedTodos.length === 0) return;
        
        selectedTodos.forEach(todo => {
            todo.completed = true;
            todo.selected = false;
        });
        
        this.saveTodos();
        this.render();
    }

    clearCompletedTodos() {
        const completedTodos = this.todos.filter(todo => todo.completed);
        if (completedTodos.length === 0) return;
        
        if (confirm(`Are you sure you want to delete ${completedTodos.length} completed todos?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
        }
    }

    updateCounts() {
        const total = this.todos.length;
        const active = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;

        this.totalTodos.textContent = total;
        this.allCount.textContent = total;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (dateOnly.getTime() === today.getTime()) {
            return 'Today';
        } else if (dateOnly.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        } else if (dateOnly.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // Export/Import functionality
    exportTodos() {
        const dataStr = JSON.stringify(this.todos, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    importTodos(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTodos = JSON.parse(e.target.result);
                if (Array.isArray(importedTodos)) {
                    if (confirm('This will replace all current todos. Continue?')) {
                        this.todos = importedTodos;
                        this.saveTodos();
                        this.render();
                    }
                }
            } catch (error) {
                alert('Invalid file format. Please select a valid JSON file.');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
    
    // Add some sample todos for demonstration (only if no todos exist)
    if (window.todoApp.todos.length === 0) {
        const sampleTodos = [
            {
                id: '1',
                text: 'Welcome to TodoMaster! This is a sample todo.',
                completed: false,
                category: 'personal',
                priority: 'medium',
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                createdAt: new Date().toISOString(),
                selected: false
            },
            {
                id: '2',
                text: 'Try editing this todo by double-clicking or using the edit button.',
                completed: false,
                category: 'work',
                priority: 'high',
                dueDate: null,
                createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                selected: false
            },
            {
                id: '3',
                text: 'You can mark todos as complete by clicking the checkbox.',
                completed: true,
                category: 'personal',
                priority: 'low',
                dueDate: null,
                createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                selected: false
            }
        ];
        
        window.todoApp.todos = sampleTodos;
        window.todoApp.saveTodos();
        window.todoApp.render();
    }
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}