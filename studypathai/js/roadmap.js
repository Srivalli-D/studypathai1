// ============================================================
// roadmap.js — AI Roadmap Generator (Template-based)
//
// IMPORTANT: Gemini API should be connected later through a
// secure backend, Firebase Cloud Function, or server proxy.
// Never expose Gemini API keys in frontend JavaScript.
// ============================================================

let currentRoadmap = null;
let savedRoadmaps  = [];
let unsubscribe    = null;

// ── Roadmap Templates ────────────────────────────────────────
const ROADMAP_TEMPLATES = {
  frontend: {
    title: "Frontend Development Roadmap",
    summary: "A structured path to becoming a proficient frontend developer. You will master HTML, CSS, JavaScript, and a modern framework, building real projects along the way.",
    steps: [
      { title:"HTML & CSS Fundamentals", description:"Learn semantic HTML5 and modern CSS including Flexbox, Grid, and responsive design principles. Build static web pages.", duration:"2–3 weeks", resources:["MDN Web Docs","freeCodeCamp","W3Schools"], milestone:"Build a responsive personal portfolio page.", difficulty:"Beginner" },
      { title:"JavaScript Core Concepts", description:"Master JavaScript fundamentals: variables, functions, DOM manipulation, events, fetch API, and ES6+ syntax.", duration:"4–6 weeks", resources:["JavaScript.info","freeCodeCamp JS Course","Eloquent JavaScript"], milestone:"Build an interactive to-do list or weather app using a public API.", difficulty:"Beginner" },
      { title:"Version Control with Git & GitHub", description:"Learn Git commands, branching, merging, pull requests, and GitHub workflow for collaborative development.", duration:"1 week", resources:["GitHub Docs","Learn Git Branching (interactive)"], milestone:"Push your projects to GitHub with proper commits and README files.", difficulty:"Beginner" },
      { title:"React.js Framework", description:"Learn component-based architecture, hooks (useState, useEffect), props, state management, and React Router.", duration:"5–7 weeks", resources:["React Official Docs","Scrimba React Course","Traversy Media React"], milestone:"Build a multi-page React application with API integration.", difficulty:"Intermediate" },
      { title:"CSS Frameworks & Tooling", description:"Learn a CSS framework, build tools (Vite/Webpack basics), and improve your development workflow.", duration:"2 weeks", resources:["Tailwind CSS Docs","Vite Docs"], milestone:"Rebuild a previous project using modern tooling.", difficulty:"Intermediate" },
      { title:"Advanced JavaScript & Performance", description:"Deep-dive into async/await, Promises, closures, event loop, and web performance optimisation techniques.", duration:"3 weeks", resources:["JavaScript.info Advanced","web.dev Performance"], milestone:"Audit and optimise an existing project's performance metrics.", difficulty:"Advanced" },
      { title:"Build & Deploy Projects", description:"Create 2–3 production-ready portfolio projects, deploy them, and write case studies for each.", duration:"4 weeks", resources:["Vercel","Netlify","Firebase Hosting"], milestone:"Launch 3 live projects with clean GitHub repositories.", difficulty:"Intermediate" },
    ]
  },
  backend: {
    title: "Backend Development Roadmap",
    summary: "A structured path to becoming a backend developer. You will learn server-side programming, databases, REST APIs, authentication, and deployment.",
    steps: [
      { title:"Programming Language Foundation", description:"Master Python or Node.js as your backend language, covering syntax, data structures, OOP, and standard library.", duration:"4–5 weeks", resources:["Python Docs","Node.js Docs","freeCodeCamp Python"], milestone:"Build 5 scripting projects demonstrating core language skills.", difficulty:"Beginner" },
      { title:"Databases: SQL & NoSQL", description:"Learn relational databases (PostgreSQL/MySQL) and NoSQL (MongoDB/Firestore). Understand CRUD, joins, indexing, and schema design.", duration:"3–4 weeks", resources:["PostgreSQL Docs","MongoDB University","SQLZoo"], milestone:"Design and query a database for a student management system.", difficulty:"Intermediate" },
      { title:"REST API Development", description:"Build RESTful APIs with proper HTTP methods, status codes, authentication, validation, and error handling.", duration:"4 weeks", resources:["Express.js Docs","FastAPI Docs","Postman Learning Center"], milestone:"Build a full REST API with CRUD operations and JWT authentication.", difficulty:"Intermediate" },
      { title:"Authentication & Security", description:"Implement user auth with sessions, JWT, OAuth, and understand security best practices like input sanitisation and rate limiting.", duration:"2–3 weeks", resources:["OWASP Security Guide","JWT.io","Passport.js Docs"], milestone:"Add complete auth to your REST API project.", difficulty:"Intermediate" },
      { title:"Cloud & Deployment", description:"Deploy applications to cloud platforms, understand environment variables, CI/CD pipelines, and containerisation basics.", duration:"3 weeks", resources:["Heroku Docs","Railway.app","Docker Getting Started"], milestone:"Deploy a production-ready API with environment configuration.", difficulty:"Advanced" },
      { title:"System Design Basics", description:"Learn about caching, load balancing, message queues, microservices basics, and how to design scalable systems.", duration:"4 weeks", resources:["System Design Primer (GitHub)","ByteByteGo","Designing Data-Intensive Applications"], milestone:"Design and present the architecture of a real-world system.", difficulty:"Advanced" },
    ]
  },
  fullstack: {
    title: "Full Stack Development Roadmap",
    summary: "A comprehensive path to becoming a full stack developer. You will build complete web applications from frontend to backend to deployment.",
    steps: [
      { title:"Frontend Foundation (HTML/CSS/JS)", description:"Master HTML5, CSS3 with modern layout, and JavaScript fundamentals for building interactive user interfaces.", duration:"6 weeks", resources:["MDN Web Docs","JavaScript.info","freeCodeCamp"], milestone:"Build 3 responsive static projects and deploy them.", difficulty:"Beginner" },
      { title:"React.js Frontend Framework", description:"Learn React components, hooks, state management, routing, and API integration for building dynamic UIs.", duration:"5 weeks", resources:["React Docs","Scrimba React","Traversy Media"], milestone:"Build a React frontend that consumes a public REST API.", difficulty:"Intermediate" },
      { title:"Node.js & Express Backend", description:"Build server-side applications with Node.js, create REST APIs with Express, handle middleware and routing.", duration:"4 weeks", resources:["Node.js Docs","Express.js Docs","The Odin Project"], milestone:"Build a complete REST API for a blog or task manager.", difficulty:"Intermediate" },
      { title:"Database Integration", description:"Connect your backend to a PostgreSQL or MongoDB database. Implement full CRUD operations with your API.", duration:"3 weeks", resources:["MongoDB Docs","PostgreSQL Tutorial","Mongoose Docs"], milestone:"Full-stack app with persistent database — no hardcoded data.", difficulty:"Intermediate" },
      { title:"Authentication & Full Stack App", description:"Implement user auth, protect routes, and build a complete full stack project combining your frontend and backend.", duration:"4 weeks", resources:["JWT.io","Firebase Auth Docs","Auth0 Docs"], milestone:"Deploy a complete full stack application with user auth.", difficulty:"Advanced" },
      { title:"DevOps & Production Readiness", description:"Learn CI/CD, environment management, monitoring basics, and how to deploy and scale a full stack application.", duration:"3 weeks", resources:["Vercel Docs","Railway.app","GitHub Actions"], milestone:"Set up automated deployment pipeline for your project.", difficulty:"Advanced" },
    ]
  },
  dsa: {
    title: "DSA & Competitive Programming Roadmap",
    summary: "A rigorous path to mastering Data Structures and Algorithms for technical interviews and competitive programming.",
    steps: [
      { title:"Programming Fundamentals & Complexity", description:"Solidify your language basics and learn time/space complexity analysis, Big-O notation, and problem-solving mindset.", duration:"2 weeks", resources:["GeeksforGeeks","MIT OpenCourseWare 6.006"], milestone:"Solve 20 basic problems on LeetCode Easy — consistent daily practice.", difficulty:"Beginner" },
      { title:"Arrays, Strings, Hashing", description:"Master fundamental data structures: arrays, strings, hash maps, and two-pointer / sliding window techniques.", duration:"3 weeks", resources:["NeetCode 150","LeetCode Arrays","GeeksforGeeks"], milestone:"Solve all NeetCode array and string problems.", difficulty:"Beginner" },
      { title:"Linked Lists, Stacks & Queues", description:"Implement and use linked lists (singly, doubly, circular), stacks, queues, and monotonic stack patterns.", duration:"2 weeks", resources:["NeetCode","LeetCode Explore","GeeksforGeeks"], milestone:"Solve 30 medium problems on linked lists and stack/queue.", difficulty:"Intermediate" },
      { title:"Trees & Graphs", description:"Understand binary trees, BST, heaps, BFS, DFS, shortest path algorithms (Dijkstra, Bellman-Ford), and topological sort.", duration:"5 weeks", resources:["NeetCode Graphs","CP-Algorithms","CLRS Book"], milestone:"Solve 40 LeetCode problems on trees and graphs.", difficulty:"Intermediate" },
      { title:"Dynamic Programming", description:"Master DP patterns: 1D/2D DP, memoization, tabulation, knapsack, LCS, LIS, and interval DP.", duration:"5 weeks", resources:["NeetCode DP","Aditya Verma DP Series","LeetCode DP Study Plan"], milestone:"Solve 50 DP problems from easy to hard on LeetCode.", difficulty:"Advanced" },
      { title:"Competitive Programming Practice", description:"Participate in weekly Codeforces/AtCoder contests, solve company-specific problems, and simulate mock interviews.", duration:"Ongoing", resources:["Codeforces","AtCoder","LeetCode Contests","Pramp"], milestone:"Reach 1400+ rating on Codeforces or solve 200+ LeetCode problems.", difficulty:"Advanced" },
    ]
  },
  aiml: {
    title: "AI / Machine Learning Roadmap",
    summary: "A practical path to machine learning and AI, from mathematical foundations to building and deploying real ML models.",
    steps: [
      { title:"Python for Data Science", description:"Master Python for data science: NumPy, Pandas, Matplotlib, Seaborn. Learn data cleaning, exploration, and visualisation.", duration:"3 weeks", resources:["Kaggle Learn Python","freeCodeCamp Data Analysis","Corey Schafer Python"], milestone:"Complete an exploratory data analysis on a Kaggle dataset and publish a notebook.", difficulty:"Beginner" },
      { title:"Mathematics for ML", description:"Strengthen linear algebra, calculus, probability, and statistics — the foundations of every machine learning algorithm.", duration:"4 weeks", resources:["3Blue1Brown Linear Algebra","Khan Academy Statistics","Mathematics for ML Coursera"], milestone:"Pass practice quizzes on matrix operations, probability, and gradient descent.", difficulty:"Intermediate" },
      { title:"Classical Machine Learning", description:"Implement and use regression, classification, clustering, and ensemble methods with Scikit-learn. Learn model evaluation and tuning.", duration:"5 weeks", resources:["Kaggle Learn ML","Scikit-learn Docs","Hands-On ML Book (Aurélien Géron)"], milestone:"Build and submit a Kaggle competition entry achieving top 30% score.", difficulty:"Intermediate" },
      { title:"Deep Learning & Neural Networks", description:"Understand neural networks, backpropagation, CNNs, RNNs, and implement models using TensorFlow or PyTorch.", duration:"6 weeks", resources:["fast.ai Course","deeplearning.ai Specialisation","PyTorch Docs"], milestone:"Train a deep learning model that achieves meaningful accuracy on an image or text task.", difficulty:"Advanced" },
      { title:"NLP & Transformers", description:"Learn text processing, embeddings, attention mechanisms, and work with transformer models using Hugging Face.", duration:"4 weeks", resources:["Hugging Face Course","Stanford CS224N NLP","Jay Alammar Blog"], milestone:"Fine-tune a pre-trained transformer on a custom dataset and deploy the model.", difficulty:"Advanced" },
      { title:"MLOps & Deployment", description:"Learn how to deploy ML models as APIs, monitor model performance, and maintain models in production.", duration:"3 weeks", resources:["MLflow Docs","FastAPI for ML","Google Cloud AI Platform"], milestone:"Deploy a machine learning model as a live REST API endpoint.", difficulty:"Advanced" },
    ]
  },
  general: {
    title: "Tech Career Preparation Roadmap",
    summary: "A comprehensive path to prepare for a tech career — covering foundational skills, project building, interview preparation, and job searching.",
    steps: [
      { title:"Choose Your Core Stack & Learn the Basics", description:"Pick one programming language and domain (frontend, backend, mobile, data). Complete an online course or two to build your foundation.", duration:"4–6 weeks", resources:["freeCodeCamp","Kaggle Learn","The Odin Project","roadmap.sh"], milestone:"Complete a beginner course and build your first project from scratch.", difficulty:"Beginner" },
      { title:"Build 2–3 Solid Projects", description:"Create 2–3 projects that solve real problems. Focus on quality over quantity — clean code, good UI, clear README files.", duration:"6–8 weeks", resources:["GitHub","Vercel","Netlify"], milestone:"Publish 3 projects on GitHub with live demos and proper documentation.", difficulty:"Intermediate" },
      { title:"Data Structures & Algorithms Basics", description:"Learn the fundamentals of DSA needed for technical interviews — arrays, sorting, searching, linked lists, stacks, queues, trees.", duration:"4–6 weeks", resources:["NeetCode","GeeksforGeeks","LeetCode Easy problems"], milestone:"Solve 50 LeetCode Easy problems consistently.", difficulty:"Intermediate" },
      { title:"Resume, LinkedIn & Portfolio", description:"Create a professional resume, optimise your LinkedIn profile, and build a clean portfolio showcasing your best work.", duration:"2 weeks", resources:["Resume.io","LinkedIn","GitHub Pages"], milestone:"Complete resume, updated LinkedIn, and live portfolio website.", difficulty:"Beginner" },
      { title:"Internship & Job Applications", description:"Apply systematically to internships and entry-level roles. Track applications, follow up, and learn from each process.", duration:"Ongoing", resources:["LinkedIn Jobs","Internshala","AngelList (Wellfound)"], milestone:"Apply to 50 positions with personalised cover letters for top choices.", difficulty:"Intermediate" },
      { title:"Interview Preparation", description:"Practice technical and behavioural interviews. Do mock interviews, study common patterns, and prepare your story.", duration:"4 weeks", resources:["Pramp","Google Interview Warmup","System Design Primer"], milestone:"Complete 10 mock interviews (technical + behavioural) and refine your answers.", difficulty:"Advanced" },
    ]
  }
};

