// ============================================================
// firebase-config.example.js — StudyPath AI Pro
//
// This is a TEMPLATE file. Copy it to js/firebase-config.js
// and replace every placeholder value with your actual
// Firebase project credentials.
//
// DO NOT commit the real firebase-config.js to Git if it
// contains real credentials. The real file is listed in .gitignore.
// ============================================================

const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId:         "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId:             "PASTE_YOUR_APP_ID_HERE",
  measurementId:     "PASTE_YOUR_MEASUREMENT_ID_HERE"   // optional — Analytics
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
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    auth = firebase.auth();
    db   = firebase.firestore();

    db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
      if (err.code !== "failed-precondition" && err.code !== "unimplemented") {
        console.warn("Firestore persistence error:", err.code);
      }
    });
  } else {
    console.warn(
      "⚠️  Firebase is not configured yet.\n" +
      "Copy js/firebase-config.example.js → js/firebase-config.js\n" +
      "and replace the placeholder values with your real Firebase credentials."
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
      'Copy <code>js/firebase-config.example.js</code> to <code>js/firebase-config.js</code> ' +
      'and add your credentials. Auth and data features are disabled until then.</span>';
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
