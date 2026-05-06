// ============================================================
// assignments.js — Assignment Tracker
// ============================================================

let allAssignments = [];
let activeFilter   = "all";
let activePriority = null;
let unsubscribe    = null;

document.addEventListener("DOMContentLoaded", function() {
  initMobileToggleVisibility();
  initSidebarToggle();
  setActiveNav();

  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
  var addBtn = document.getElementById("add-assign-btn");
  if (addBtn) addBtn.addEventListener("click", openAddModal);
  var form = document.getElementById("assign-form");
  if (form) form.addEventListener("submit", handleSave);

  document.querySelectorAll(".filter-btn[data-filter]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".filter-btn[data-filter]").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderAssignments();
    });
  });

  document.querySelectorAll(".filter-btn[data-priority]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var isActive = btn.classList.contains("active");
      document.querySelectorAll(".filter-btn[data-priority]").forEach(function(b) { b.classList.remove("active"); });
      activePriority = isActive ? null : btn.dataset.priority;
      if (!isActive) btn.classList.add("active");
      renderAssignments();
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
  const grid = document.getElementById("assign-grid");
  renderSkeletonCards(grid);

  unsubscribe = listenToUserCollection("assignments", (docs, err) => {
    if (err) { showError("Failed to load assignments."); return; }
    allAssignments = docs;
    renderAssignments();
  }, { orderBy: "createdAt", orderDir: "desc" });
}

function renderAssignments() {
  const grid = document.getElementById("assign-grid");
  if (!grid) return;

  let filtered = [...allAssignments];
  if (activeFilter !== "all")  filtered = filtered.filter(a => a.status === activeFilter);
  if (activePriority)           filtered = filtered.filter(a => a.priority === activePriority);

  // Sort by deadline (earliest first)
  filtered.sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1; if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  if (!filtered.length) {
    const msg = allAssignments.length ? "No assignments match your filter." : "No assignments yet. Add your academic deadlines.";
    renderEmptyState(grid, msg, allAssignments.length ? "" : "Add Assignment", allAssignments.length ? null : openAddModal);
    return;
  }

  grid.innerHTML = filtered.map(a => {
    const ds = getDeadlineStatus(a.deadline, a.status);
    return `
    <div class="assign-card ${a.status === "Submitted" ? "submitted" : ""}" id="assign-card-${a.id}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem;">
        <div>
          <div style="font-size:.95rem;font-weight:700;">${escHtml(a.title)}</div>
          <div style="font-size:.8rem;color:var(--text-muted);">${escHtml(a.subject || "")}</div>
          ${a.source === "performance-auto" ? `<div style="font-size:.7rem;color:var(--primary);margin-top:.2rem;display:flex;align-items:center;gap:.3rem;">📊 <span>Auto-generated from Performance Analyzer</span></div>` : ""}
        </div>
        <div style="display:flex;gap:.4rem;flex-shrink:0;">
          <button class="btn btn-icon btn-ghost btn-sm" onclick="openEditModal('${a.id}')" title="Edit">✏️</button>
          <button class="btn btn-icon btn-danger btn-sm" onclick="deleteAssignment('${a.id}')" title="Delete">🗑️</button>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;">
        ${priorityBadge(a.priority)}
        <span class="badge ${ds.cls}">${ds.label}</span>
        ${a.deadline ? `<span class="badge badge-muted">📅 ${formatDate(a.deadline)}</span>` : ""}
      </div>

      ${a.notes ? `<div style="font-size:.78rem;color:var(--text-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escHtml(a.notes)}</div>` : ""}

      <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding-top:.5rem;border-top:1px solid var(--border);">
        <button class="btn btn-sm ${a.status === "Submitted" ? "btn-ghost" : "btn-success"}"
          onclick="toggleStatus('${a.id}', '${a.status}')">
          ${a.status === "Submitted" ? "↩ Mark Pending" : "✓ Mark Submitted"}
        </button>
        ${a.submissionLink ? `<a href="${escHtml(a.submissionLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm">🔗 Submit</a>` : ""}
      </div>
    </div>`;
  }).join("");
}

async function toggleStatus(id, current) {
  const newStatus = current === "Submitted" ? "Pending" : "Submitted";
  try {
    await updateUserDocument("assignments", id, { status: newStatus });
    showSuccess(`Marked as ${newStatus}.`);
  } catch { showError("Failed to update status."); }
}

async function deleteAssignment(id) {
  if (!confirmDelete("Delete this assignment?")) return;
  try {
    await deleteUserDocument("assignments", id);
    showSuccess("Assignment deleted.");
  } catch { showError("Failed to delete."); }
}

function openAddModal() {
  document.getElementById("assign-form").reset();
  document.getElementById("assign-id").value = "";
  document.getElementById("assign-modal-title").textContent = "Add Assignment";
  document.getElementById("assign-form-error").textContent = "";
  openModal("assign-modal");
}

function openEditModal(id) {
  const a = allAssignments.find(x => x.id === id);
  if (!a) return;
  document.getElementById("assign-id").value       = id;
  document.getElementById("assign-title").value    = a.title || "";
  document.getElementById("assign-subject").value  = a.subject || "";
  document.getElementById("assign-priority").value = a.priority || "";
  document.getElementById("assign-status").value   = a.status || "";
  document.getElementById("assign-deadline").value = a.deadline || "";
  document.getElementById("assign-link").value     = a.submissionLink || "";
  document.getElementById("assign-notes").value    = a.notes || "";
  document.getElementById("assign-modal-title").textContent = "Edit Assignment";
  document.getElementById("assign-form-error").textContent = "";
  openModal("assign-modal");
}

async function handleSave(e) {
  e.preventDefault();
  const errEl = document.getElementById("assign-form-error");
  errEl.textContent = "";

  const id       = document.getElementById("assign-id").value;
  const title    = document.getElementById("assign-title").value.trim();
  const subject  = document.getElementById("assign-subject").value.trim();
  const priority = document.getElementById("assign-priority").value;
  const status   = document.getElementById("assign-status").value;
  const deadline = document.getElementById("assign-deadline").value;
  const link     = document.getElementById("assign-link").value.trim();
  const notes    = document.getElementById("assign-notes").value.trim();
  const btn      = document.getElementById("assign-save-btn");

  if (!title)    { errEl.textContent = "Title is required."; return; }
  if (!subject)  { errEl.textContent = "Subject is required."; return; }
  if (!priority) { errEl.textContent = "Priority is required."; return; }
  if (!status)   { errEl.textContent = "Status is required."; return; }

  showLoading(btn, "Saving…");
  try {
    const data = { title, subject, priority, status, deadline, submissionLink: link, notes };
    if (id) {
      await updateUserDocument("assignments", id, data);
      showSuccess("Assignment updated.");
    } else {
      await addUserDocument("assignments", data);
      showSuccess("Assignment added.");
    }
    closeModal("assign-modal");
  } catch { errEl.textContent = "Failed to save. Please try again."; }
  finally  { hideLoading(btn); }
}

function escHtml(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
