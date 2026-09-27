/**
 * Dhruva Club Firebase Firestore Configuration
 *
 * Firebase compatibility SDK must be loaded before this file:
 *
 * firebase-app-compat.js
 * firebase-firestore-compat.js
 */

const firebaseConfig = {
  apiKey: "AIzaSyDS7leZONMPWe1UItrShq2NxFrMCFJqTjs",
  authDomain: "dhruva-7c184.firebaseapp.com",
  projectId: "dhruva-7c184",
  storageBucket: "dhruva-7c184.firebasestorage.app",
  messagingSenderId: "611719166487",
  appId: "1:611719166487:web:7a6d3d29fc57b90b7efa52",
};

let isFirebaseConfigured = false;
let db = null;

try {
  const hasValidConfig =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    !firebaseConfig.apiKey.includes("YOUR_") &&
    !firebaseConfig.projectId.includes("YOUR_");

  if (typeof firebase === "undefined") {
    throw new Error(
      "Firebase SDK was not loaded. Check the script tags in index.html."
    );
  }

  if (!hasValidConfig) {
    throw new Error(
      "Firebase configuration still contains placeholder values."
    );
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  db = firebase.firestore();
  isFirebaseConfigured = true;

  console.log("Firebase Firestore initialized successfully.");
} catch (error) {
  console.error("Firebase initialization failed:", error.message);
}

/**
 * Save one completed assessment to Firestore.
 *
 * @param {Object} submissionData
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
async function saveTestSubmission(submissionData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured. Check js/firebase-config.js."
    );
  }

  const payload = {
    ...submissionData,
    submittedAt: new Date().toISOString(),
  };

  try {
    const documentReference = await db
      .collection("dhruva_test_submissions")
      .add(payload);

    console.log(
      "Assessment saved successfully. Document ID:",
      documentReference.id
    );

    return {
      success: true,
      id: documentReference.id
    };
  } catch (error) {
    console.error("Firestore write failed:", error);

    return {
      success: false,
      error: error.message
    };
  }
}

window.DhruvaBackend = {
  saveTestSubmission,
  isFirebaseConfigured: () => isFirebaseConfigured
};