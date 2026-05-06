// ============================================================
// dashboard.js — Dashboard statistics and widgets
// ============================================================

document.addEventListener("DOMContentLoaded", function() {
  initMobileToggleVisibility();
  initSidebarToggle();
  setActiveNav();

  // Set today's date
  var dateEl = document.getElementById("today-date");
  if (dateEl) {
    var now = new Date();
    dateEl.textContent = now.toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  }

  // Logout button
  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);

  // Auth check + load data
  onAuthStateReady(async function(user) {
    if (!user) return;

    var profile = await getUserProfile();
    populateUserUI(user, profile);

    var name = (profile && profile.name) || user.displayName || "there";
    var nameEl = document.getElementById("welcome-name");
    if (nameEl) nameEl.textContent = name;

    loadDashboardStats();
    loadTodaysFocus();
    loadUpcomingAssignments();
    loadRecentNotes();
    loadApplicationSnapshot();
    loadRoadmapCount();
    loadPerformanceInsights();
  });
});

// ── Stats ───────────────────────────────────────────────────
async function loadDashboardStats() {
  try {
    var results = await Promise.all([
      getUserCollectionOnce("studyTasks"),
      getUserCollectionOnce("skills"),
      getUserCollectionOnce("applications"),
      getUserCollectionOnce("assignments"),
      getUserCollectionOnce("notes"),
      getUserCollectionOnce("roadmaps"),
    ]);
    var tasks = results[0], skills = results[1], apps = results[2];
    var assigns = results[3], notes = results[4], roadmaps = results[5];

    // Tasks
    var completedTasks = tasks.filter(function(t) { return t.completed; }).length;
    var pct = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
    setText("stat-tasks", tasks.length);
    setText("stat-tasks-sub", completedTasks + " completed (" + pct + "%)");

    // Skills
    var avgSkill = skills.length
      ? Math.round(skills.reduce(function(s, k) { return s + (k.progress || 0); }, 0) / skills.length)
      : 0;
    setText("stat-skills", skills.length);
    setText("stat-skills-sub", "Avg. progress: " + avgSkill + "%");

    // Applications
    var selectedApps = apps.filter(function(a) { return a.status === "Selected"; }).length;
    setText("stat-apps", apps.length);
    setText("stat-apps-sub", selectedApps + " selected");

    // Assignments
    var pendingAssign = assigns.filter(function(a) { return a.status === "Pending"; }).length;
    setText("stat-assign", assigns.length);
    setText("stat-assign-sub", pendingAssign + " pending");

    // Notes & Roadmaps
    setText("stat-notes", notes.length);
    setText("stat-roadmaps", roadmaps.length);
  } catch (err) {
    console.error("loadDashboardStats error:", err);
  }
}

// ── Today's Focus ───────────────────────────────────────────
async function loadTodaysFocus() {
  var container = document.getElementById("todays-focus-list");
  if (!container) return;

  try {
    var tasks = await getUserCollectionOnce("studyTasks");
    var highPriority = tasks.filter(function(t) { return !t.completed && t.priority === "High"; }).slice(0, 5);

    if (!highPriority.length) {
      var allPending = tasks.filter(function(t) { return !t.completed; }).slice(0, 4);
      if (!allPending.length) {
        renderEmptyState(container, "No study tasks yet", "Add Task", function() {
          window.location.href = "study-planner.html";
        });
        return;
      }
      renderTaskList(container, allPending);
      return;
    }
    renderTaskList(container, highPriority);
  } catch (err) {
    container.innerHTML = '<p style="font-size:.82rem;color:var(--text-muted);padding:.5rem;">Failed to load tasks.</p>';
  }
}

