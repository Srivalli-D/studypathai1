// ============================================================
// auth.js — Firebase Authentication for StudyPath AI Pro
// ============================================================

// ── Friendly Error Messages ──────────────────────────────────
function friendlyAuthError(error) {
  var code = (error && error.code) ? error.code : "";
  var map = {
    "auth/invalid-email":            "Please enter a valid email address.",
    "auth/user-not-found":           "No account found with this email.",
    "auth/wrong-password":           "Incorrect password. Please try again.",
    "auth/email-already-in-use":     "This email is already registered. Please log in.",
    "auth/weak-password":            "Password must be at least 6 characters.",
    "auth/too-many-requests":        "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed":   "Network error. Check your connection and try again.",
    "auth/user-disabled":            "This account has been disabled.",
    "auth/operation-not-allowed":    "This sign-in method is not enabled. Please enable Google in Firebase Console.",
    "auth/invalid-credential":       "Invalid credentials. Please check your email and password.",
    "auth/popup-closed-by-user":     "Sign-in popup was closed. Please try again.",
    "auth/popup-blocked":            "Popup was blocked by your browser. Please allow popups and try again.",
    "auth/cancelled-popup-request":  "Another sign-in popup is already open.",
    "auth/unauthorized-domain":      "This domain is not authorised. Add it under Firebase Console → Authentication → Settings → Authorized domains.",
    "auth/account-exists-with-different-credential":
                                     "An account already exists with this email using a different sign-in method.",
  };
  return map[code] || (error && error.message) || "Something went wrong. Please try again.";
}

// Legacy alias kept for existing callers
var getFriendlyError = function(code) {
  return friendlyAuthError({ code: code });
};

// ── Create or Update Firestore User Profile ──────────────────
/**
 * Checks if users/{uid} exists in Firestore.
 * - If missing → creates a full profile (including createdAt).
 * - If existing → only updates lastLogin.
 */
async function createOrUpdateUserProfile(user, provider) {
  if (!db) return; // Firestore not available — skip silently

  try {
    var uid  = user.uid;
    var now  = firebase.firestore.FieldValue.serverTimestamp();
    var ref  = db.collection("users").doc(uid);
    var snap = await ref.get();

    if (!snap.exists) {
      // New user — create full document
      await ref.set({
        name:      user.displayName || "Student",
        email:     (user.email || "").toLowerCase(),
        photoURL:  user.photoURL   || "",
        provider:  provider        || "email",
        createdAt: now,
        lastLogin: now,
      });
    } else {
      // Returning user — only update lastLogin
      await ref.update({ lastLogin: now });
    }
  } catch (err) {
    // Profile save is non-critical — auth already succeeded
    console.warn("createOrUpdateUserProfile:", err.message);
  }
}

// ── Google Sign-In ──────────────────────────────────────────
/**
 * Opens a Google sign-in popup, then saves / merges the user
 * profile into Firestore at users/{uid}.
 * Returns the Firebase user object on success.
 */
async function loginWithGoogle() {
  if (!auth) throw new Error("Firebase is not configured yet. Add your Firebase config in js/firebase-config.js.");

  var provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  provider.addScope("email");
  provider.addScope("profile");

  var result = await auth.signInWithPopup(provider);
  var user   = result.user;

  await createOrUpdateUserProfile(user, "google");

  window.location.href = "dashboard.html";
  return user;
}

// Legacy alias kept for existing callers in login.html / signup.html
var signInWithGoogle = loginWithGoogle;

// ── Sign Up ─────────────────────────────────────────────────
async function signupUser(name, email, password) {
  if (!auth) throw new Error("Firebase is not configured yet.");

  var trimmedName = name.trim();
  if (!trimmedName)          throw new Error("Full name is required.");
  if (trimmedName.length < 2) throw new Error("Name must be at least 2 characters.");

  var cred = await auth.createUserWithEmailAndPassword(email.trim(), password);

  // Update Firebase Auth display name
  await cred.user.updateProfile({ displayName: trimmedName });

  // Create Firestore user profile
  await createOrUpdateUserProfile(
    { uid: cred.user.uid, displayName: trimmedName, email: email, photoURL: "" },
    "email"
  );

  return cred.user;
}

// ── Log In ──────────────────────────────────────────────────
async function loginUser(email, password) {
  if (!auth) throw new Error("Firebase is not configured yet.");

  var cred = await auth.signInWithEmailAndPassword(email.trim(), password);
  await createOrUpdateUserProfile(cred.user, "email");
  return cred.user;
}

// ── Log Out ─────────────────────────────────────────────────
async function logoutUser() {
  if (!auth) return;
  await auth.signOut();
  window.location.href = "login.html";
}

// ── Auth State Listener (for guard.js) ──────────────────────
function onAuthStateReady(callback) {
  if (!auth) {
    // Firebase not configured — treat as logged out
    callback(null);
    return;
  }
  auth.onAuthStateChanged(callback);
}
