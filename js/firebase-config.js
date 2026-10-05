/**
 * ===================================================================
 * PDC (PERSONALITY DEVELOPMENT CLUB) — BACKEND CONNECTOR BRIDGE
 * ===================================================================
 * Bridges and delegates to Supabase Backend (js/supabase-config.js)
 * Guarantees zero disruption to legacy calls and tests.
 * ===================================================================
 */

if (typeof window !== "undefined") {
  if (window.PDCSupabaseBackend) {
    window.PDCBackend = window.PDCSupabaseBackend;
  }
}

if (typeof require === "function") {
  try {
    const supabaseBackend = require("./supabase-config.js");
    if (typeof module !== "undefined" && module.exports) {
      module.exports = supabaseBackend;
    }
    if (typeof window !== "undefined") {
      window.PDCBackend = supabaseBackend;
    }
  } catch (e) { }
}