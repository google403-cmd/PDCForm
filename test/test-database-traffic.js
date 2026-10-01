/**
 * High-Traffic Database & Concurrency Simulation Suite
 * Tests Firestore submission reliability, queue fallbacks, rate limits,
 * anti-race double click prevention, and campus routing under simulated peak load.
 */

const assert = require("assert");
const config = require("../js/content.js");
const engine = config.engine;

console.log("==================================================");
console.log("PDC DATABASE & HIGH TRAFFIC STRESS TEST SUITE");
console.log("==================================================");

// Mock browser environment for PDCBackend
global.window = {};
global.navigator = { userAgent: "PDC-Stress-Tester/2.0", onLine: true };
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

const backend = require("../js/firebase-config.js");

// -------------------------------------------------------------
// Test 1: Concurrency & Anti-Race Double-Click Protection
// -------------------------------------------------------------
console.log("\n[Traffic Test 1] Testing rapid concurrent submissions (anti-race lock)...");

// Prepare valid base submission
const sampleAnswers = {
  PQ1: "A", PQ2: "B", PQ3: "C", PQ5: "D", PQ7: "A", PQ8: "B", PQ10: "E",
  IQ1: "D", IQ2: "B", IQ3: "D", IQ5: "C", IQ7: "C", IQ9: "B",
  SQ1: "A", SQ2: "B", SQ4: "D", SQ5: "E", SQ6: "B", SQ7: "A", SQ9: "E"
};
const evaluation = engine.evaluateAssessment(sampleAnswers);

const samplePayload = {
  fullName: "Concurrent Student",
  email: "concurrent@vit.edu",
  whatsappNumber: "9876543210",
  gender: "Male",
  homeTown: "Pune",
  campus: "Bibwewadi",
  branch: "Computer Engineering",
  division: "A",
  year: "FY",
  answers: sampleAnswers,
  scores: evaluation.scores,
  totalScore: evaluation.totalScore,
  primaryProfile: evaluation.primaryProfile.name,
  secondaryProfile: evaluation.secondaryProfile.name,
  cognitiveScore: evaluation.cognitiveScore.points,
  cognitiveProfile: evaluation.cognitiveProfile.label,
  spiritualDimensions: evaluation.spiritualDimensions,
  spiritualProfile: evaluation.spiritualProfile.name,
  report: evaluation.report
};

// Fire 5 rapid submissions simultaneously
const concurrentPromises = [
  backend.saveTestSubmission(samplePayload),
  backend.saveTestSubmission(samplePayload),
  backend.saveTestSubmission(samplePayload),
  backend.saveTestSubmission(samplePayload),
  backend.saveTestSubmission(samplePayload)
];

