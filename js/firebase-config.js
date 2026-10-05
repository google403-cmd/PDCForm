/**
 * ===================================================================
 * PDC (PERSONALITY DEVELOPMENT CLUB) — BACKEND CONNECTOR BRIDGE
 * ===================================================================
 * Bridges and delegates to Supabase Backend (js/supabase-config.js)
 * Guarantees zero disruption to legacy calls and tests.
 * ===================================================================
 */

if (typeof require === "function") {
  const supabaseBackend = require("./supabase-config.js");
  module.exports = supabaseBackend;
  if (typeof window !== "undefined") {
    window.PDCBackend = supabaseBackend;
  }
}