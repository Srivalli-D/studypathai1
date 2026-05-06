// ============================================================
// resources.js — Static Resource Library
// ============================================================

const RESOURCES = [
  // DSA
  { title:"LeetCode", category:"DSA", difficulty:"Intermediate", description:"Practice coding problems to ace technical interviews. Thousands of problems with community solutions.", link:"https://leetcode.com" },
  { title:"GeeksforGeeks – DSA", category:"DSA", difficulty:"Beginner", description:"Comprehensive DSA tutorials covering arrays, linked lists, trees, graphs, sorting, and more.", link:"https://www.geeksforgeeks.org/data-structures/" },
  { title:"NeetCode 150", category:"DSA", difficulty:"Intermediate", description:"Curated list of 150 LeetCode problems essential for software engineering interviews, with video solutions.", link:"https://neetcode.io/practice" },
  { title:"Codeforces", category:"DSA", difficulty:"Advanced", description:"Competitive programming platform with regular contests to sharpen your algorithmic thinking.", link:"https://codeforces.com" },

  // Web Development
  { title:"MDN Web Docs", category:"Web Development", difficulty:"Beginner", description:"The definitive reference for HTML, CSS, and JavaScript — written by Mozilla, trusted by developers worldwide.", link:"https://developer.mozilla.org" },
  { title:"JavaScript.info", category:"Web Development", difficulty:"Beginner", description:"The Modern JavaScript Tutorial — from the basics to advanced topics, with clear explanations and exercises.", link:"https://javascript.info" },
  { title:"freeCodeCamp", category:"Web Development", difficulty:"Beginner", description:"Free, structured curriculum to learn web development from scratch with hands-on projects and certifications.", link:"https://www.freecodecamp.org" },
  { title:"W3Schools", category:"Web Development", difficulty:"Beginner", description:"Easy-to-follow web development references and tutorials for beginners covering HTML, CSS, JS, and more.", link:"https://www.w3schools.com" },
  { title:"roadmap.sh – Frontend", category:"Web Development", difficulty:"Intermediate", description:"Community-driven, visual roadmaps for frontend, backend, and full-stack developers with curated resources.", link:"https://roadmap.sh/frontend" },
  { title:"CSS-Tricks", category:"Web Development", difficulty:"Intermediate", description:"A website devoted to making CSS accessible — guides, snippets, almanac, and community forums.", link:"https://css-tricks.com" },

  // AI/ML
  { title:"Kaggle Learn", category:"AI/ML", difficulty:"Beginner", description:"Free micro-courses on Python, ML, deep learning, data visualization — taught by Kaggle experts.", link:"https://www.kaggle.com/learn" },
  { title:"fast.ai", category:"AI/ML", difficulty:"Intermediate", description:"Practical Deep Learning for Coders — top-down, project-based approach to learning AI and deep learning.", link:"https://www.fast.ai" },
  { title:"Hugging Face", category:"AI/ML", difficulty:"Intermediate", description:"The hub for machine learning models, datasets, and spaces. Learn transformers and NLP hands-on.", link:"https://huggingface.co" },
  { title:"Google ML Crash Course", category:"AI/ML", difficulty:"Beginner", description:"Google's fast-paced introduction to machine learning using TensorFlow APIs — free and interactive.", link:"https://developers.google.com/machine-learning/crash-course" },

  // Interview Prep
  { title:"Google Interview Warmup", category:"Interview Prep", difficulty:"Beginner", description:"Practise answering interview questions using Google's AI-powered interview warmup tool — completely free.", link:"https://grow.google/certificates/interview-warmup/" },
  { title:"Glassdoor Interview Questions", category:"Interview Prep", difficulty:"Beginner", description:"Real interview questions reported by candidates for thousands of companies across all roles.", link:"https://www.glassdoor.com/Interview/index.htm" },
  { title:"System Design Primer (GitHub)", category:"Interview Prep", difficulty:"Advanced", description:"Learn how to design large-scale systems. Prep for the system design interview with this comprehensive guide.", link:"https://github.com/donnemartin/system-design-primer" },
  { title:"Pramp", category:"Interview Prep", difficulty:"Intermediate", description:"Free peer-to-peer mock technical and behavioural interviews. Practice with real people in real time.", link:"https://www.pramp.com" },

  // Resume
  { title:"Overleaf Resume Templates", category:"Resume", difficulty:"Beginner", description:"Professional LaTeX resume templates for students and developers — edit online and download as PDF.", link:"https://www.overleaf.com/gallery/tagged/cv" },
  { title:"Resume.io", category:"Resume", difficulty:"Beginner", description:"Easy-to-use resume builder with industry-specific templates and guided tips to create a standout resume.", link:"https://resume.io" },
  { title:"GitHub Docs – GitHub Profile", category:"Resume", difficulty:"Beginner", description:"Learn to set up and optimise your GitHub profile — a live portfolio that impresses recruiters.", link:"https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile" },

  // Internships
  { title:"LinkedIn Jobs", category:"Internships", difficulty:"Beginner", description:"The world's largest professional network. Search internships, apply directly, and connect with recruiters.", link:"https://www.linkedin.com/jobs/" },
  { title:"Internshala", category:"Internships", difficulty:"Beginner", description:"India's leading internship and training platform. Find paid internships across engineering, tech, marketing and more.", link:"https://internshala.com" },
  { title:"AngelList (Wellfound)", category:"Internships", difficulty:"Intermediate", description:"Find startup internships and jobs. Apply anonymously, see salary and equity upfront.", link:"https://wellfound.com" },

  // Aptitude
  { title:"IndiaBix", category:"Aptitude", difficulty:"Beginner", description:"Free quantitative aptitude, logical reasoning, and verbal ability questions for placement preparation.", link:"https://www.indiabix.com" },
  { title:"PrepInsta", category:"Aptitude", difficulty:"Beginner", description:"Company-specific aptitude and coding round preparation — Infosys, TCS, Wipro, Cognizant and more.", link:"https://prepinsta.com" },
];