// ── Template Selection ───────────────────────────────────────
function selectTemplate(goal, skills, level, timeline, style) {
  const g = goal.toLowerCase();
  if (/full[\s-]?stack/.test(g))      return ROADMAP_TEMPLATES.fullstack;
  if (/frontend|front[\s-]?end|react|css|ui|ux/.test(g)) return ROADMAP_TEMPLATES.frontend;
  if (/backend|back[\s-]?end|node|api|server/.test(g))   return ROADMAP_TEMPLATES.backend;
  if (/dsa|data str|algorithm|competitive|leetcode/.test(g)) return ROADMAP_TEMPLATES.dsa;
  if (/machine learn|deep learn|ai|ml|data sci|nlp/.test(g)) return ROADMAP_TEMPLATES.aiml;
  return ROADMAP_TEMPLATES.general;
}

// ── DOM Ready ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function() {
  initMobileToggleVisibility();
  initSidebarToggle();
  setActiveNav();

  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
  var form = document.getElementById("roadmap-form");
  if (form) form.addEventListener("submit", handleGenerate);

  onAuthStateReady(async function(user) {
    if (!user) return;
    var profile = await getUserProfile();
    populateUserUI(user, profile);
    loadSavedRoadmaps();
  });
});

// ── Generate ─────────────────────────────────────────────────
async function handleGenerate(e) {
  e.preventDefault();
  const errEl = document.getElementById("rm-form-error");
  errEl.textContent = "";

  const goal     = document.getElementById("rm-goal").value.trim();
  const skills   = document.getElementById("rm-skills").value.trim();
  const level    = document.getElementById("rm-level").value;
  const timeline = document.getElementById("rm-timeline").value;
  const style    = document.getElementById("rm-style").value;
  const btn      = document.getElementById("generate-btn");

  if (!goal)     { errEl.textContent = "Please enter your goal."; return; }
  if (!level)    { errEl.textContent = "Please select your experience level."; return; }
  if (!timeline) { errEl.textContent = "Please select a timeline."; return; }

  showLoading(btn, "Generating…");

  // Simulate generation delay
  await new Promise(r => setTimeout(r, 1400));

  const template = selectTemplate(goal, skills, level, timeline, style);
  currentRoadmap = {
    title: template.title,
    goal, skills, experienceLevel: level, timeline, learningStyle: style,
    summary: template.summary,
    steps: template.steps,
  };

  hideLoading(btn);
  renderGeneratedRoadmap(currentRoadmap);
}