function renderTaskList(container, tasks) {
  var html = '<div class="recent-items">';
  tasks.forEach(function(t) {
    var dotColor = t.priority === "High" ? "var(--danger)" : t.priority === "Medium" ? "var(--warning)" : "var(--success)";
    html +=
      '<div class="recent-item">' +
        '<div style="display:flex;align-items:center;gap:.6rem;min-width:0;">' +
          '<div style="width:8px;height:8px;border-radius:50%;background:' + dotColor + ';flex-shrink:0;"></div>' +
          '<span style="font-size:.83rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escHtml(t.title) + '</span>' +
        '</div>' +
        '<span class="badge badge-muted fs-xs">' + escHtml(t.subject || t.type || "") + '</span>' +
      '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

// ── Upcoming Assignments ────────────────────────────────────
async function loadUpcomingAssignments() {
  var container = document.getElementById("upcoming-assignments-list");
  if (!container) return;

  try {
    var assigns = await getUserCollectionOnce("assignments");
    var pending = assigns
      .filter(function(a) { return a.status === "Pending"; })
      .sort(function(a, b) { return new Date(a.deadline || "9999") - new Date(b.deadline || "9999"); })
      .slice(0, 5);

    if (!pending.length) {
      renderEmptyState(container, "No pending assignments", "Add Assignment", function() {
        window.location.href = "assignments.html";
      });
      return;
    }

    var html = '<div class="recent-items">';
    pending.forEach(function(a) {
      var ds = getDeadlineStatus(a.deadline, a.status);
      html +=
        '<div class="recent-item">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:.83rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escHtml(a.title) + '</div>' +
            '<div style="font-size:.72rem;color:var(--text-muted);">' + escHtml(a.subject || "") + '</div>' +
          '</div>' +
          '<span class="badge ' + ds.cls + '">' + ds.label + '</span>' +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p style="font-size:.82rem;color:var(--text-muted);padding:.5rem;">Failed to load assignments.</p>';
  }
}

// ── Recent Notes ────────────────────────────────────────────
async function loadRecentNotes() {
  var container = document.getElementById("recent-notes-list");
  if (!container) return;

  try {
    var notes = await getUserCollectionOnce("notes", { orderBy: "createdAt", orderDir: "desc", limit: 5 });

    if (!notes.length) {
      renderEmptyState(container, "No notes yet", "Add Note", function() {
        window.location.href = "notes.html";
      });
      return;
    }

    var html = '<div class="recent-items">';
    notes.forEach(function(n) {
      var preview = (n.content || "").slice(0, 60) + ((n.content || "").length > 60 ? "…" : "");
      html +=
        '<div class="recent-item">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:.83rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escHtml(n.title) + '</div>' +
            '<div style="font-size:.72rem;color:var(--text-muted);">' + escHtml(preview) + '</div>' +
          '</div>' +
          '<span class="badge badge-muted fs-xs">' + escHtml(n.category || "") + '</span>' +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p style="font-size:.82rem;color:var(--text-muted);padding:.5rem;">Failed to load notes.</p>';
  }
}

// ── Application Snapshot ────────────────────────────────────
async function loadApplicationSnapshot() {
  var container = document.getElementById("app-snapshot");
  if (!container) return;

  try {
    var apps = await getUserCollectionOnce("applications");
    var statuses = ["Applied", "In Progress", "Interview", "Selected", "Rejected"];
    var colors   = ["var(--primary)", "var(--warning)", "var(--secondary)", "var(--success)", "var(--danger)"];

    var html = "";
    statuses.forEach(function(s, i) {
      var count = apps.filter(function(a) { return a.status === s; }).length;
      html +=
        '<div class="snap-card">' +
          '<div class="snap-val" style="color:' + colors[i] + ';">' + count + '</div>' +
          '<div class="snap-lbl">' + s + '</div>' +
        '</div>';
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = "";
  }
}

// ── Roadmap Count ───────────────────────────────────────────
async function loadRoadmapCount() {
  try {
    var roadmaps = await getUserCollectionOnce("roadmaps");
    var el = document.getElementById("roadmap-count-text");
    if (el) {
      el.textContent = roadmaps.length
        ? "You have " + roadmaps.length + " saved roadmap" + (roadmaps.length > 1 ? "s" : "") + "."
        : "You haven't generated one yet.";
    }
  } catch (err) { /* silent */ }
}

// ── Helpers ─────────────────────────────────────────────────
function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = String(val);
}

function escHtml(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── Performance Insights ─────────────────────────────────────
async function loadPerformanceInsights() {
  try {
    var results = await getUserCollectionOnce("performanceResults");
    renderWeakestTopics(results);
    renderRecommendedFocus(results);
    renderAutoGeneratedTasksPreview();
    renderCriticalAlerts(results);
  } catch (err) {
    console.error("loadPerformanceInsights error:", err);
  }
}

function weaknessLevelBadgeCls(lvl) {
  if (lvl === "Critical")  return "badge-danger";
  if (lvl === "Weak")      return "badge-warning";
  if (lvl === "Improving") return "badge-primary";
  if (lvl === "Strong")    return "badge-success";
  return "badge-muted";
}

function renderWeakestTopics(results) {
  var grid = document.getElementById("weakest-topics-grid");
  if (!grid) return;

  if (!results || !results.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:1.5rem;font-size:.85rem;color:var(--text-muted);">No weak topics found yet. <a href="performance.html" style="color:var(--primary);">Add a result →</a></div>';
    return;
  }

  var sorted  = results.slice().sort(function(a, b) { return (a.percentage || 0) - (b.percentage || 0); });
  var bottom3 = sorted.slice(0, 3);

  grid.innerHTML = bottom3.map(function(r) {
    var pct = r.percentage || 0;
    var lvl = r.weaknessLevel || "";
    var barColor = pct < 50 ? "linear-gradient(90deg,#ef4444,#f59e0b)"
                 : pct < 70 ? "linear-gradient(90deg,#f59e0b,#38bdf8)"
                 : "linear-gradient(90deg,#38bdf8,#8b5cf6)";
    return '<div class="stat-card" style="display:block;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.5rem;">' +
        '<div style="font-size:.85rem;font-weight:700;">' + escHtml(r.topic || "") + '</div>' +
        '<span class="badge ' + weaknessLevelBadgeCls(lvl) + '" style="font-size:.65rem;">' + escHtml(lvl) + '</span>' +
      '</div>' +
      '<div style="font-size:.72rem;color:var(--text-muted);margin-bottom:.5rem;">' + escHtml(r.subject || "") + '</div>' +
      '<div class="progress-wrap" style="height:5px;">' +
        '<div class="progress-bar" style="width:' + pct + '%;background:' + barColor + ';"></div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;margin-top:.35rem;font-size:.7rem;">' +
        '<span style="color:var(--text-muted);">' + escHtml(r.recommendedWeeklyTime || "") + '</span>' +
        '<span style="font-weight:700;">' + pct + '%</span>' +
      '</div>' +
    '</div>';
  }).join("");
}

function renderRecommendedFocus(results) {
  var el = document.getElementById("perf-focus-text");
  if (!el) return;

  if (!results || !results.length) {
    el.textContent = "Add your first performance result to get smart focus recommendations.";
    return;
  }

  var sorted  = results.slice().sort(function(a, b) { return (a.percentage || 0) - (b.percentage || 0); });
  var weakest = sorted.slice(0, 3);
  var names   = weakest.map(function(r) { return r.topic || r.subject || "—"; });

  if (names.length === 1) {
    el.textContent = "Spend more time on " + names[0] + " this week.";
  } else if (names.length === 2) {
    el.textContent = "Spend more time on " + names[0] + " and " + names[1] + " this week.";
  } else {
    el.textContent = "Spend more time on " + names.slice(0, -1).join(", ") + ", and " + names[names.length - 1] + " this week.";
  }
}

async function renderAutoGeneratedTasksPreview() {
  var wrap    = document.getElementById("perf-tasks-preview-wrap");
  var preview = document.getElementById("perf-tasks-preview");
  if (!wrap || !preview) return;

  try {
    var tasks     = await getUserCollectionOnce("studyTasks");
    var autoTasks = tasks.filter(function(t) { return t.source === "performance-auto" && !t.completed; });
    autoTasks.sort(function(a, b) {
      var ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
      var tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
      return tb - ta;
    });
    var top3 = autoTasks.slice(0, 3);

    if (!top3.length) { wrap.style.display = "none"; return; }

    wrap.style.display = "block";
    preview.innerHTML  = top3.map(function(t) {
      return '<div class="recent-item">' +
        '<div style="display:flex;align-items:center;gap:.6rem;min-width:0;">' +
          '<div style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex-shrink:0;"></div>' +
          '<span style="font-size:.83rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escHtml(t.title) + '</span>' +
        '</div>' +
        '<span class="badge badge-primary" style="font-size:.65rem;white-space:nowrap;">Auto-generated</span>' +
      '</div>';
    }).join("");
  } catch (err) {
    console.error("renderAutoGeneratedTasksPreview error:", err);
  }
}

function renderCriticalAlerts(results) {
  var alertEl = document.getElementById("perf-critical-alert");
  var textEl  = document.getElementById("perf-critical-text");
  if (!alertEl) return;

  var criticals = (results || []).filter(function(r) { return r.weaknessLevel === "Critical"; });
  if (!criticals.length) { alertEl.style.display = "none"; return; }

  alertEl.style.display = "block";
  var topics = criticals.slice(0, 3).map(function(r) { return r.topic || r.subject || ""; }).filter(Boolean);
  if (textEl && topics.length) {
    textEl.textContent = "Critical weak areas: " + topics.join(", ") + ". Immediate focused study recommended.";
  }
}
