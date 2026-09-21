/**
 * Taskify - Modern Glassmorphism TODO Application
 * ES6 Vanilla JavaScript Logic
 */

(function () {
  'use strict';

  // State Store Keys
  const STORAGE_KEY = 'taskify_tasks_v1';
  const THEME_KEY = 'taskify_theme_v1';

  // Sample Tasks for First Load
  const SAMPLE_TASKS = [
    {
      id: 'task-1',
      title: 'Design Glassmorphism Dashboard UI',
      description: 'Craft responsive visual components with smooth blur filters and neon color tokens.',
      priority: 'high',
      category: 'Work',
      dueDate: getFormattedDate(1),
      completed: false,
      starred: true,
      subtasks: [
        { id: 'sub-1', text: 'Create layout grid tokens', completed: true },
        { id: 'sub-2', text: 'Implement backdrop-filter effects', completed: false }
      ],
      createdAt: Date.now() - 3600000 * 5
    },
    {
      id: 'task-2',
      title: 'Buy Groceries for Weekly Meal Prep',
      description: 'Stock up on healthy ingredients for the upcoming week.',
      priority: 'medium',
      category: 'Shopping',
      dueDate: getFormattedDate(0),
      completed: false,
      starred: false,
      subtasks: [
        { id: 'sub-3', text: 'Fresh Vegetables & Greens', completed: true },
        { id: 'sub-4', text: 'Almond Milk & Protein Powder', completed: false },
        { id: 'sub-5', text: 'Avocados & Oats', completed: false }
      ],
      createdAt: Date.now() - 3600000 * 2
    },
    {
      id: 'task-3',
      title: 'Morning 30-min Jog & Cardio Session',
      description: 'Complete daily cardio routine at the park.',
      priority: 'low',
      category: 'Health',
      dueDate: getFormattedDate(0),
      completed: true,
      starred: false,
      subtasks: [],
      createdAt: Date.now() - 3600000 * 10
    },
    {
      id: 'task-4',
      title: 'Explore AI Agent Workflows & Automation',
      description: 'Research new patterns for modular agent capabilities and tools integration.',
      priority: 'urgent',
      category: 'Ideas',
      dueDate: getFormattedDate(3),
      completed: false,
      starred: true,
      subtasks: [
        { id: 'sub-6', text: 'Review tool calling schemas', completed: false }
      ],
      createdAt: Date.now() - 3600000 * 1
    }
  ];

  // Helper date function
  function getFormattedDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

  // App State
  let tasks = [];
  let currentFilter = 'all';
  let currentCategory = 'all';
  let searchQuery = '';
  let currentSort = 'created-desc';
  let tempSubtasks = [];
  let editingTaskId = null;

  // DOM Elements
  const el = {
    themeToggle: document.getElementById('theme-toggle'),
    themeIconMoon: document.getElementById('theme-icon-moon'),
    themeIconSun: document.getElementById('theme-icon-sun'),
    btnReset: document.getElementById('btn-reset'),
    
    // Stats
    statTotal: document.getElementById('stat-total'),
    statPending: document.getElementById('stat-pending'),
    statCompleted: document.getElementById('stat-completed'),
    progressFill: document.getElementById('progress-fill'),
    progressPercent: document.getElementById('progress-percent'),

    // Creator Form
    quickTitleInput: document.getElementById('quick-title-input'),
    btnToggleExpand: document.getElementById('btn-toggle-expand'),
    btnAddTask: document.getElementById('btn-add-task'),
    expandedCreator: document.getElementById('expanded-creator'),
    taskDescInput: document.getElementById('task-desc-input'),
    taskPriorityInput: document.getElementById('task-priority-input'),
    taskCategoryInput: document.getElementById('task-category-input'),
    taskDateInput: document.getElementById('task-date-input'),
    subtaskInput: document.getElementById('subtask-input'),
    btnAddSubtaskChip: document.getElementById('btn-add-subtask-chip'),
    subtasksChipContainer: document.getElementById('subtasks-chip-container'),

    // Controls
    searchInput: document.getElementById('search-input'),
    sortSelect: document.getElementById('sort-select'),
    filterTabs: document.getElementById('filter-tabs'),
    categoryChips: document.getElementById('category-chips'),

    // Container
    tasksContainer: document.getElementById('tasks-container'),

    // Edit Modal
    editModal: document.getElementById('edit-modal'),
    editTitle: document.getElementById('edit-title'),
    editDesc: document.getElementById('edit-desc'),
    editPriority: document.getElementById('edit-priority'),
    editCategory: document.getElementById('edit-category'),
    editDate: document.getElementById('edit-date'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnCancelEdit: document.getElementById('btn-cancel-edit'),
    btnSaveEdit: document.getElementById('btn-save-edit'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  // Priority Values mapping for sorting
  const PRIORITY_RANK = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  // Initialize App
  function init() {
    loadTheme();
    loadTasks();
    bindEvents();
    render();
  }

  // Load / Save Local Storage
  function loadTasks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        tasks = JSON.parse(raw);
      } catch (e) {
        tasks = [...SAMPLE_TASKS];
      }
    } else {
      tasks = [...SAMPLE_TASKS];
      saveTasks();
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeIcons(newTheme);
    showToast(`Switched to ${newTheme} theme`, 'info');
  }

  function updateThemeIcons(theme) {
    if (theme === 'light') {
      el.themeIconMoon.style.display = 'none';
      el.themeIconSun.style.display = 'block';
    } else {
      el.themeIconMoon.style.display = 'block';
      el.themeIconSun.style.display = 'none';
    }
  }

  // Event Listeners
  function bindEvents() {
    // Theme Toggle
    el.themeToggle.addEventListener('click', toggleTheme);

    // Reset Tasks
    el.btnReset.addEventListener('click', () => {
      if (confirm('Reset tasks to sample data?')) {
        tasks = [...SAMPLE_TASKS];
        saveTasks();
        render();
        showToast('Reset tasks to sample data', 'info');
      }
    });

    // Expand Form
    el.btnToggleExpand.addEventListener('click', () => {
      el.expandedCreator.classList.toggle('show');
    });

    // Quick Add Input (Enter Key)
    el.quickTitleInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTaskFromForm();
      }
    });

    // Add Task Button
    el.btnAddTask.addEventListener('click', addTaskFromForm);

    // Add Subtask Chip inside form
    el.btnAddSubtaskChip.addEventListener('click', addSubtaskChip);
    el.subtaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addSubtaskChip();
      }
    });

    // Search Input
    el.searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      render();
    });

    // Sort Select
    el.sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      render();
    });

    // Filter Tabs
    el.filterTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;

      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      render();
    });

    // Category Chips
    el.categoryChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.cat-chip');
      if (!chip) return;

      document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.getAttribute('data-cat');
      render();
    });

    // Modal Close
    el.btnCloseModal.addEventListener('click', closeModal);
    el.btnCancelEdit.addEventListener('click', closeModal);
    el.btnSaveEdit.addEventListener('click', saveEditTask);

    // Close Modal on backdrop click
    el.editModal.addEventListener('click', (e) => {
      if (e.target === el.editModal) closeModal();
    });
  }

  // Add Subtask Chip inside creation form
  function addSubtaskChip() {
    const text = el.subtaskInput.value.trim();
    if (!text) return;
    tempSubtasks.push(text);
    el.subtaskInput.value = '';
    renderSubtaskChips();
  }

  function removeSubtaskChip(index) {
    tempSubtasks.splice(index, 1);
    renderSubtaskChips();
  }

  function renderSubtaskChips() {
    el.subtasksChipContainer.innerHTML = tempSubtasks.map((st, i) => `
      <div class="subtask-chip">
        <span>${escapeHTML(st)}</span>
        <span class="chip-remove" data-index="${i}">&times;</span>
      </div>
    `).join('');

    el.subtasksChipContainer.querySelectorAll('.chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        removeSubtaskChip(idx);
      });
    });
  }

  // Create Task Action
  function addTaskFromForm() {
    const title = el.quickTitleInput.value.trim();
    if (!title) {
      showToast('Please enter a task title', 'danger');
      el.quickTitleInput.focus();
      return;
    }

    const newTask = {
      id: 'task-' + Date.now(),
      title: title,
      description: el.taskDescInput.value.trim(),
      priority: el.taskPriorityInput.value,
      category: el.taskCategoryInput.value,
      dueDate: el.taskDateInput.value || '',
      completed: false,
      starred: false,
      subtasks: tempSubtasks.map((st, i) => ({
        id: `sub-${Date.now()}-${i}`,
        text: st,
        completed: false
      })),
      createdAt: Date.now()
    };

    tasks.unshift(newTask);
    saveTasks();

    // Reset Form
    el.quickTitleInput.value = '';
    el.taskDescInput.value = '';
    el.taskDateInput.value = '';
    tempSubtasks = [];
    renderSubtaskChips();
    el.expandedCreator.classList.remove('show');

    render();
    showToast('Task added successfully!', 'success');
  }

  // Filter & Sort Logic
  function getFilteredAndSortedTasks() {
    const todayStr = getFormattedDate(0);

    return tasks.filter(task => {
      // Status Filter
      if (currentFilter === 'pending' && task.completed) return false;
      if (currentFilter === 'completed' && !task.completed) return false;
      if (currentFilter === 'today' && task.dueDate !== todayStr) return false;
      if (currentFilter === 'starred' && !task.starred) return false;

      // Category Filter
      if (currentCategory !== 'all' && task.category !== currentCategory) return false;

      // Search Query Filter
      if (searchQuery) {
        const matchTitle = task.title.toLowerCase().includes(searchQuery);
        const matchDesc = task.description.toLowerCase().includes(searchQuery);
        const matchCat = task.category.toLowerCase().includes(searchQuery);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }

      return true;
    }).sort((a, b) => {
      if (currentSort === 'created-desc') return b.createdAt - a.createdAt;
      if (currentSort === 'created-asc') return a.createdAt - b.createdAt;
      if (currentSort === 'priority-desc') return (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
      if (currentSort === 'due-asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (currentSort === 'title-asc') return a.title.localeCompare(b.title);
      return 0;
    });
  }

  // Render UI
  function render() {
    // 1. Update Stats
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = totalCount - completedCount;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    el.statTotal.textContent = totalCount;
    el.statPending.textContent = pendingCount;
    el.statCompleted.textContent = completedCount;
    el.progressPercent.textContent = `${percent}%`;
    el.progressFill.style.width = `${percent}%`;

    // 2. Filter tasks
    const filteredTasks = getFilteredAndSortedTasks();

    // 3. Render List
    if (filteredTasks.length === 0) {
      el.tasksContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3 class="empty-title">No tasks found</h3>
          <p class="empty-desc">${searchQuery ? 'No tasks match your search query.' : 'Try adjusting your filters or create a new task above!'}</p>
        </div>
      `;
      return;
    }

    const todayStr = getFormattedDate(0);

    el.tasksContainer.innerHTML = filteredTasks.map(task => {
      const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;
      const subtaskCompletedCount = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
      const subtaskTotalCount = task.subtasks ? task.subtasks.length : 0;

      return `
        <div class="task-card ${task.completed ? 'completed' : ''} ${task.starred ? 'starred' : ''}" data-id="${task.id}">
          <div class="priority-strip p-${task.priority}"></div>
          
          <div class="task-header">
            <div class="task-checkbox-wrapper">
              <div class="custom-checkbox" data-action="toggle-complete">
                ${task.completed ? `
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ` : ''}
              </div>
              <div class="task-details">
                <div class="task-title-row">
                  <h3 class="task-title">${escapeHTML(task.title)}</h3>
                  <span class="badge badge-${task.priority}">${task.priority}</span>
                  ${task.category ? `<span class="badge badge-category">${escapeHTML(task.category)}</span>` : ''}
                </div>
                ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}

                <div class="task-meta">
                  ${task.dueDate ? `
                    <div class="meta-item ${isOverdue ? 'overdue' : ''}">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>${isOverdue ? 'Overdue: ' : 'Due: '}${task.dueDate}</span>
                    </div>
                  ` : ''}

                  ${subtaskTotalCount > 0 ? `
                    <div class="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <span>Subtasks: ${subtaskCompletedCount}/${subtaskTotalCount}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>

            <div class="task-actions">
              <button class="btn-action star ${task.starred ? 'starred' : ''}" data-action="toggle-star" title="Star Task">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${task.starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
              <button class="btn-action edit" data-action="edit" title="Edit Task">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-action delete" data-action="delete" title="Delete Task">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          ${subtaskTotalCount > 0 ? `
            <div class="task-subtasks">
              ${task.subtasks.map(st => `
                <div class="subtask-item ${st.completed ? 'completed' : ''}" data-action="toggle-subtask" data-sub-id="${st.id}">
                  <div class="subtask-checkbox">
                    ${st.completed ? `
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ` : ''}
                  </div>
                  <span>${escapeHTML(st.text)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach Task Actions Delegate
    el.tasksContainer.querySelectorAll('.task-card').forEach(card => {
      const taskId = card.getAttribute('data-id');

      card.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('[data-action]');
        if (!targetBtn) return;

        const action = targetBtn.getAttribute('data-action');

        if (action === 'toggle-complete') {
          toggleComplete(taskId);
        } else if (action === 'toggle-star') {
          toggleStar(taskId);
        } else if (action === 'delete') {
          deleteTask(taskId);
        } else if (action === 'edit') {
          openEditModal(taskId);
        } else if (action === 'toggle-subtask') {
          const subId = targetBtn.getAttribute('data-sub-id');
          toggleSubtask(taskId, subId);
        }
      });
    });
  }

  // Task Actions
  function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveTasks();
    render();
    showToast(task.completed ? 'Task marked as completed! 🎉' : 'Task marked as pending', 'success');
  }

  function toggleStar(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.starred = !task.starred;
    saveTasks();
    render();
    showToast(task.starred ? 'Task starred ⭐' : 'Task unstarred', 'info');
  }

  function toggleSubtask(taskId, subId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    const st = task.subtasks.find(s => s.id === subId);
    if (st) {
      st.completed = !st.completed;
      saveTasks();
      render();
    }
  }

  function deleteTask(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;
    const removed = tasks.splice(taskIndex, 1)[0];
    saveTasks();
    render();
    showToast(`Deleted "${removed.title}"`, 'danger');
  }

  // Edit Modal Actions
  function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;
    el.editTitle.value = task.title;
    el.editDesc.value = task.description || '';
    el.editPriority.value = task.priority || 'medium';
    el.editCategory.value = task.category || 'Work';
    el.editDate.value = task.dueDate || '';

    el.editModal.classList.add('active');
  }

  function closeModal() {
    el.editModal.classList.remove('active');
    editingTaskId = null;
  }

  function saveEditTask() {
    if (!editingTaskId) return;
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const title = el.editTitle.value.trim();
    if (!title) {
      showToast('Task title cannot be empty', 'danger');
      return;
    }

    task.title = title;
    task.description = el.editDesc.value.trim();
    task.priority = el.editPriority.value;
    task.category = el.editCategory.value;
    task.dueDate = el.editDate.value;

    saveTasks();
    closeModal();
    render();
    showToast('Task updated successfully!', 'success');
  }

  // Toast System
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${escapeHTML(message)}</span>
    `;

    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Utility: Sanitize HTML
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Boot Application when DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
