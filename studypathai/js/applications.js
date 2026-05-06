// ============================================================
// applications.js — Internship / Application Tracker
// ============================================================

let allApps = [];
let activeFilter = "all";
let unsubscribe = null;

document.addEventListener("DOMContentLoaded", function() {
  initMobileToggleVisibility();
  initSidebarToggle();
  setActiveNav();

  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
  var addBtn = document.getElementById("add-app-btn");
  if (addBtn) addBtn.addEventListener("click", openAddModal);
  var form = document.getElementById("app-form");
  if (form) form.addEventListener("submit", handleAppSave);

  document.querySelectorAll(".filter-btn[data-status]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".filter-btn[data-status]").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeFilter = btn.dataset.status;
      renderApps();
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
  const grid = document.getElementById("apps-grid");
  renderSkeletonCards(grid);

  unsubscribe = listenToUserCollection("applications", (docs, err) => {
    if (err) { showError("Failed to load applications."); return; }
    allApps = docs;
    renderApps();
  }, { orderBy: "createdAt", orderDir: "desc" });
}

function renderApps() {
  const grid = document.getElementById("apps-grid");
  if (!grid) return;

  const filtered = activeFilter === "all"
    ? [...allApps]
    : allApps.filter(a => a.status === activeFilter);

  if (!filtered.length) {
    const msg = allApps.length ? `No applications with status "${activeFilter}".` : "No applications yet. Add your first internship application.";
    renderEmptyState(grid, msg, allApps.length ? "" : "Add Application", allApps.length ? null : openAddModal);
    return;
  }

  grid.innerHTML = filtered.map(a => `
    <div class="app-card" id="app-card-${a.id}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem;">
        <div>
          <div class="app-company">${escHtml(a.company)}</div>
          <div class="app-role">${escHtml(a.role)}</div>
        </div>
        <div style="display:flex;gap:.4rem;flex-shrink:0;">
          <button class="btn btn-icon btn-ghost btn-sm" onclick="openEditModal('${a.id}')" title="Edit">✏️</button>
          <button class="btn btn-icon btn-danger btn-sm" onclick="deleteApp('${a.id}')" title="Delete">🗑️</button>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;">
        ${statusBadge(a.status)}
        ${a.appliedDate ? `<span class="badge badge-muted">📅 ${formatDate(a.appliedDate)}</span>` : ""}
      </div>

      ${a.notes ? `<div class="app-notes-preview">${escHtml(a.notes)}</div>` : ""}

      <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;flex-wrap:wrap;padding-top:.5rem;border-top:1px solid var(--border);">
        <div>
          <label style="font-size:.72rem;color:var(--text-muted);">Update status:</label>
          <select class="status-select" onchange="quickUpdateStatus('${a.id}', this.value)">
            ${["Applied","In Progress","Interview","Selected","Rejected"].map(s =>
              `<option value="${s}" ${a.status === s ? "selected" : ""}>${s}</option>`
            ).join("")}
          </select>
        </div>
        ${a.link ? `<a href="${escHtml(a.link)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm">🔗 View Job</a>` : ""}
      </div>
    </div>`).join("");
}

// ── Quick status update ──────────────────────────────────────
async function quickUpdateStatus(id, status) {
  try {
    await updateUserDocument("applications", id, { status });
    showSuccess("Status updated.");
  } catch { showError("Failed to update status."); }
}

// ── CRUD ─────────────────────────────────────────────────────
async function deleteApp(id) {
  if (!confirmDelete("Delete this application?")) return;
  try {
    await deleteUserDocument("applications", id);
    showSuccess("Application deleted.");
  } catch(err) { showError("Failed to delete."); }
}

function openAddModal() {
  document.getElementById("app-form").reset();
  document.getElementById("app-id").value = "";
  document.getElementById("app-modal-title").textContent = "Add Application";
  document.getElementById("app-form-error").textContent = "";
  openModal("app-modal");
}

function openEditModal(id) {
  const app = allApps.find(a => a.id === id);
  if (!app) return;
  document.getElementById("app-id").value      = id;
  document.getElementById("app-company").value = app.company || "";
  document.getElementById("app-role").value    = app.role || "";
  document.getElementById("app-status").value  = app.status || "";
  document.getElementById("app-date").value    = app.appliedDate || "";
  document.getElementById("app-link").value    = app.link || "";
  document.getElementById("app-notes").value   = app.notes || "";
  document.getElementById("app-modal-title").textContent = "Edit Application";
  document.getElementById("app-form-error").textContent = "";
  openModal("app-modal");
}

async function handleAppSave(e) {
  e.preventDefault();
  const errEl = document.getElementById("app-form-error");
  errEl.textContent = "";

  const id      = document.getElementById("app-id").value;
  const company = document.getElementById("app-company").value.trim();
  const role    = document.getElementById("app-role").value.trim();
  const status  = document.getElementById("app-status").value;
  const date    = document.getElementById("app-date").value;
  const link    = document.getElementById("app-link").value.trim();
  const notes   = document.getElementById("app-notes").value.trim();
  const btn     = document.getElementById("app-save-btn");

  if (!company) { errEl.textContent = "Company name is required."; return; }
  if (!role)    { errEl.textContent = "Role is required."; return; }
  if (!status)  { errEl.textContent = "Status is required."; return; }

  showLoading(btn, "Saving…");
  try {
    const data = { company, role, status, appliedDate: date, link, notes };
    if (id) {
      await updateUserDocument("applications", id, data);
      showSuccess("Application updated.");
    } else {
      await addUserDocument("applications", data);
      showSuccess("Application added.");
    }
    closeModal("app-modal");
  } catch(err) { errEl.textContent = "Failed to save. Please try again."; }
  finally       { hideLoading(btn); }
}

function escHtml(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
