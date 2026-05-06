// ============================================================
// study.js — Study Planner feature
// ============================================================

let allTasks = [];
let activeFilter = "all";
let activePriority = null;
let unsubscribe = null;

document.addEventListener("DOMContentLoaded", function() {
  initMobileToggleVisibility();
  initSidebarToggle();
  setActiveNav();

  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
  var addBtn = document.getElementById("add-task-btn");
  if (addBtn) addBtn.addEventListener("click", openAddModal);
  var form = document.getElementById("task-form");
  if (form) form.addEventListener("submit", handleTaskSave);

  // Status filters
  document.querySelectorAll(".filter-btn[data-filter]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".filter-btn[data-filter]").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Priority filters
  document.querySelectorAll(".filter-btn[data-priority]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var isActive = btn.classList.contains("active");
      document.querySelectorAll(".filter-btn[data-priority]").forEach(function(b) { b.classList.remove("active"); });
      if (isActive) {
        activePriority = null;
      } else {
        btn.classList.add("active");
        activePriority = btn.dataset.priority;
      }
      renderTasks();
    });
  });

  onAuthStateReady(async function(user) {
    if (!user) return;
    var profile = await getUserProfile();
    populateUserUI(user, profile);
    startListening();
  });
});

function startListening() {
  if (unsubscribe) unsubscribe();
  const container = document.getElementById("task-list");
  renderSkeletonCards(container);

  unsubscribe = listenToUserCollection("studyTasks", (docs, err) => {
    if (err) { showError("Failed to load tasks."); return; }
    allTasks = docs;
    renderTasks();
    updateProgress();
  }, { orderBy: "createdAt", orderDir: "desc" });
}

function renderTasks() {
  const container = document.getElementById("task-list");
  if (!container) return;

  let filtered = [...allTasks];
  if (activeFilter === "pending")   filtered = filtered.filter(t => !t.completed);
  if (activeFilter === "completed") filtered = filtered.filter(t => t.completed);
  if (activePriority)               filtered = filtered.filter(t => t.priority === activePriority);

  // Sort by due date
  filtered.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  if (!filtered.length) {
    const msg = allTasks.length ? "No tasks match your filter." : "No study tasks yet. Add your first task to start tracking progress.";
    renderEmptyState(container, msg, allTasks.length ? "" : "Add Task", allTasks.length ? null : openAddModal);
    return;
  }

  container.innerHTML = filtered.map(t => `
    <div class="item-card ${t.completed ? "completed" : ""}" id="task-card-${t.id}">
      <div class="item-card-header">
        <div style="display:flex;align-items:flex-start;gap:.75rem;">
          <button class="task-checkbox ${t.completed ? "checked" : ""}" onclick="toggleComplete('${t.id}', ${!t.completed})" aria-label="Toggle completion" title="${t.completed ? "Mark pending" : "Mark completed"}"></button>
          <div>
            <div class="item-card-title">${escHtml(t.title)}</div>
            ${t.subject ? `<div style="font-size:.78rem;color:var(--text-muted);margin-top:.2rem;">${escHtml(t.subject)}</div>` : ""}
            ${t.source === "performance-auto" ? `<div style="font-size:.7rem;color:var(--primary);margin-top:.2rem;display:flex;align-items:center;gap:.3rem;">📊 <span>Auto-generated from Performance Analyzer</span></div>` : ""}
          </div>
        </div>
        <div class="item-card-actions">
          <button class="btn btn-icon btn-ghost btn-sm" onclick="openEditModal('${t.id}')" title="Edit">✏️</button>
          <button class="btn btn-icon btn-danger btn-sm" onclick="deleteTask('${t.id}')" title="Delete">🗑️</button>
        </div>
      </div>
      <div class="item-card-meta">
        ${t.type     ? `<span class="badge badge-primary">${escHtml(t.type)}</span>` : ""}
        ${t.priority ? priorityBadge(t.priority) : ""}
        ${t.dueDate  ? `<span class="badge badge-muted">📅 ${formatDate(t.dueDate)}</span>` : ""}
        ${t.completed? `<span class="badge badge-success">✓ Completed</span>` : ""}
      </div>
    </div>`).join("");
}

function updateProgress() {
  const total     = allTasks.length;
  const completed = allTasks.filter(t => t.completed).length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  const bar  = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");
  if (bar)  bar.style.width  = pct + "%";
  if (text) text.textContent = `${completed} / ${total} completed (${pct}%)`;
}

// ── CRUD ─────────────────────────────────────────────────────
async function toggleComplete(id, val) {
  try {
    await updateUserDocument("studyTasks", id, { completed: val });
  } catch { showError("Failed to update task."); }
}

async function deleteTask(id) {
  if (!confirmDelete("Delete this study task?")) return;
  try {
    await deleteUserDocument("studyTasks", id);
    showSuccess("Task deleted.");
  } catch { showError("Failed to delete task."); }
}

function openAddModal() {
  document.getElementById("task-form").reset();
  document.getElementById("task-id").value = "";
  document.getElementById("modal-title").textContent = "Add Study Task";
  document.getElementById("task-form-error").textContent = "";
  openModal("task-modal");
}

function openEditModal(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;
  document.getElementById("task-id").value       = id;
  document.getElementById("task-title").value    = task.title || "";
  document.getElementById("task-subject").value  = task.subject || "";
  document.getElementById("task-type").value     = task.type || "";
  document.getElementById("task-priority").value = task.priority || "";
  document.getElementById("task-due").value      = task.dueDate || "";
  document.getElementById("modal-title").textContent = "Edit Study Task";
  document.getElementById("task-form-error").textContent = "";
  openModal("task-modal");
}

async function handleTaskSave(e) {
  e.preventDefault();
  const errEl = document.getElementById("task-form-error");
  errEl.textContent = "";

  const id       = document.getElementById("task-id").value;
  const title    = document.getElementById("task-title").value.trim();
  const subject  = document.getElementById("task-subject").value.trim();
  const type     = document.getElementById("task-type").value;
  const priority = document.getElementById("task-priority").value;
  const dueDate  = document.getElementById("task-due").value;
  const btn      = document.getElementById("task-save-btn");

  if (!title)    { errEl.textContent = "Task title is required."; return; }
  if (!type)     { errEl.textContent = "Type is required."; return; }
  if (!priority) { errEl.textContent = "Priority is required."; return; }

  const data = { title, subject, type, priority, dueDate, completed: false };
  showLoading(btn, "Saving…");
  try {
    if (id) {
      delete data.completed; // don't reset on edit
      await updateUserDocument("studyTasks", id, data);
      showSuccess("Task updated.");
    } else {
      await addUserDocument("studyTasks", data);
      showSuccess("Task added.");
    }
    closeModal("task-modal");
  } catch (err) {
    errEl.textContent = "Failed to save task. Please try again.";
  } finally {
    hideLoading(btn);
  }
}

function escHtml(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
