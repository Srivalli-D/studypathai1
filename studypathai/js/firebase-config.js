// ============================================================
// firebase-config.js — StudyPath AI Pro
// Replace values below with your Firebase project config.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyD83JtnxxECoMJjtTfaREEeLBLzWZ6B-WI",
  authDomain: "studypathai-d6505.firebaseapp.com",
  projectId: "studypathai-d6505",
  storageBucket: "studypathai-d6505.firebasestorage.app",
  messagingSenderId: "487699054271",
  appId: "1:487699054271:web:d2805a52470e7973f0d00a",
  measurementId: "G-XBNL172HGF"
};

// ── Detect placeholder config ──────────────────────────────
function isFirebaseConfigured() {
  const values = Object.values(firebaseConfig);
  return !values.some(v => typeof v === "string" && v.startsWith("PASTE_YOUR_"));
}

// ── Initialise Firebase safely ────────────────────────────
var app, auth, db;

try {
  if (isFirebaseConfigured()) {
    // Prevent duplicate app init on hot-reload scenarios
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    auth = firebase.auth();
    db   = firebase.firestore();

    // Enable offline persistence (silently ignore errors)
    db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
      if (err.code !== "failed-precondition" && err.code !== "unimplemented") {
        console.warn("Firestore persistence error:", err.code);
      }
    });
  } else {
    console.warn(
      "⚠️  Firebase is not configured yet.\n" +
      "Open js/firebase-config.js and paste your Firebase project credentials."
    );
    showConfigWarning();
  }
} catch (err) {
  console.error("Firebase init error:", err.message);
}

// ── Show config-missing banner ────────────────────────────
function showConfigWarning() {
  function injectBanner() {
    if (document.getElementById("firebase-config-banner")) return;
    var banner = document.createElement("div");
    banner.id = "firebase-config-banner";
    banner.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:99999;border-radius:0;margin:0;" +
      "padding:0.9rem 1.5rem;font-size:0.85rem;background:rgba(245,158,11,0.15);" +
      "border-bottom:1px solid rgba(245,158,11,0.4);color:#f59e0b;display:flex;gap:.75rem;align-items:center;";
    banner.innerHTML =
      '<span>⚠️</span>' +
      '<span><strong>Firebase is not configured yet.</strong> ' +
      'Please add your Firebase config in <code>js/firebase-config.js</code>. ' +
      'Auth and data features are disabled until then.</span>';
    if (document.body) {
      document.body.prepend(banner);
    } else {
      document.addEventListener("DOMContentLoaded", function() {
        document.body.prepend(banner);
      });
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectBanner);
  } else {
    injectBanner();
  }
}