function renderGeneratedRoadmap(roadmap) {
  const output = document.getElementById("roadmap-output");
  if (!output) return;
  output.style.display = "block";

  output.innerHTML = `
  <div class="roadmap-generated-card">
    <div class="roadmap-generated-title">${escHtml(roadmap.title)}</div>
    <div class="roadmap-meta">
      <span class="badge badge-primary">🎯 ${escHtml(roadmap.goal)}</span>
      <span class="badge badge-secondary">📊 ${escHtml(roadmap.experienceLevel)}</span>
      <span class="badge badge-muted">⏱️ ${escHtml(roadmap.timeline)}</span>
      <span class="badge badge-muted">📖 ${escHtml(roadmap.learningStyle)}</span>
    </div>
    <div class="roadmap-summary">${escHtml(roadmap.summary)}</div>
    <div style="display:flex;gap:.75rem;margin-bottom:1.5rem;">
      <button class="btn btn-primary" onclick="saveRoadmap()">💾 Save Roadmap</button>
      <button class="btn btn-ghost" onclick="document.getElementById('roadmap-output').style.display='none';">✕ Dismiss</button>
    </div>
    <div id="generated-steps" class="roadmap-output">
      ${roadmap.steps.map((s, i) => `
        <div style="display:flex;flex-direction:column;">
          ${i > 0 ? '<div class="connector-line"></div>' : ""}
          <div class="roadmap-step">
            <div class="step-number">${i + 1}</div>
            <div class="step-content">
              <div class="step-title">${escHtml(s.title)}</div>
              <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.3rem;margin-bottom:.5rem;">
                <span class="badge badge-muted">⏱️ ${escHtml(s.duration)}</span>
                <span class="badge ${s.difficulty==="Advanced"?"badge-danger":s.difficulty==="Intermediate"?"badge-warning":"badge-success"}">${escHtml(s.difficulty)}</span>
              </div>
              <div class="step-desc">${escHtml(s.description)}</div>
              ${s.resources?.length ? `<div class="step-resources">${s.resources.map(r => `<span class="resource-chip">${escHtml(r)}</span>`).join("")}</div>` : ""}
              ${s.milestone ? `<div class="milestone-callout">🏆 <strong>Milestone:</strong> ${escHtml(s.milestone)}</div>` : ""}
            </div>
          </div>
        </div>`).join("")}
    </div>
  </div>`;

  output.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Save Roadmap ─────────────────────────────────────────────
async function saveRoadmap() {
  if (!currentRoadmap) return;
  try {
    await addUserDocument("roadmaps", currentRoadmap);
    showSuccess("Roadmap saved!");
  } catch { showError("Failed to save roadmap."); }
}

// ── Load Saved Roadmaps ──────────────────────────────────────
function loadSavedRoadmaps() {
  if (unsubscribe) unsubscribe();
  const container = document.getElementById("saved-roadmaps-list");
  if (!container) return;

  unsubscribe = listenToUserCollection("roadmaps", (docs, err) => {
    if (err) { showError("Failed to load saved roadmaps."); return; }
    savedRoadmaps = docs;
    renderSavedRoadmaps();
  }, { orderBy: "createdAt", orderDir: "desc" });
}

function renderSavedRoadmaps() {
  const container = document.getElementById("saved-roadmaps-list");
  if (!container) return;

  if (!savedRoadmaps.length) {
    renderEmptyState(container, "No roadmap generated yet. Create your first career roadmap.");
    return;
  }

  container.innerHTML = savedRoadmaps.map(rm => `
    <div class="saved-roadmap-card" id="rm-${rm.id}">
      <div style="min-width:0;">
        <div style="font-size:.9rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(rm.title)}</div>
        <div style="font-size:.72rem;color:var(--text-muted);margin-top:.25rem;">
          ${escHtml(rm.goal || "")} • ${escHtml(rm.timeline || "")} • ${formatDate(rm.createdAt)}
        </div>
      </div>
      <div style="display:flex;gap:.5rem;flex-shrink:0;">
        <button class="btn btn-ghost btn-sm" onclick="viewSavedRoadmap('${rm.id}')">View</button>
        <button class="btn btn-danger btn-sm" onclick="deleteSavedRoadmap('${rm.id}')">🗑️</button>
      </div>
    </div>`).join("");
}

function viewSavedRoadmap(id) {
  const rm = savedRoadmaps.find(r => r.id === id);
  if (!rm) return;
  currentRoadmap = rm;
  renderGeneratedRoadmap(rm);
}

async function deleteSavedRoadmap(id) {
  if (!confirmDelete("Delete this saved roadmap?")) return;
  try {
    await deleteUserDocument("roadmaps", id);
    showSuccess("Roadmap deleted.");
  } catch { showError("Failed to delete roadmap."); }
}

function escHtml(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
