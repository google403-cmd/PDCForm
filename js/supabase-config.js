/**
 * ===================================================================
 * PDC (PERSONALITY DEVELOPMENT CLUB) — SUPABASE CONFIGURATION & BACKEND
 * ===================================================================
 * Exclusively uses TWO tables:
 * 1. confirmation_stst: Student Program Confirmations & Registrations
 * 2. pdc_bibwewadi_submissions: Assessment Quiz Responses & Reports
 * ===================================================================
 */

const SUPABASE_DEFAULT_URL = "https://newtaeknlmkugqmhcyxg.supabase.co";
const SUPABASE_DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ld3RhZWtubG1rdWdxbWhjeXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzM4MzUsImV4cCI6MjEwNjc0OTgzNX0.MeDqtah3UBb8TjMldOl-wMeTFdvtPqU1GjFfQhbhdOU";

const COLLECTIONS = {
  CONFIRMATION_STST: "confirmation_stst",
  BIBWEWADI: "pdc_bibwewadi_submissions"
};

const getSupabaseConfig = () => {
  const globalConfig = (typeof window !== "undefined" && window.PDC_CONFIG && window.PDC_CONFIG.supabase)
    ? window.PDC_CONFIG.supabase
    : {};
  const injectedConfig = (typeof window !== "undefined" && window.PDC_SUPABASE_CONFIG)
    ? window.PDC_SUPABASE_CONFIG
    : {};

  return {
    url: injectedConfig.url || globalConfig.url || SUPABASE_DEFAULT_URL,
    anonKey: injectedConfig.anonKey || globalConfig.anonKey || SUPABASE_DEFAULT_ANON_KEY,
    tables: COLLECTIONS
  };
};

const supabaseConfig = getSupabaseConfig();
let isSupabaseConfigured = false;
let supabaseClient = null;
let _submissionInFlight = false;

// Initialize Supabase client
try {
  let createClientFn = null;
  if (typeof supabase !== "undefined" && typeof supabase.createClient === "function") {
    createClientFn = supabase.createClient;
  } else if (typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function") {
    createClientFn = window.supabase.createClient;
  } else if (typeof require === "function") {
    try {
      const sbMod = require("@supabase/supabase-js");
      createClientFn = sbMod.createClient;
    } catch (e) { }
  }

  if (createClientFn && supabaseConfig.url && supabaseConfig.anonKey) {
    supabaseClient = createClientFn(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    isSupabaseConfigured = true;
    console.log("✅ PDC Supabase client initialized (Tables: confirmation_stst, pdc_bibwewadi_submissions).");
  } else {
    console.info("PDC running in local storage mode until Supabase JS library is loaded.");
  }
} catch (err) {
  console.warn("PDC Supabase initialization notice:", err.message);
}

function getTargetCollection() {
  return COLLECTIONS.BIBWEWADI;
}

// ─────────────────────────────────────────────────────────────────
// OFFLINE SYNC QUEUE (ZERO DATA LOSS SAFEGUARD)
// ─────────────────────────────────────────────────────────────────
const SYNC_QUEUE_KEY = "pdc_supabase_sync_queue";

function queuePendingSync(payload, targetTable) {
  if (typeof localStorage === "undefined") return null;
  try {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
    const queueId = "pdc_queue_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
    queue.push({
      id: queueId,
      table: targetTable || COLLECTIONS.CONFIRMATION_STST,
      payload,
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    console.log(`Offline sync queued for [${targetTable}]:`, queueId);
    return queueId;
  } catch (err) {
    console.warn("Could not save to sync queue:", err);
    return "pdc_local_" + Date.now();
  }
}

let _isFlushingQueue = false;

async function flushSyncQueue() {
  if (_isFlushingQueue || !isSupabaseConfigured || !supabaseClient) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  _isFlushingQueue = true;
  try {
    const queueRaw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!queueRaw) return;

    const queue = JSON.parse(queueRaw);
    if (!Array.isArray(queue) || !queue.length) return;

    console.log(`PDC Supabase Queue: Flushing ${queue.length} pending submission(s)...`);
    const remaining = [];

    for (const item of queue) {
      try {
        const { error } = await supabaseClient
          .from(item.table)
          .upsert(item.payload, { onConflict: "Document ID" });
        if (error) throw error;
        console.log(`Successfully synced queued item to [${item.table}]:`, item.id);
      } catch (err) {
        console.warn(`Queued item sync retry later [${item.table}]:`, item.id, err.message);
        remaining.push(item);
      }
    }

    if (remaining.length) {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
    } else {
      localStorage.removeItem(SYNC_QUEUE_KEY);
      console.log("PDC Supabase Queue completely flushed.");
    }
  } catch (err) {
    console.warn("Error processing Supabase sync queue:", err);
  } finally {
    _isFlushingQueue = false;
  }
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("online", flushSyncQueue);
  setInterval(flushSyncQueue, 45000);
  setTimeout(flushSyncQueue, 3000);
}

// ─────────────────────────────────────────────────────────────────
// LIVE STATS HYDRATION (Directly from confirmation_stst)
// ─────────────────────────────────────────────────────────────────
async function fetchLiveStats() {
  let stats = {
    totalRegistered: 1554,
    totalJoined: 73,
    males: 1124,
    females: 430
  };

  try {
    if (typeof localStorage !== "undefined") {
      const cached = localStorage.getItem("pdc_live_stats_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.totalRegistered === "number") stats = parsed;
      }
    }
  } catch (e) { }

  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { count } = await supabaseClient
        .from(COLLECTIONS.CONFIRMATION_STST)
        .select("*", { count: "exact", head: true });

      if (typeof count === "number") {
        // Base seed count (1554) + new unique confirmations
        stats.totalRegistered = Math.max(1554, count);
        try {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("pdc_live_stats_cache", JSON.stringify(stats));
          }
        } catch (e) { }
      }
    } catch (err) {
      console.info("Stats fetch notice, using fallback/cached stats:", err.message);
    }
  }

  return stats;
}

