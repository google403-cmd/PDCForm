/**
 * ===================================================================
 * DHRUVA CLUB — FIREBASE FIRESTORE CONFIGURATION
 * ===================================================================
 * 
 * Replace the placeholder values below with your actual Firebase Project
 * credentials from the Firebase Console (https://console.firebase.google.com/):
 * 
 * 1. Go to Project Settings -> General -> Your apps -> Web app
 * 2. Copy the firebaseConfig object properties and paste them here.
 * 3. Make sure Firestore Database is created in Test Mode or with proper write rules.
 * ===================================================================
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// State flag to detect if user has configured real credentials
let isFirebaseConfigured = false;
let db = null;

try {
  if (
    typeof firebase !== "undefined" &&
    firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  ) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    isFirebaseConfigured = true;
    console.log("✅ Firebase Firestore initialized successfully.");
  } else {
    console.warn("⚠️ Firebase is using placeholder credentials. Test submissions will be logged to console & local storage for preview until you add real Firebase credentials.");
  }
} catch (error) {
  console.error("❌ Firebase Initialization Error:", error);
}

/**
 * Saves a completed test submission to Firestore (or localStorage fallback).
 * @param {Object} submissionData - Complete response payload
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
async function saveTestSubmission(submissionData) {
  const timestamp = new Date().toISOString();
  const payload = {
    ...submissionData,
    submittedAt: timestamp,
    userAgent: navigator.userAgent
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await db.collection("dhruva_test_submissions").add(payload);
      console.log("✅ Submission saved to Firestore with ID:", docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("❌ Firestore write error:", error);
      // Fallback save to localStorage so student data isn't lost
      saveToLocalBackup(payload);
      return { success: true, id: "offline_saved", warning: error.message };
    }
  } else {
    // Demo / offline mode fallback
    saveToLocalBackup(payload);
    console.log("📦 (Demo Mode) Submission saved locally:", payload);
    // Simulate slight network delay for natural UX
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, id: "demo_" + Date.now() };
  }
}

function saveToLocalBackup(payload) {
  try {
    const existing = JSON.parse(localStorage.getItem("dhruva_submissions_backup") || "[]");
    existing.push(payload);
    localStorage.setItem("dhruva_submissions_backup", JSON.stringify(existing));
  } catch (e) {
    console.error("Local backup write failed", e);
  }
}

window.DhruvaBackend = {
  saveTestSubmission,
  isFirebaseConfigured: () => isFirebaseConfigured
};
