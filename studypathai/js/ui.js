// ============================================================
// ui.js — Shared UI helpers for StudyPath AI Pro
// ============================================================

// ── Toast Notifications ─────────────────────────────────────
function showToast(message, type) {
  type = type || "info";
  var container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  var icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  var toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.innerHTML = "<span>" + (icons[type] || "ℹ️") + "</span><span>" + escHtmlSafe(message) + "</span>";
  container.appendChild(toast);

  setTimeout(function() {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 320);
  }, 3500);
}

function showError(message)   { showToast(message, "error");   }
function showSuccess(message) { showToast(message, "success"); }
function showWarning(message) { showToast(message, "warning"); }

function escHtmlSafe(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── Button Loading States ───────────────────────────────────
function showLoading(btn, text) {
  text = text || "Loading…";
  if (!btn) return;
  btn.disabled = true;
  // Store original HTML (preserves SVG icons in Google button)
  btn.dataset.origHtml = btn.innerHTML;
  btn.innerHTML = escHtmlSafe(text);
  btn.classList.add("btn-loading");
}

function hideLoading(btn) {
  if (!btn) return;
  btn.disabled = false;
  if (btn.dataset.origHtml) {
    btn.innerHTML = btn.dataset.origHtml;
    delete btn.dataset.origHtml;
  }
  btn.classList.remove("btn-loading");
}

// ── Modals ──────────────────────────────────────────────────
function openModal(id) {
  var overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(id) {
  var overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Close modal on overlay backdrop click
document.addEventListener("click", function(e) {
  if (e.target && e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
    document.body.style.overflow = "";
  }
});

// Escape key closes modals
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    var modals = document.querySelectorAll(".modal-overlay.active");
    modals.forEach(function(m) { m.classList.remove("active"); });
    document.body.style.overflow = "";
  }
});

// ── Confirm Delete ──────────────────────────────────────────
function confirmDelete(message) {
  message = message || "Are you sure you want to delete this?";
  return window.confirm(message);
}

// ── Date Formatting ─────────────────────────────────────────
function formatDate(dateInput) {
  if (!dateInput) return "—";
  var d;
  try {
    if (dateInput && typeof dateInput.toDate === "function") {
      d = dateInput.toDate();
    } else if (dateInput instanceof Date) {
      d = dateInput;
    } else {
      d = new Date(dateInput);
    }
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch (e) {
    return "—";
  }
}

function formatDateTime(dateInput) {
  if (!dateInput) return "—";
  var d;
  try {
    if (dateInput && typeof dateInput.toDate === "function") {
      d = dateInput.toDate();
    } else {
      d = new Date(dateInput);
    }
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "—";
  }
}

// ── Deadline Status ─────────────────────────────────────────
function getDeadlineStatus(deadline, status) {
  if (!deadline) return { label: "No Deadline", cls: "badge-muted" };
  if (status === "Submitted" || status === "Selected") {
    return { label: status, cls: "badge-success" };
  }
  try {
    var now  = new Date();
    var due  = new Date(deadline);
    if (isNaN(due.getTime())) return { label: "Invalid Date", cls: "badge-muted" };
    var diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0)   return { label: "Overdue",  cls: "badge-danger" };
    if (diff <= 2)  return { label: "Due Soon", cls: "badge-warning" };
    return { label: "Upcoming", cls: "badge-primary" };
  } catch (e) {
    return { label: "—", cls: "badge-muted" };
  }
}

// ── Active Nav Highlight ────────────────────────────────────
function setActiveNav() {
  var page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-item, .mobile-nav-item").forEach(function(link) {
    var href = link.getAttribute("href");
    if (href && href !== "#" && href === page) {
      link.classList.add("active");
    }
  });
}