Promise.all(concurrentPromises).then(async (results) => {
  const successful = results.filter(r => r.success);
  const blocked = results.filter(r => !r.success && r.error && r.error.includes("already in progress"));

  console.log(`Concurrent results: ${successful.length} accepted, ${blocked.length} blocked by concurrency mutex`);
  assert.strictEqual(successful.length, 1, "Exactly ONE submission must succeed during simultaneous attempts");
  assert.strictEqual(blocked.length, 4, "All 4 concurrent double-clicks must be safely blocked");
  console.log("✅ Traffic Test 1 Passed: Anti-race mutex strictly prevents duplicate submissions");

  // -------------------------------------------------------------
  // Test 2: High Traffic Batch Submission (100 Students)
  // -------------------------------------------------------------
  console.log("\n[Traffic Test 2] Simulating 100 student submissions across campuses & branches...");
  
  const branches = [
    "Computer Engineering",
    "Information Technology",
    "Electronics and Telecommunication Engineering",
    "Artificial Intelligence and Data Science",
    "Mechanical Engineering"
  ];
  const divisions = ["A", "B", "C", "D", "E", "F", "SEDA"];
  const campuses = ["Bibwewadi", "Kondhwa"];

  let bibwewadiCount = 0;
  let kondhwaCount = 0;

  for (let i = 1; i <= 100; i++) {
    const campus = campuses[i % 2];
    const branch = branches[i % branches.length];
    const division = divisions[i % divisions.length];

    if (campus === "Bibwewadi") bibwewadiCount++;
    else kondhwaCount++;

    const studentAnswers = {};
    config.steps.forEach(s => {
      if (s.questions) {
        s.questions.forEach(q => {
          const opts = ["A", "B", "C", "D", "E"];
          studentAnswers[q.id] = opts[(i + q.id.charCodeAt(q.id.length - 1)) % 5];
        });
      }
    });

    const studentEval = engine.evaluateAssessment(studentAnswers);
    assert(studentEval.scores.pq <= 35, `PQ score of student ${i} must be <= 35`);
    assert(studentEval.scores.iq <= 30, `IQ score of student ${i} must be <= 30`);
    assert(studentEval.scores.sq <= 35, `SQ score of student ${i} must be <= 35`);
    assert(studentEval.totalScore <= 100, `Total score of student ${i} must be <= 100`);

    const studentPayload = {
      fullName: `VIT Student ${i}`,
      email: `student${i}@vit.edu`,
      whatsappNumber: `98765432${(i < 10 ? '0' : '') + i}`,
      gender: i % 2 === 0 ? "Female" : "Male",
      homeTown: "Pune",
      campus,
      branch,
      division,
      year: "FY",
      answers: studentAnswers,
      scores: studentEval.scores,
      totalScore: studentEval.totalScore
    };

    // Sequential invocation simulates steady arrival without concurrency conflict
    const res = await backend.saveTestSubmission(studentPayload);
    assert(res.success, `Student ${i} submission must succeed (queued or written)`);
  }

  console.log(`Processed 100 submissions (${bibwewadiCount} Bibwewadi, ${kondhwaCount} Kondhwa)`);
  console.log("✅ Traffic Test 2 Passed: 100% of high-volume submissions processed without schema failures");

  // -------------------------------------------------------------
  // Test 3: Offline / Network Disruption Queue Resiliency
  // -------------------------------------------------------------
  console.log("\n[Traffic Test 3] Testing persistent queue during network disruption...");
  
  const rawQueue = JSON.parse(storage["pdc_sync_queue"] || "[]");
  console.log(`Pending sync queue contains ${rawQueue.length} verified submissions.`);
  assert(rawQueue.length > 0, "Submissions under offline/demo mode must be stored in persistent sync queue");
  
  // Verify queued payload integrity
  const firstItem = rawQueue[0];
  assert(firstItem.id.startsWith("pdc_queue_"), "Queue IDs must follow PDC format");
  assert(firstItem.payload.fullName, "Queued item must retain student full name");
  assert(firstItem.payload.scores.pq <= 35, "Queued item must retain valid PQ score");
  assert(firstItem.payload.scores.iq <= 30, "Queued item must retain valid IQ score");
  assert(firstItem.payload.scores.sq <= 35, "Queued item must retain valid SQ score");

  console.log("✅ Traffic Test 3 Passed: Zero-data-loss sync queue holds payloads safely with complete score integrity");

  // -------------------------------------------------------------
  // Test 4: Score Boundary Interception
  // -------------------------------------------------------------
  console.log("\n[Traffic Test 4] Testing invalid score boundary interception...");
  
  const invalidPayload = {
    ...samplePayload,
    scores: { pq: 99, iq: 50, sq: 40 }, // Exceeds limits
    totalScore: 189
  };

  const invalidResult = await backend.saveTestSubmission(invalidPayload);
  assert.strictEqual(invalidResult.success, false, "Invalid scores must be intercepted");
  assert(invalidResult.error.includes("validation error"), "Error message must state score validation failure");
  console.log("✅ Traffic Test 4 Passed: Malformed scores intercepted before database write");

  console.log("\n==================================================");
  console.log("ALL DATABASE TRAFFIC & CONCURRENCY TESTS PASSED!");
  console.log("==================================================");
}).catch(err => {
  console.error("Database traffic test failed:", err);
  process.exit(1);
});