// ─────────────────────────────────────────────────────────────────
// SAVE SIMPLE REGISTRATION (Exclusively in 'confirmation_stst')
// ─────────────────────────────────────────────────────────────────
async function saveSimpleRegistration(regData = {}) {
  if (_submissionInFlight) {
    return {
      success: false,
      error: "A submission is already in progress. Please wait a moment."
    };
  }

  const rawDigits = String(regData.phoneNumber || regData.whatsappNumber || regData.phone || "").replace(/[^0-9]/g, "");
  const phoneClean = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

  if (!phoneClean || phoneClean.length < 10) {
    return { success: false, error: "Please enter a valid 10-digit phone number." };
  }

  const nameClean = String(regData.fullName || regData.name || "").trim();
  if (!nameClean || nameClean.length < 2) {
    return { success: false, error: "Please enter your full name." };
  }

  const emailClean = String(regData.email || "").trim();
  if (!emailClean) {
    return { success: false, error: "Please enter your email address." };
  }

  _submissionInFlight = true;

  const genderClean = String(regData.gender || "Male").trim();
  const branchClean = String(regData.branch || "").trim();
  const divisionClean = String(regData.division || "").trim();
  const programClean = String(regData.program || "PDC Course and Camps Orientation Program at Sharad Arena(Auditorium)").trim();
  const eventDateClean = String(regData.eventDate || "Tuesday, 6 October 2026").trim();
  const eventTimeClean = String(regData.eventTime || "6:00 PM").trim();
  const venueClean = String(regData.venue || "Sharad Arena(Auditorium)").trim();
  const nowIso = new Date().toISOString();
  const docId = `/confirmation_stst/${phoneClean}`;
  const phoneNum = parseInt(phoneClean, 10);

  const payload = {
    "Document ID": docId,
    fullName: nameClean,
    phoneNumber: phoneNum,
    whatsappNumber: phoneNum,
    email: emailClean,
    gender: genderClean,
    branch: branchClean,
    division: divisionClean,
    program: programClean,
    eventDate: eventDateClean,
    eventTime: eventTimeClean,
    venue: venueClean,
    status: "confirmed",
    joinedWhatsApp: false,
    submittedAt: nowIso,
    timestamp: nowIso,
    userAgent: (typeof navigator !== "undefined" ? navigator.userAgent : "").slice(0, 500)
  };

  let isUpdate = false;

  try {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        // 1. Fast Primary Key check for deduplication
        const { data: existing } = await supabaseClient
          .from(COLLECTIONS.CONFIRMATION_STST)
          .select('"Document ID", joinedWhatsApp')
          .eq("Document ID", docId)
          .maybeSingle();

        if (existing) {
          isUpdate = true;
          if (existing.joinedWhatsApp) payload.joinedWhatsApp = true;
          payload.updatedAt = nowIso;
          payload.isDuplicateSubmission = "true";
        }

        // 2. Perform upsert directly and exclusively on confirmation_stst
        const { error: upsertErr } = await supabaseClient
          .from(COLLECTIONS.CONFIRMATION_STST)
          .upsert(payload, { onConflict: "Document ID" });

        if (upsertErr) {
          console.warn("Supabase upsert warning:", upsertErr);
          throw upsertErr;
        }

        console.log(`Saved confirmation to [${COLLECTIONS.CONFIRMATION_STST}] for ${phoneClean}. isUpdate=${isUpdate}`);
        return { success: true, isUpdate, id: phoneClean, student: payload };

      } catch (err) {
        console.warn("Supabase save error, queuing offline sync:", err.message);
        queuePendingSync(payload, COLLECTIONS.CONFIRMATION_STST);
        return { success: true, isUpdate, id: phoneClean, student: payload, isOffline: true };
      }
    }

    // Fallback cache if Supabase not ready
    queuePendingSync(payload, COLLECTIONS.CONFIRMATION_STST);
    try {
      localStorage.setItem(`pdc_student_${phoneClean}`, JSON.stringify(payload));
    } catch (e) { }

    return { success: true, isUpdate, id: phoneClean, student: payload, isOffline: true };
  } finally {
    _submissionInFlight = false;
  }
}