// ── Empty State Renderer ────────────────────────────────────
function renderEmptyState(container, message, actionText, actionFn) {
  if (!container) return;
  actionText = actionText || "";
  actionFn   = actionFn   || null;

  var iconMap = {
    "study tasks": "📚",
    "skills":      "🚀",
    "notes":       "📝",
    "applications":"💼",
    "assignments": "📋",
    "roadmap":     "🗺️",
    "resources":   "🔗",
  };
  var emoji = "📭";
  var lowerMsg = (message || "").toLowerCase();
  Object.keys(iconMap).forEach(function(k) {
    if (lowerMsg.indexOf(k) !== -1) emoji = iconMap[k];
  });

  container.innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-state-icon">' + emoji + '</div>' +
      '<h3>' + escHtmlSafe(message) + '</h3>' +
      (actionText ? '<button class="btn btn-primary btn-sm" id="empty-action-btn">' + escHtmlSafe(actionText) + '</button>' : '') +
    '</div>';

  if (actionText && actionFn) {
    var btn = container.querySelector("#empty-action-btn");
    if (btn) btn.addEventListener("click", actionFn);
  }
}

// ── Skeleton Cards ──────────────────────────────────────────
function renderSkeletonCards(container, count) {
  count = count || 3;
  if (!container) return;
  var html = "";
  for (var i = 0; i < count; i++) {
    html += '<div class="item-card">' +
      '<div class="skeleton" style="height:1rem;width:60%;margin-bottom:.75rem;"></div>' +
      '<div class="skeleton" style="height:.7rem;width:40%;margin-bottom:.5rem;"></div>' +
      '<div class="skeleton" style="height:.7rem;width:80%;"></div>' +
    '</div>';
  }
  container.innerHTML = html;
}

// ── Priority Badge ──────────────────────────────────────────
function priorityBadge(priority) {
  var map = { High: "badge-danger", Medium: "badge-warning", Low: "badge-success" };
  var cls = map[priority] || "badge-muted";
  return '<span class="badge ' + cls + '">' + escHtmlSafe(priority || "—") + '</span>';
}

// ── Status Badge ────────────────────────────────────────────
function statusBadge(status) {
  var map = {
    "Applied":     "badge-primary",
    "In Progress": "badge-warning",
    "Interview":   "badge-secondary",
    "Selected":    "badge-success",
    "Rejected":    "badge-danger",
    "Pending":     "badge-warning",
    "Submitted":   "badge-success",
    "Completed":   "badge-success",
  };
  var cls = map[status] || "badge-muted";
  return '<span class="badge ' + cls + '">' + escHtmlSafe(status || "—") + '</span>';
}

// ── User Initials ───────────────────────────────────────────
function getInitials(name) {
  name = name || "";
  var parts = name.trim().split(" ");
  var initials = parts.map(function(w) { return w[0] || ""; }).join("").toUpperCase();
  return initials.slice(0, 2) || "U";
}

// ── Populate User Info ──────────────────────────────────────
function populateUserUI(user, profile) {
  var name  = (profile && profile.name)  || (user && user.displayName) || "User";
  var email = (user && user.email) || "";
  var init  = getInitials(name);

  document.querySelectorAll(".user-name").forEach(function(el)        { el.textContent = name;  });
  document.querySelectorAll(".user-email").forEach(function(el)       { el.textContent = email; });
  document.querySelectorAll(".user-avatar").forEach(function(el)      { el.textContent = init;  });
  document.querySelectorAll(".topbar-user-name").forEach(function(el) { el.textContent = name;  });
}

// ── Sidebar Toggle (mobile) ─────────────────────────────────
function initSidebarToggle() {
  var toggleBtn = document.getElementById("sidebar-toggle");
  var sidebar   = document.getElementById("sidebar");
  var overlay   = document.getElementById("sidebar-overlay");

  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener("click", function() {
    sidebar.classList.toggle("open");
    if (overlay) overlay.classList.toggle("active");
  });

  if (overlay) {
    overlay.addEventListener("click", function() {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
    });
  }

  // Close sidebar when a nav link is clicked on mobile
  sidebar.querySelectorAll(".nav-item").forEach(function(link) {
    link.addEventListener("click", function() {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("active");
      }
    });
  });
}

// ── Init Sidebar Toggle Visibility ─────────────────────────
function initMobileToggleVisibility() {
  var toggleBtn = document.getElementById("sidebar-toggle");
  if (!toggleBtn) return;
  function update() {
    toggleBtn.style.display = window.innerWidth <= 768 ? "flex" : "none";
  }
  update();
  window.addEventListener("resize", update);
}
