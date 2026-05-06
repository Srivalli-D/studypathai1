// ============================================================
// notes.js — Notes feature
// ============================================================

let allNotes = [];
let activeCategory = "all";
let searchQuery = "";
let viewingId = null;
let unsubscribe = null;

document.addEventListener("DOMContentLoaded", function() {
  initMobileToggleVisibility();
  initSidebarToggle();
  setActiveNav();

  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
  var addBtn = document.getElementById("add-note-btn");
  if (addBtn) addBtn.addEventListener("click", openAddModal);
  var form = document.getElementById("note-form");
  if (form) form.addEventListener("submit", handleNoteSave);

  var searchEl = document.getElementById("note-search");
  if (searchEl) searchEl.addEventListener("input", function(e) { searchQuery = e.target.value.toLowerCase(); renderNotes(); });

  document.querySelectorAll(".filter-btn[data-cat]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".filter-btn[data-cat]").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeCategory = btn.dataset.cat;
      renderNotes();
    });
  });

  var viewEditBtn = document.getElementById("view-edit-btn");
  if (viewEditBtn) viewEditBtn.addEventListener("click", function() {
    closeModal("note-view-modal");
    if (viewingId) openEditModal(viewingId);
  });
  var viewDelBtn = document.getElementById("view-delete-btn");
  if (viewDelBtn) viewDelBtn.addEventListener("click", function() {
    if (viewingId) deleteNote(viewingId);
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
  const grid = document.getElementById("notes-grid");
  renderSkeletonCards(grid, 6);

  unsubscribe = listenToUserCollection("notes", (docs, err) => {
    if (err) { showError("Failed to load notes."); return; }
    allNotes = docs;
    renderNotes();
  }, { orderBy: "createdAt", orderDir: "desc" });
}

function renderNotes() {
  const grid = document.getElementById("notes-grid");
  if (!grid) return;

  let filtered = [...allNotes];
  if (activeCategory !== "all") filtered = filtered.filter(n => n.category === activeCategory);
  if (searchQuery) filtered = filtered.filter(n =>
    (n.title || "").toLowerCase().includes(searchQuery) ||
    (n.content || "").toLowerCase().includes(searchQuery) ||
    (n.category || "").toLowerCase().includes(searchQuery)
  );

  if (!filtered.length) {
    const msg = allNotes.length ? "No notes match your search." : "No notes yet. Save your learning notes here.";
    renderEmptyState(grid, msg, allNotes.length ? "" : "Add Note", allNotes.length ? null : openAddModal);
    return;
  }

  grid.innerHTML = filtered.map(n => `
    <div class="note-card" onclick="viewNote('${n.id}')" id="note-card-${n.id}">
      <div>
        <div class="note-title">${escHtml(n.title)}</div>
        <div style="margin-top:.4rem;"><span class="badge badge-primary">${escHtml(n.category || "")}</span></div>
      </div>
      <div class="note-preview">${escHtml(n.content || "")}</div>
      <div class="note-footer">
        <span style="font-size:.72rem;color:var(--text-muted);">${formatDate(n.createdAt)}</span>
        <div style="display:flex;gap:.4rem;" onclick="event.stopPropagation()">
          <button class="btn btn-icon btn-ghost btn-sm" onclick="openEditModal('${n.id}')" title="Edit">✏️</button>
          <button class="btn btn-icon btn-danger btn-sm" onclick="deleteNote('${n.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    </div>`).join("");
}

function viewNote(id) {
  const note = allNotes.find(n => n.id === id);
  if (!note) return;
  viewingId = id;
  document.getElementById("view-note-title").textContent  = note.title || "";
  document.getElementById("view-note-cat").textContent    = note.category || "";
  document.getElementById("view-note-content").textContent = note.content || "";
  openModal("note-view-modal");
}

// ── CRUD ─────────────────────────────────────────────────────
async function deleteNote(id) {
  if (!confirmDelete("Delete this note?")) return;
  closeModal("note-view-modal");
  try {
    await deleteUserDocument("notes", id);
    showSuccess("Note deleted.");
  } catch { showError("Failed to delete note."); }
}

function openAddModal() {
  document.getElementById("note-form").reset();
  document.getElementById("note-id").value = "";
  document.getElementById("note-modal-title").textContent = "Add Note";
  document.getElementById("note-form-error").textContent = "";
  openModal("note-modal");
}

function openEditModal(id) {
  const note = allNotes.find(n => n.id === id);
  if (!note) return;
  document.getElementById("note-id").value       = id;
  document.getElementById("note-title").value    = note.title || "";
  document.getElementById("note-category").value = note.category || "";
  document.getElementById("note-content").value  = note.content || "";
  document.getElementById("note-modal-title").textContent = "Edit Note";
  document.getElementById("note-form-error").textContent = "";
  openModal("note-modal");
}

async function handleNoteSave(e) {
  e.preventDefault();
  const errEl = document.getElementById("note-form-error");
  errEl.textContent = "";

  const id       = document.getElementById("note-id").value;
  const title    = document.getElementById("note-title").value.trim();
  const category = document.getElementById("note-category").value;
  const content  = document.getElementById("note-content").value.trim();
  const btn      = document.getElementById("note-save-btn");

  if (!title)    { errEl.textContent = "Title is required."; return; }
  if (!category) { errEl.textContent = "Category is required."; return; }
  if (!content)  { errEl.textContent = "Content is required."; return; }

  showLoading(btn, "Saving…");
  try {
    const data = { title, category, content };
    if (id) {
      await updateUserDocument("notes", id, data);
      showSuccess("Note updated.");
    } else {
      await addUserDocument("notes", data);
      showSuccess("Note saved.");
    }
    closeModal("note-modal");
  } catch { errEl.textContent = "Failed to save note. Please try again."; }
  finally  { hideLoading(btn); }
}

function escHtml(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