// ─────────────────────────────────────────────────────────────────
// RECORD WHATSAPP COMMUNITY JOIN (Exclusively in 'confirmation_stst')
// ─────────────────────────────────────────────────────────────────
async function recordWhatsAppJoin(studentData = {}) {
  const rawDigits = String(studentData.phoneNumber || studentData.whatsappNumber || studentData.phone || "").replace(/[^0-9]/g, "");
  const phoneClean = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

  if (!phoneClean) return { success: false, error: "Missing phone number" };

  const nowIso = new Date().toISOString();
  const docId = `/confirmation_stst/${phoneClean}`;

  if (isSupabaseConfigured && supabaseClient) {
    try {
      await supabaseClient
        .from(COLLECTIONS.CONFIRMATION_STST)
        .update({ joinedWhatsApp: true, updatedAt: nowIso })
        .eq("Document ID", docId);

      console.log(`WhatsApp join recorded for ${phoneClean} in [${COLLECTIONS.CONFIRMATION_STST}].`);
      return { success: true };
    } catch (err) {
      console.warn("Could not record WhatsApp join in Supabase:", err.message);
    }
  }

  return { success: true, isOffline: true };
}

// ─────────────────────────────────────────────────────────────────
// SAVE ASSESSMENT TEST SUBMISSION (Exclusively in 'pdc_bibwewadi_submissions')
// ─────────────────────────────────────────────────────────────────
async function saveTestSubmission(submissionData) {
  if (!submissionData) return { success: false, error: "Missing submission data" };

  if (_submissionInFlight) {
    return {
      success: false,
      error: "A submission is already in progress. Please wait a moment."
    };
  }

  _submissionInFlight = true;

  const targetTable = COLLECTIONS.BIBWEWADI;
  const nowIso = new Date().toISOString();
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const docId = `/${targetTable}/${Date.now()}_${randomSuffix}`;

  const payload = {
    "Document ID": docId,
    fullName: String(submissionData.fullName || "").trim(),
    email: String(submissionData.email || "").trim(),
    whatsappNumber: parseInt(String(submissionData.whatsappNumber || submissionData.phoneNumber || "0").replace(/[^0-9]/g, "").slice(-10), 10) || null,
    gender: submissionData.gender || "Other",
    homeTown: submissionData.homeTown || "",
    campus: submissionData.campus || "Bibwewadi",
    branch: submissionData.branch || "",
    division: submissionData.division || "",
    year: submissionData.year || "",
    totalScore: submissionData.totalScore || 0,
    scores: submissionData.scores || {},
    answers: submissionData.answers || {},
    cognitiveProfile: submissionData.cognitiveProfile || "",
    cognitiveScore: String(submissionData.cognitiveScore || ""),
    primaryProfile: submissionData.primaryProfile || "",
    secondaryProfile: submissionData.secondaryProfile || "",
    spiritualProfile: submissionData.spiritualProfile || "",
    report: typeof submissionData.report === "object" ? JSON.stringify(submissionData.report) : String(submissionData.report || ""),
    submittedAt: nowIso,
    timestamp: nowIso,
    userAgent: (typeof navigator !== "undefined" ? navigator.userAgent : "").slice(0, 500)
  };

  try {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from(targetTable)
          .insert(payload);

        if (error) throw error;
        console.log(`Assessment saved successfully to Supabase [${targetTable}]:`, docId);
        return { success: true, id: docId, collection: targetTable };
      } catch (err) {
        console.warn(`Supabase assessment insert failed, queuing offline sync:`, err.message);
        queuePendingSync(payload, targetTable);
        return { success: true, id: docId, collection: targetTable, isOffline: true };
      }
    }

    queuePendingSync(payload, targetTable);
    return { success: true, id: docId, collection: targetTable, isOffline: true };
  } finally {
    _submissionInFlight = false;
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT COMPATIBLE BACKEND API (WINDOW & MODULE)
// ─────────────────────────────────────────────────────────────────
const PDCBackend = {
  COLLECTIONS,
  getTargetCollection,
  saveTestSubmission,
  saveRegistration: saveSimpleRegistration,
  saveSimpleRegistration,
  fetchLiveStats,
  recordWhatsAppJoin,
  incrementRegistrationCounter: async () => {},
  updateRegistrationStats: async () => {},
  getRegistrationCount: async () => (await fetchLiveStats()).totalRegistered,
  incrementWhatsAppJoinedCounter: recordWhatsAppJoin,
  getWhatsAppJoinedCount: async () => (await fetchLiveStats()).totalJoined,
  isFirebaseConfigured: () => true,
  isSupabaseConfigured: () => isSupabaseConfigured,
  getSupabaseConfig,
  getFirebaseConfig: () => ({}),
  flushSyncQueue,
  supabaseClient: () => supabaseClient
};

if (typeof window !== "undefined") {
  window.PDCBackend = PDCBackend;
  window.PDCSupabaseBackend = PDCBackend;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ...PDCBackend,
    supabaseConfig,
    createSupabaseClient: (url, key) => {
      const { createClient } = require("@supabase/supabase-js");
      return createClient(url || supabaseConfig.url, key || supabaseConfig.anonKey);
    }
  };
}
