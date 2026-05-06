// ============================================================
// guard.js — Route protection for StudyPath AI Pro
// ============================================================

(function () {
  var page = window.location.pathname.split("/").pop() || "index.html";

  var protectedPages = [
    "dashboard.html",
    "roadmap.html",
    "study-planner.html",
    "skills.html",
    "notes.html",
    "applications.html",
    "assignments.html",
    "resources.html",
    "performance.html",
  ];

  var isProtected = protectedPages.indexOf(page) !== -1;

  // Only protect private pages.
  // Do not redirect from login/signup because Google popup flow
  // needs auth.js to finish profile creation first.
  if (!isProtected) return;

  document.documentElement.style.visibility = "hidden";

  var authCheckDone = false;

  function revealPage() {
    if (!authCheckDone) {
      authCheckDone = true;
      document.documentElement.style.visibility = "visible";
    }
  }

  var safetyTimer = setTimeout(revealPage, 3000);

  function waitForAuth(retries) {
    retries = retries || 0;

    if (typeof auth !== "undefined" && auth !== null) {
      auth.onAuthStateChanged(function (user) {
        clearTimeout(safetyTimer);
        revealPage();

        if (!user) {
          window.location.replace("login.html");
        }
      });
    } else if (retries < 30) {
      setTimeout(function () {
        waitForAuth(retries + 1);
      }, 100);
    } else {
      clearTimeout(safetyTimer);
      revealPage();
      console.warn("guard.js: Auth not available. Route protection disabled.");
    }
  }

  waitForAuth(0);
})();