let activeCat  = "all";
let activeDiff = "all";
let searchQ    = "";

document.addEventListener("DOMContentLoaded", function() {
  initMobileToggleVisibility();
  initSidebarToggle();
  setActiveNav();

  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);

  // Search
  var searchEl = document.getElementById("resource-search");
  if (searchEl) searchEl.addEventListener("input", function(e) { searchQ = e.target.value.toLowerCase(); renderResources(); });

  // Category filters
  document.querySelectorAll(".filter-btn[data-cat]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".filter-btn[data-cat]").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active"); activeCat = btn.dataset.cat; renderResources();
    });
  });

  // Difficulty filters
  document.querySelectorAll(".filter-btn[data-diff]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".filter-btn[data-diff]").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active"); activeDiff = btn.dataset.diff; renderResources();
    });
  });

  onAuthStateReady(async function(user) {
    if (!user) return;
    var profile = await getUserProfile();
    populateUserUI(user, profile);
    renderResources();
  });
});

function renderResources() {
  const grid    = document.getElementById("resources-grid");
  const countEl = document.getElementById("resource-count");
  if (!grid) return;

  let filtered = [...RESOURCES];
  if (activeCat  !== "all") filtered = filtered.filter(r => r.category === activeCat);
  if (activeDiff !== "all") filtered = filtered.filter(r => r.difficulty === activeDiff);
  if (searchQ) filtered = filtered.filter(r =>
    r.title.toLowerCase().includes(searchQ) ||
    r.description.toLowerCase().includes(searchQ) ||
    r.category.toLowerCase().includes(searchQ)
  );

  if (countEl) countEl.textContent = `${filtered.length} resource${filtered.length !== 1 ? "s" : ""}`;

  if (!filtered.length) {
    renderEmptyState(grid, "No resources found. Try another search or category.");
    return;
  }

  grid.innerHTML = filtered.map(r => {
    const diffCls = { Beginner:"diff-beginner", Intermediate:"diff-intermediate", Advanced:"diff-advanced" }[r.difficulty] || "";
    const catColors = {
      DSA:"rgba(56,189,248,.15)", "Web Development":"rgba(139,92,246,.15)", "AI/ML":"rgba(34,211,238,.15)",
      "Interview Prep":"rgba(34,197,94,.15)", Resume:"rgba(245,158,11,.15)",
      Internships:"rgba(239,68,68,.15)", Aptitude:"rgba(99,102,241,.15)"
    };
    const bgColor = catColors[r.category] || "rgba(255,255,255,.07)";

    return `
    <div class="resource-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem;">
        <div>
          <div class="resource-title">${escHtml(r.title)}</div>
        </div>
        <div style="width:38px;height:38px;border-radius:10px;background:${bgColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.1rem;">
          ${{DSA:"⚡","Web Development":"🌐","AI/ML":"🤖","Interview Prep":"🎯",Resume:"📄",Internships:"💼",Aptitude:"🧠"}[r.category] || "🔗"}
        </div>
      </div>
      <div class="resource-desc">${escHtml(r.description)}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;">
        <div style="display:flex;gap:.4rem;flex-wrap:wrap;">
          <span class="badge badge-primary">${escHtml(r.category)}</span>
          <span class="diff-badge ${diffCls}">${escHtml(r.difficulty)}</span>
        </div>
        <a href="${escHtml(r.link)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Open →</a>
      </div>
    </div>`;
  }).join("");
}

function escHtml(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
