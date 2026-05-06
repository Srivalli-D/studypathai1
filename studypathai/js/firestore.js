// ============================================================
// firestore.js — Firestore CRUD helpers for StudyPath AI Pro
// All data lives under users/{uid}/{collection}/
// ============================================================

function getCurrentUserId() {
  if (typeof auth === "undefined" || !auth) return null;
  var u = auth.currentUser;
  return u ? u.uid : null;
}

function userRef() {
  var uid = getCurrentUserId();
  if (!uid || typeof db === "undefined" || !db) return null;
  return db.collection("users").doc(uid);
}

function subColRef(collectionName) {
  var ref = userRef();
  if (!ref) return null;
  return ref.collection(collectionName);
}

// ── User Profile ────────────────────────────────────────────
async function getUserProfile() {
  try {
    var ref = userRef();
    if (!ref) return null;
    var snap = await ref.get();
    return snap.exists ? snap.data() : null;
  } catch (err) {
    console.error("getUserProfile error:", err.message);
    return null;
  }
}

async function updateUserProfile(data) {
  try {
    var ref = userRef();
    if (!ref) return;
    data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    await ref.set(data, { merge: true });
  } catch (err) {
    console.error("updateUserProfile error:", err.message);
    throw err;
  }
}

// ── Add Document ────────────────────────────────────────────
async function addUserDocument(collectionName, data) {
  try {
    var col = subColRef(collectionName);
    if (!col) throw new Error("Not authenticated");
    var now = firebase.firestore.FieldValue.serverTimestamp();
    var payload = Object.assign({}, data, { createdAt: now, updatedAt: now });
    var docRef = await col.add(payload);
    return docRef.id;
  } catch (err) {
    console.error("addUserDocument(" + collectionName + ") error:", err.message);
    throw err;
  }
}

// ── Update Document ─────────────────────────────────────────
async function updateUserDocument(collectionName, docId, data) {
  try {
    var col = subColRef(collectionName);
    if (!col) throw new Error("Not authenticated");
    var payload = Object.assign({}, data, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    await col.doc(docId).update(payload);
  } catch (err) {
    console.error("updateUserDocument(" + collectionName + ") error:", err.message);
    throw err;
  }
}

// ── Delete Document ─────────────────────────────────────────
async function deleteUserDocument(collectionName, docId) {
  try {
    var col = subColRef(collectionName);
    if (!col) throw new Error("Not authenticated");
    await col.doc(docId).delete();
  } catch (err) {
    console.error("deleteUserDocument(" + collectionName + ") error:", err.message);
    throw err;
  }
}

// ── Real-time Listener ──────────────────────────────────────
function listenToUserCollection(collectionName, callback, options) {
  options = options || {};
  var col = subColRef(collectionName);
  if (!col) {
    // Return no-op unsubscribe
    return function() {};
  }

  var query = col;

  // Apply ordering if specified
  if (options.orderBy) {
    try {
      query = query.orderBy(options.orderBy, options.orderDir || "desc");
    } catch (e) {
      console.warn("listenToUserCollection: orderBy failed, using unordered query.");
    }
  }

  if (options.where) {
    try {
      var field = options.where[0], op = options.where[1], val = options.where[2];
      query = query.where(field, op, val);
    } catch (e) { /* ignore */ }
  }

  if (options.limit) {
    try {
      query = query.limit(options.limit);
    } catch (e) { /* ignore */ }
  }

  return query.onSnapshot(
    function(snap) {
      var docs = snap.docs.map(function(d) {
        return Object.assign({ id: d.id }, d.data());
      });
      callback(docs, null);
    },
    function(err) {
      console.error("listenToUserCollection(" + collectionName + ") error:", err.message);
      callback([], err);
    }
  );
}

// ── One-time Fetch ──────────────────────────────────────────
async function getUserCollectionOnce(collectionName, options) {
  options = options || {};
  try {
    var col = subColRef(collectionName);
    if (!col) return [];

    var query = col;
    if (options.orderBy) {
      try {
        query = query.orderBy(options.orderBy, options.orderDir || "desc");
      } catch (e) {
        console.warn("getUserCollectionOnce: orderBy failed.");
      }
    }
    if (options.limit) {
      try { query = query.limit(options.limit); } catch (e) { /* ignore */ }
    }

    var snap = await query.get();
    return snap.docs.map(function(d) {
      return Object.assign({ id: d.id }, d.data());
    });
  } catch (err) {
    console.error("getUserCollectionOnce(" + collectionName + ") error:", err.message);
    return [];
  }
}
