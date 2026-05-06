// ============================================================
// skills.js — Skill Tracker feature
// ============================================================

let allSkills = [];
let activeCategory = "all";
let unsubscribe = null;

document.addEventListener("DOMContentLoaded", function() {
  initMobileToggleVisibility();
  initSidebarToggle();
  setActiveNav();

  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
  var addBtn = document.getElementById("add-skill-btn");
  if (addBtn) addBtn.addEventListener("click", openAddModal);
  var form = document.getElementById("skill-form");
  if (form) form.addEventListener("submit", handleSkillSave);

  // Range display
  var rangeInput = document.getElementById("skill-progress");
  var display    = document.getElementById("progress-display");
  if (rangeInput) rangeInput.addEventListener("input", function() { if (display) display.textContent = rangeInput.value; });

  // Category filters
  document.querySelectorAll(".filter-btn[data-cat]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".filter-btn[data-cat]").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeCategory = btn.dataset.cat;
      renderSkills();
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
  const grid = document.getElementById("skills-grid");
  renderSkeletonCards(grid);

  unsubscribe = listenToUserCollection("skills", (docs, err) => {
    if (err) { showError("Failed to load skills."); return; }
    allSkills = docs;
    renderSkills();
    updateAverage();
  }, { orderBy: "createdAt", orderDir: "desc" });
}

function renderSkills() {
  const grid = document.getElementById("skills-grid");
  if (!grid) return;

  const filtered = activeCategory === "all"
    ? [...allSkills]
    : allSkills.filter(s => s.category === activeCategory);

  if (!filtered.length) {
    renderEmptyState(grid, "No skills tracked yet. Add your first skill and start levelling up.", "Add Skill", openAddModal);
    return;
  }

  grid.innerHTML = filtered.map(s => {
    const pct = Math.min(100, Math.max(0, s.progress || 0));
    const levelCls = { Beginner:"badge-success", Intermediate:"badge-warning", Advanced:"badge-danger" }[s.level] || "badge-muted";
    const barColor = pct >= 70 ? "linear-gradient(90deg,#22c55e,#22d3ee)" : pct >= 40 ? "linear-gradient(90deg,#38bdf8,#8b5cf6)" : "linear-gradient(90deg,#f59e0b,#ef4444)";

    return `
    <div class="skill-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem;">
        <div>
          <div style="font-size:.95rem;font-weight:700;">${escHtml(s.name)}</div>
          ${s.source === "performance-auto" ? `<div style="font-size:.7rem;color:var(--primary);margin-top:.2rem;display:flex;align-items:center;gap:.3rem;">📊 <span>Updated from Performance Analyzer</span></div>` : ""}
          <div class="item-card-meta" style="margin-top:.4rem;">
            <span class="badge badge-primary">${escHtml(s.category || "")}</span>
            <span class="badge ${levelCls}">${escHtml(s.level || "")}</span>
          </div>
        </div>
        <div style="display:flex;gap:.4rem;">
          <button class="btn btn-icon btn-ghost btn-sm" onclick="openEditModal('${s.id}')" title="Edit">✏️</button>
          <button class="btn btn-icon btn-danger btn-sm" onclick="deleteSkill('${s.id}')" title="Delete">🗑️</button>
        </div>
      </div>
      <div class="skill-progress-row">
        <div class="progress-wrap" style="flex:1;height:10px;">
          <div class="progress-bar" style="width:${pct}%;background:${barColor};"></div>
        </div>
        <div class="skill-pct">${pct}%</div>
      </div>
    </div>`;
  }).join("");
}

function updateAverage() {
  const avg = allSkills.length
    ? Math.round(allSkills.reduce((s, k) => s + (k.progress || 0), 0) / allSkills.length)
    : 0;
  const avgEl  = document.getElementById("avg-progress");
  const barEl  = document.getElementById("avg-bar");
  const subEl  = document.getElementById("avg-sub");
  if (avgEl)  avgEl.textContent  = avg + "%";
  if (barEl)  barEl.style.width  = avg + "%";
  if (subEl)  subEl.textContent  = allSkills.length ? `${allSkills.length} skill${allSkills.length !== 1 ? "s" : ""} tracked` : "No skills tracked yet";
}

// ── CRUD ─────────────────────────────────────────────────────
async function deleteSkill(id) {
  if (!confirmDelete("Delete this skill?")) return;
  try {
    await deleteUserDocument("skills", id);
    showSuccess("Skill deleted.");
  } catch { showError("Failed to delete skill."); }
}

function openAddModal() {
  document.getElementById("skill-form").reset();
  document.getElementById("skill-id").value = "";
  document.getElementById("skill-modal-title").textContent = "Add Skill";
  document.getElementById("progress-display").textContent = "0";
  document.getElementById("skill-progress").value = "0";
  document.getElementById("skill-form-error").textContent = "";
  openModal("skill-modal");
}

function openEditModal(id) {
  const skill = allSkills.find(s => s.id === id);
  if (!skill) return;
  document.getElementById("skill-id").value       = id;
  document.getElementById("skill-name").value     = skill.name || "";
  document.getElementById("skill-category").value = skill.category || "";
  document.getElementById("skill-level").value    = skill.level || "";
  const pct = skill.progress || 0;
  document.getElementById("skill-progress").value  = pct;
  document.getElementById("progress-display").textContent = pct;
  document.getElementById("skill-modal-title").textContent = "Edit Skill";
  document.getElementById("skill-form-error").textContent = "";
  openModal("skill-modal");
}

async function handleSkillSave(e) {
  e.preventDefault();
  const errEl = document.getElementById("skill-form-error");
  errEl.textContent = "";

  const id       = document.getElementById("skill-id").value;
  const name     = document.getElementById("skill-name").value.trim();
  const category = document.getElementById("skill-category").value;
  const level    = document.getElementById("skill-level").value;
  const progress = parseInt(document.getElementById("skill-progress").value, 10);
  const btn      = document.getElementById("skill-save-btn");

  if (!name)     { errEl.textContent = "Skill name is required."; return; }
  if (!category) { errEl.textContent = "Category is required."; return; }
  if (!level)    { errEl.textContent = "Level is required."; return; }
  if (isNaN(progress) || progress < 0 || progress > 100) { errEl.textContent = "Progress must be 0–100."; return; }

  showLoading(btn, "Saving…");
  try {
    const data = { name, category, level, progress };
    if (id) {
      await updateUserDocument("skills", id, data);
      showSuccess("Skill updated.");
    } else {
      await addUserDocument("skills", data);
      showSuccess("Skill added.");
    }
    closeModal("skill-modal");
  } catch { errEl.textContent = "Failed to save skill. Please try again."; }
  finally  { hideLoading(btn); }
}

function escHtml(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
