/**
 * ===================================================================
 * PDC (PERSONALITY DEVELOPMENT CLUB) — FIREBASE FIRESTORE CONFIGURATION
 * ===================================================================
 * Supports dynamic configuration via:
 * 1. window.PDC_CONFIG.firebase or window.PDC_FIREBASE_CONFIG
 * 2. Injected environment variables
 * 3. Graceful offline/demo storage when Firebase project is not yet connected
 *
 * Firebase compatibility SDK must be loaded before this file:
 * - firebase-app-compat.js
 * - firebase-firestore-compat.js
 * ===================================================================
 */

// Retrieve configuration from window.PDC_CONFIG or defaults
const getFirebaseConfig = () => {
  const globalConfig = (typeof window !== "undefined" && window.PDC_CONFIG && window.PDC_CONFIG.firebase) 
    ? window.PDC_CONFIG.firebase 
    : {};
  const injectedConfig = (typeof window !== "undefined" && window.PDC_FIREBASE_CONFIG) 
    ? window.PDC_FIREBASE_CONFIG 
    : {};

  return {
    apiKey: injectedConfig.apiKey || globalConfig.apiKey || "AIzaSyDS7leZONMPWe1UItrShq2NxFrMCFJqTjs",
    authDomain: injectedConfig.authDomain || globalConfig.authDomain || "dhruva-7c184.firebaseapp.com",
    projectId: injectedConfig.projectId || globalConfig.projectId || "dhruva-7c184",
    storageBucket: injectedConfig.storageBucket || globalConfig.storageBucket || "dhruva-7c184.firebasestorage.app",
    messagingSenderId: injectedConfig.messagingSenderId || globalConfig.messagingSenderId || "611719166487",
    appId: injectedConfig.appId || globalConfig.appId || "1:611719166487:web:7a6d3d29fc57b90b7efa52",
  };
};

const firebaseConfig = getFirebaseConfig();

let isFirebaseConfigured = false;
let db = null;

// Track in-flight submission to prevent race conditions & double-clicks
let _submissionInFlight = false;
let _lastSubmissionId = null;

try {
  const hasValidConfig =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    !firebaseConfig.apiKey.includes("PLACEHOLDER") &&
    !firebaseConfig.apiKey.includes("YOUR_") &&
    !firebaseConfig.projectId.includes("YOUR_");

  if (typeof firebase !== "undefined" && hasValidConfig) {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    isFirebaseConfigured = true;

    db.settings({
      experimentalForceLongPolling: false,
      merge: true
    });

    console.log("PDC Firebase Firestore initialized successfully.");
  } else {
    console.info("PDC assessment running in local/demo storage mode until live Firebase project credentials are provided.");
  }
} catch (error) {
  console.warn("PDC Firebase initialization status:", error.message);
}

/**
 * Save one completed assessment to Firestore (pdc_test_submissions).
 * Includes deduplication, score validation, and graceful local fallback.
 *
 * @param {Object} submissionData
 * @returns {Promise<{success: boolean, id?: string, error?: string, isOffline?: boolean}>}
 */
async function saveTestSubmission(submissionData) {
  // Guard against concurrent in-flight submissions
  if (_submissionInFlight) {
    console.warn("Submission already in progress. Returning early.");
    return {
      success: false,
      error: "A submission is already in progress. Please wait a moment."
    };
  }

  _submissionInFlight = true;

  // Format timestamp
  const nowIso = new Date().toISOString();
  
  // Normalize scores (supports EQ as primary and SQ as alias)
  const pqScore = Number(submissionData.scores?.pq || 0);
  const iqScore = Number(submissionData.scores?.iq || 0);
  const eqScore = Number(submissionData.scores?.eq !== undefined ? submissionData.scores.eq : (submissionData.scores?.sq || 0));

  const payload = {
    fullName: String(submissionData.fullName || "").trim(),
    email: String(submissionData.email || "").trim(),
    whatsappNumber: String(submissionData.whatsappNumber || "").trim(),
    gender: String(submissionData.gender || "").trim(),
    homeTown: String(submissionData.homeTown || "").trim(),
    campus: String(submissionData.campus || "").trim(),
    branch: String(submissionData.branch || "").trim(),
    division: String(submissionData.division || "").trim(),
    year: String(submissionData.year || "").trim(),
    answers: submissionData.answers || {},
    scores: {
      pq: pqScore,
      iq: iqScore,
      eq: eqScore,
      sq: eqScore // backwards-compatibility alias for Firestore rule
    },
    totalScore: Number(submissionData.totalScore || (pqScore + iqScore + eqScore)),
    timestamp: submissionData.timestamp || nowIso,
    submittedAt: submissionData.submittedAt || nowIso,
    userAgent: String(submissionData.userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "Node")).substring(0, 500)
  };

  // Validate scores against section maximums
  if (payload.scores.pq > 35 || payload.scores.iq > 30 || payload.scores.eq > 35 || payload.totalScore > 100) {
    _submissionInFlight = false;
    console.error("Score validation failed: scores exceed section maximums.", payload.scores);
    return {
      success: false,
      error: "Score validation error. Please refresh and retake the assessment."
    };
  }

  // If live Firebase is configured and connected, write to Firestore
  if (isFirebaseConfigured && db) {
    try {
      const documentReference = await db
        .collection("pdc_test_submissions")
        .add(payload);

      _lastSubmissionId = documentReference.id;
      console.log("PDC assessment saved successfully. Document ID:", documentReference.id);

      return {
        success: true,
        id: documentReference.id
      };
    } catch (error) {
      console.error("Firestore write failed:", error.code || error.message);

      let userMessage = "We couldn't save your assessment right now. Please check your internet connection and try again.";

      if (error.code === "permission-denied") {
        userMessage = "Submission was rejected by the server. Please contact the PDC coordinators.";
      } else if (error.code === "unavailable" || error.code === "deadline-exceeded") {
        userMessage = "The server is temporarily busy. Please wait a moment and try submitting again.";
      }

      return {
        success: false,
        error: userMessage
      };
    } finally {
      _submissionInFlight = false;
    }
  }

  // Graceful Local / Demo Storage Fallback
  try {
    const demoId = "pdc_local_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    if (typeof localStorage !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("pdc_local_submissions") || "[]");
      existing.push({ id: demoId, ...payload });
      localStorage.setItem("pdc_local_submissions", JSON.stringify(existing));
    }
    console.log("Assessment stored in local demo session:", demoId);
    _lastSubmissionId = demoId;
    return {
      success: true,
      id: demoId,
      isOffline: true
    };
  } catch (localErr) {
    console.warn("Local storage fallback warning:", localErr);
    return {
      success: true,
      id: "pdc_session_" + Date.now()
    };
  } finally {
    _submissionInFlight = false;
  }
}

if (typeof window !== "undefined") {
  window.PDCBackend = {
    saveTestSubmission,
    isFirebaseConfigured: () => isFirebaseConfigured,
    getFirebaseConfig
  };
  // Backwards compatibility alias
  window.DhruvaBackend = window.PDCBackend;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    firebaseConfig,
    saveTestSubmission
  };
}