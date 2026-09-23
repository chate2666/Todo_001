/**
 * Taskify - Modern Glassmorphism TODO Application
 * ES6 Vanilla JavaScript Logic
 */

(function () {
  'use strict';

  // State Store Keys
  const STORAGE_KEY = 'taskify_tasks_v1';
  const THEME_KEY = 'taskify_theme_v1';
  const NOTEPAD_STORAGE_KEY = 'taskify_notepad_v1';

  // Sample Notes for First Load
  const SAMPLE_NOTES = [
    {
      id: 'note-1',
      title: 'Taskify Feature Ideas & Roadmap',
      content: `Brainstorming key improvements and upcoming ideas:
- [ ] Add sound effects for task completion
- [ ] Export tasks and notes to JSON or Markdown
- [ ] Keyboard shortcuts modal (Press ?)
- [ ] Pomodoro productivity focus timer

*Tips: You can click "Convert to Task" below to turn this note into a real Todo item with subtasks!*`,
      category: 'Ideas',
      pinned: true,
      createdAt: Date.now() - 3600000 * 24,
      updatedAt: Date.now() - 3600000 * 2
    },
    {
      id: 'note-2',
      title: 'Weekly Standup Notes & Agenda',
      content: `Sprint review deliverables & priorities:
- Review completed glassmorphism components
- Test responsive layout on mobile viewports
- Verify local storage persistence across sessions

Next sync scheduled for Monday 10:00 AM.`,
      category: 'Work',
      pinned: false,
      createdAt: Date.now() - 3600000 * 48,
      updatedAt: Date.now() - 3600000 * 12
    }
  ];

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

  // Notepad State
  let notes = [];
  let activeNoteId = null;
  let currentView = 'tasks'; // 'tasks' | 'notepad'
  let notesCategoryFilter = 'all';
  let notesSearchQuery = '';
  let saveNoteTimeout = null;

  // DOM Elements
  const el = {
    themeToggle: document.getElementById('theme-toggle'),
    themeIconMoon: document.getElementById('theme-icon-moon'),
    themeIconSun: document.getElementById('theme-icon-sun'),
    btnReset: document.getElementById('btn-reset'),
    
    // View Navigation
    viewTabTasks: document.getElementById('view-tab-tasks'),
    viewTabNotepad: document.getElementById('view-tab-notepad'),
    tasksView: document.getElementById('tasks-view'),
    notepadView: document.getElementById('notepad-view'),
    navTasksCount: document.getElementById('nav-tasks-count'),
    navNotesCount: document.getElementById('nav-notes-count'),

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

    // Notepad Sidebar
    btnNewNote: document.getElementById('btn-new-note'),
    btnNewNoteEmpty: document.getElementById('btn-new-note-empty'),
    notesSearchInput: document.getElementById('notes-search-input'),
    notesCategoryChips: document.getElementById('notes-category-chips'),
    notesList: document.getElementById('notes-list'),

    // Notepad Editor
    notesEditorPane: document.getElementById('notes-editor-pane'),
    noteActiveEditor: document.getElementById('note-active-editor'),
    noteEmptyEditor: document.getElementById('note-empty-editor'),
    noteTitleInput: document.getElementById('note-title-input'),
    noteCategorySelect: document.getElementById('note-category-select'),
    btnPinNote: document.getElementById('btn-pin-note'),
    pinIcon: document.getElementById('pin-icon'),
    btnDeleteNote: document.getElementById('btn-delete-note'),
    noteContentInput: document.getElementById('note-content-input'),
    noteSaveStatus: document.getElementById('note-save-status'),
    noteSaveText: document.getElementById('note-save-text'),
    noteWordCount: document.getElementById('note-word-count'),
    noteCharCount: document.getElementById('note-char-count'),
    noteUpdatedTime: document.getElementById('note-updated-time'),
    btnCopyNote: document.getElementById('btn-copy-note'),
    btnConvertTask: document.getElementById('btn-convert-task'),

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
    loadNotes();
    bindEvents();
    render();
    renderNotepad();
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

    // View Navigation Tabs
    el.viewTabTasks.addEventListener('click', () => switchView('tasks'));
    el.viewTabNotepad.addEventListener('click', () => switchView('notepad'));

    // Notepad Actions
    el.btnNewNote.addEventListener('click', createNewNote);
    el.btnNewNoteEmpty.addEventListener('click', createNewNote);

    // Search Notes
    el.notesSearchInput.addEventListener('input', (e) => {
      notesSearchQuery = e.target.value.toLowerCase().trim();
      renderNotesList();
    });

    // Notes Category Filter Chips
    el.notesCategoryChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.note-cat-chip');
      if (!chip) return;
      document.querySelectorAll('.note-cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      notesCategoryFilter = chip.getAttribute('data-cat');
      renderNotesList();
    });

    // Note Inputs
    el.noteTitleInput.addEventListener('input', () => onNoteInputChange('title'));
    el.noteContentInput.addEventListener('input', () => onNoteInputChange('content'));
    el.noteCategorySelect.addEventListener('change', () => onNoteInputChange('category'));

    // Note Toolbar & Actions
    el.btnPinNote.addEventListener('click', togglePinActiveNote);
    el.btnDeleteNote.addEventListener('click', deleteActiveNote);
    el.btnCopyNote.addEventListener('click', copyActiveNote);
    el.btnConvertTask.addEventListener('click', convertActiveNoteToTask);

    // Formatting Tools
    const toolbar = document.querySelector('.editor-toolbar');
    if (toolbar) {
      toolbar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-tool]');
        if (btn) {
          applyFormatting(btn.getAttribute('data-tool'));
        }
      });
    }

    // Keyboard Shortcuts: Ctrl+S to save note (prevent browser save dialog), Alt+N for new note
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        if (currentView === 'notepad') {
          e.preventDefault();
          saveNotes();
          setSavingStatus(false);
          showToast('Note saved ✓', 'info');
        }
      }
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
    updateNavBadges();

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

  // ==========================================
  // Notepad System & Business Logic
  // ==========================================

  function loadNotes() {
    const raw = localStorage.getItem(NOTEPAD_STORAGE_KEY);
    if (raw) {
      try {
        notes = JSON.parse(raw);
      } catch (e) {
        notes = [...SAMPLE_NOTES];
      }
    } else {
      notes = [...SAMPLE_NOTES];
      saveNotes();
    }
    if (notes.length > 0 && !activeNoteId) {
      activeNoteId = notes[0].id;
    }
  }

  function saveNotes() {
    localStorage.setItem(NOTEPAD_STORAGE_KEY, JSON.stringify(notes));
    updateNavBadges();
  }

  function updateNavBadges() {
    const pendingCount = tasks.filter(t => !t.completed).length;
    if (el.navTasksCount) el.navTasksCount.textContent = pendingCount;
    if (el.navNotesCount) el.navNotesCount.textContent = notes.length;
  }

  function switchView(view) {
    currentView = view;
    if (view === 'tasks') {
      el.viewTabTasks.classList.add('active');
      el.viewTabNotepad.classList.remove('active');
      el.tasksView.style.display = 'flex';
      el.notepadView.style.display = 'none';
      render();
    } else {
      el.viewTabNotepad.classList.add('active');
      el.viewTabTasks.classList.remove('active');
      el.tasksView.style.display = 'none';
      el.notepadView.style.display = 'flex';
      renderNotepad();
    }
  }

  function getFilteredNotes() {
    return notes.filter(note => {
      // Category filter
      if (notesCategoryFilter !== 'all' && note.category !== notesCategoryFilter) {
        return false;
      }
      // Search filter
      if (notesSearchQuery) {
        const titleMatch = (note.title || '').toLowerCase().includes(notesSearchQuery);
        const contentMatch = (note.content || '').toLowerCase().includes(notesSearchQuery);
        const catMatch = (note.category || '').toLowerCase().includes(notesSearchQuery);
        if (!titleMatch && !contentMatch && !catMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      // Pinned notes first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Then newest updated first
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }

  function renderNotepad() {
    renderNotesList();
    renderActiveNoteEditor();
    updateNavBadges();
  }

  function renderNotesList() {
    const filtered = getFilteredNotes();

    // Check if activeNoteId still exists in filtered notes; if not, select the first
    if (filtered.length > 0 && !filtered.some(n => n.id === activeNoteId)) {
      activeNoteId = filtered[0].id;
      renderActiveNoteEditor();
    } else if (filtered.length === 0) {
      activeNoteId = null;
      renderActiveNoteEditor();
    }

    if (filtered.length === 0) {
      el.notesList.innerHTML = `
        <div class="empty-state" style="padding: 2.5rem 1rem;">
          <p style="font-size: 0.875rem; color: var(--text-dim); text-align: center;">No notes match your filters.</p>
        </div>
      `;
      return;
    }

    el.notesList.innerHTML = filtered.map(note => {
      const isActive = note.id === activeNoteId;
      const excerpt = note.content ? note.content.replace(/[#*`_\[\]-]/g, '').trim() : 'No additional text...';
      return `
        <div class="note-card ${isActive ? 'active' : ''}" data-id="${note.id}">
          <div class="note-card-header">
            <span class="note-card-title">${escapeHTML(note.title || 'Untitled Note')}</span>
            ${note.pinned ? `
              <span class="note-card-pin" title="Pinned Note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
            ` : ''}
          </div>
          <p class="note-card-excerpt">${escapeHTML(excerpt)}</p>
          <div class="note-card-meta">
            <span class="note-card-badge cat-${note.category}">${escapeHTML(note.category)}</span>
            <span class="note-card-date">${formatTimeAgo(note.updatedAt)}</span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events to cards
    el.notesList.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        selectNote(id);
      });
    });
  }

  function renderActiveNoteEditor() {
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) {
      el.noteActiveEditor.style.display = 'none';
      el.noteEmptyEditor.style.display = 'flex';
      return;
    }

    el.noteActiveEditor.style.display = 'flex';
    el.noteEmptyEditor.style.display = 'none';

    el.noteTitleInput.value = note.title || '';
    el.noteContentInput.value = note.content || '';
    el.noteCategorySelect.value = note.category || 'Ideas';

    if (note.pinned) {
      el.btnPinNote.classList.add('pinned');
      el.pinIcon.setAttribute('fill', 'currentColor');
    } else {
      el.btnPinNote.classList.remove('pinned');
      el.pinIcon.setAttribute('fill', 'none');
    }

    setSavingStatus(false);
    updateEditorStats(note);
  }

  function selectNote(id) {
    if (activeNoteId === id) return;
    activeNoteId = id;

    // Update active class in sidebar list
    el.notesList.querySelectorAll('.note-card').forEach(card => {
      if (card.getAttribute('data-id') === id) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    renderActiveNoteEditor();
  }

  function createNewNote() {
    const newNote = {
      id: 'note-' + Date.now(),
      title: 'Untitled Note',
      content: '',
      category: notesCategoryFilter !== 'all' ? notesCategoryFilter : 'Ideas',
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    notes.unshift(newNote);
    activeNoteId = newNote.id;
    saveNotes();
    renderNotepad();
    showToast('New note created', 'info');

    // Focus note title input for immediate writing
    setTimeout(() => {
      if (el.noteTitleInput) {
        el.noteTitleInput.focus();
        el.noteTitleInput.select();
      }
    }, 50);
  }

  function togglePinActiveNote() {
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;

    note.pinned = !note.pinned;
    note.updatedAt = Date.now();
    saveNotes();
    renderNotepad();
    showToast(note.pinned ? 'Note pinned to top 📌' : 'Note unpinned', 'info');
  }

  function deleteActiveNote() {
    const noteIndex = notes.findIndex(n => n.id === activeNoteId);
    if (noteIndex === -1) return;

    const note = notes[noteIndex];
    if (!confirm(`Delete note "${note.title}"?`)) return;

    notes.splice(noteIndex, 1);
    activeNoteId = notes.length > 0 ? notes[0].id : null;
    saveNotes();
    renderNotepad();
    showToast(`Deleted note "${note.title}"`, 'danger');
  }

  function onNoteInputChange(field) {
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;

    if (field === 'title') {
      note.title = el.noteTitleInput.value.trim() || 'Untitled Note';
    } else if (field === 'content') {
      note.content = el.noteContentInput.value;
    } else if (field === 'category') {
      note.category = el.noteCategorySelect.value;
    }
    note.updatedAt = Date.now();

    updateEditorStats(note);
    updateNoteCardInList(note);

    setSavingStatus(true);
    clearTimeout(saveNoteTimeout);
    saveNoteTimeout = setTimeout(() => {
      saveNotes();
      setSavingStatus(false);
    }, 350);
  }

  function updateNoteCardInList(note) {
    const card = el.notesList.querySelector(`.note-card[data-id="${note.id}"]`);
    if (!card) return;

    const titleEl = card.querySelector('.note-card-title');
    const excerptEl = card.querySelector('.note-card-excerpt');
    const dateEl = card.querySelector('.note-card-date');
    const badgeEl = card.querySelector('.note-card-badge');

    if (titleEl) titleEl.textContent = note.title || 'Untitled Note';
    if (excerptEl) {
      const excerpt = note.content ? note.content.replace(/[#*`_\[\]-]/g, '').trim() : 'No additional text...';
      excerptEl.textContent = excerpt;
    }
    if (dateEl) dateEl.textContent = formatTimeAgo(note.updatedAt);
    if (badgeEl) {
      badgeEl.textContent = note.category;
      badgeEl.className = `note-card-badge cat-${note.category}`;
    }
  }

  function updateEditorStats(note) {
    const text = note.content || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    if (el.noteWordCount) el.noteWordCount.textContent = `${words} word${words === 1 ? '' : 's'}`;
    if (el.noteCharCount) el.noteCharCount.textContent = `${chars} char${chars === 1 ? '' : 's'}`;
    if (el.noteUpdatedTime) el.noteUpdatedTime.textContent = `Updated ${formatTimeAgo(note.updatedAt)}`;
  }

  function setSavingStatus(saving) {
    if (!el.noteSaveStatus || !el.noteSaveText) return;
    if (saving) {
      el.noteSaveStatus.classList.add('saving');
      el.noteSaveText.textContent = 'Saving...';
    } else {
      el.noteSaveStatus.classList.remove('saving');
      el.noteSaveText.textContent = 'Saved';
    }
  }

  function copyActiveNote() {
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;

    const textToCopy = `${note.title}\n\n${note.content || ''}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Note copied to clipboard! 📋', 'success');
      }).catch(() => {
        showToast('Could not copy to clipboard', 'danger');
      });
    } else {
      showToast('Clipboard copy unavailable', 'danger');
    }
  }

  function convertActiveNoteToTask() {
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;

    const lines = (note.content || '').split('\n');
    const subtasks = [];
    const descLines = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ')) {
        subtasks.push({
          id: `sub-${Date.now()}-${i}`,
          text: trimmed.replace(/^- \[[ x]\] /, '').trim(),
          completed: trimmed.startsWith('- [x] ')
        });
      } else if (trimmed.startsWith('- ')) {
        subtasks.push({
          id: `sub-${Date.now()}-${i}`,
          text: trimmed.substring(2).trim(),
          completed: false
        });
      } else if (trimmed) {
        descLines.push(trimmed);
      }
    });

    const validCategories = ['Personal', 'Work', 'Shopping', 'Health', 'Ideas'];
    const taskCategory = validCategories.includes(note.category) ? note.category : 'Ideas';

    const newTask = {
      id: 'task-' + Date.now(),
      title: note.title || 'Task from Note',
      description: descLines.slice(0, 3).join(' '),
      priority: 'medium',
      category: taskCategory,
      dueDate: '',
      completed: false,
      starred: note.pinned || false,
      subtasks: subtasks,
      createdAt: Date.now()
    };

    tasks.unshift(newTask);
    saveTasks();
    render();
    switchView('tasks');
    showToast(`Converted note to task: "${newTask.title}"! 🎉`, 'success');
  }

  function applyFormatting(tool) {
    const textarea = el.noteContentInput;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';

    switch (tool) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        break;
      case 'checklist':
        replacement = selected ? selected.split('\n').map(l => `- [ ] ${l}`).join('\n') : '- [ ] ';
        break;
      case 'bullet':
        replacement = selected ? selected.split('\n').map(l => `- ${l}`).join('\n') : '- ';
        break;
      case 'code':
        if (selected.includes('\n')) {
          replacement = `\`\`\`\n${selected}\n\`\`\``;
        } else {
          replacement = `\`${selected || 'code'}\``;
        }
        break;
      case 'timestamp':
        const now = new Date();
        replacement = `[${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] `;
        break;
      default:
        return;
    }

    textarea.focus();
    textarea.setRangeText(replacement, start, end, 'end');
    onNoteInputChange('content');
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'just now';
    const elapsed = Date.now() - timestamp;
    const mins = Math.floor(elapsed / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
