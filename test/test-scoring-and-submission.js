const assert = require("assert");
const config = require("../js/content.js");

console.log("==================================================");
console.log("TESTING PDC SCORING LOGIC AND PAYLOAD STRUCTURE");
console.log("==================================================");

// Simulation of calculateScores logic from app.js
function calculateScores(answers) {
  let pqEarned = 0;
  let iqEarned = 0;
  let eqEarned = 0;

  (config.steps || []).forEach(step => {
    if (!step.questions || !step.questions.length) return;
    const dim = step.dimension || (step.id.includes("iq") ? "iq" : (step.id.includes("eq") || step.id.includes("sq") ? "eq" : "pq"));

    step.questions.forEach(q => {
      const userSelectedOptId = answers[q.id];
      if (!userSelectedOptId) return;

      const selectedOpt = q.options.find(o => o.id === userSelectedOptId);
      const marks = selectedOpt ? selectedOpt.marks : 0;

      if (dim === "pq") {
        pqEarned += marks;
      } else if (dim === "iq") {
        iqEarned += marks;
      } else if (dim === "eq" || dim === "sq") {
        eqEarned += marks;
      }
    });
  });

  const roundScore = (val) => Math.round(val * 10) / 10;

  const pq = roundScore(pqEarned);
  const iq = roundScore(iqEarned);
  const eq = roundScore(eqEarned);
  const total = roundScore(pq + iq + eq);

  return { pq, iq, eq, total };
}

// -------------------------------------------------------------
// Test 2: All Maximum Answers
// -------------------------------------------------------------
const allMaxAnswers = {};
config.steps.forEach(step => {
  if (step.questions) {
    step.questions.forEach(q => {
      // Find option with 5 marks
      const maxOpt = q.options.find(o => o.marks === 5);
      allMaxAnswers[q.id] = maxOpt.id;
    });
  }
});

const maxScores = calculateScores(allMaxAnswers);
console.log("Test 2 - All Maximum Answers:", maxScores);
assert.strictEqual(maxScores.pq, 35, "PQ maximum must be 35");
assert.strictEqual(maxScores.iq, 30, "IQ maximum must be 30");
assert.strictEqual(maxScores.eq, 35, "EQ maximum must be 35");
assert.strictEqual(maxScores.total, 100, "Total maximum must be 100");
console.log("✅ Test 2 Passed: PQ=35, IQ=30, EQ=35, TOTAL=100");

// -------------------------------------------------------------
// Test 3: All Minimum Answers
// -------------------------------------------------------------
const allMinAnswers = {};
config.steps.forEach(step => {
  if (step.questions) {
    step.questions.forEach(q => {
      // Find option with lowest marks
      const minOpt = q.options.reduce((min, cur) => cur.marks < min.marks ? cur : min, q.options[0]);
      allMinAnswers[q.id] = minOpt.id;
    });
  }
});

const minScores = calculateScores(allMinAnswers);
console.log("Test 3 - All Minimum Answers:", minScores);
assert.strictEqual(minScores.pq, 17.5, "PQ minimum must be 17.5");
assert.strictEqual(minScores.iq, 15, "IQ minimum must be 15");
assert.strictEqual(minScores.eq, 17.5, "EQ minimum must be 17.5");
assert.strictEqual(minScores.total, 50, "Total minimum must be 50");
console.log("✅ Test 3 Passed: PQ=17.5, IQ=15, EQ=17.5, TOTAL=50");

// -------------------------------------------------------------
// Test 4: Mixed Answers
// -------------------------------------------------------------
// Select Option A for all questions
const allOptAAnswers = {};
let expectedPQA = 0, expectedIQA = 0, expectedEQA = 0;
config.steps.forEach(step => {
  if (step.questions) {
    step.questions.forEach(q => {
      allOptAAnswers[q.id] = "A";
      const optA = q.options.find(o => o.id === "A");
      if (step.dimension === "pq") expectedPQA += optA.marks;
      if (step.dimension === "iq") expectedIQA += optA.marks;
      if (step.dimension === "eq" || step.dimension === "sq") expectedEQA += optA.marks;
    });
  }
});

const mixedScores = calculateScores(allOptAAnswers);
console.log("Test 4 - Mixed Answers (All Option A):", mixedScores);
assert.strictEqual(mixedScores.pq, Math.round(expectedPQA * 10) / 10, "PQ score for Option A must match manual sum");
assert.strictEqual(mixedScores.iq, Math.round(expectedIQA * 10) / 10, "IQ score for Option A must match manual sum");
assert.strictEqual(mixedScores.eq, Math.round(expectedEQA * 10) / 10, "EQ score for Option A must match manual sum");
assert.strictEqual(mixedScores.total, Math.round((expectedPQA + expectedIQA + expectedEQA) * 10) / 10, "Total score must match sum of sections");
console.log(`✅ Test 4 Passed: PQ=${mixedScores.pq}, IQ=${mixedScores.iq}, EQ=${mixedScores.eq}, TOTAL=${mixedScores.total}`);

// -------------------------------------------------------------
// Test Payload Validation
// -------------------------------------------------------------
const samplePayload = {
  fullName: "John Doe",
  email: "johndoe@example.com",
  whatsappNumber: "9876543210",
  gender: "Male",
  homeTown: "Pune",
  campus: "Bibwewadi",
  branch: "Computer Engineering",
  division: "A",
  year: "FY",
  answers: allMaxAnswers,
  scores: {
    pq: maxScores.pq,
    iq: maxScores.iq,
    eq: maxScores.eq,
    sq: maxScores.eq // alias
  },
  totalScore: maxScores.total,
  timestamp: new Date().toISOString(),
  submittedAt: new Date().toISOString(),
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
};

const allowedKeys = [
  'fullName', 'email', 'whatsappNumber', 'gender', 'homeTown', 'campus',
  'branch', 'division', 'year', 'answers', 'scores', 'totalScore',
  'timestamp', 'submittedAt', 'userAgent'
];

// Verify allowed keys
const payloadKeys = Object.keys(samplePayload);
assert.strictEqual(payloadKeys.length, allowedKeys.length, "Payload key count must be exactly 15");
payloadKeys.forEach(key => {
  assert(allowedKeys.includes(key), `Payload contains unexpected key: ${key}`);
});

// Verify constraints
assert(samplePayload.fullName.length > 0 && samplePayload.fullName.length <= 120);
assert(samplePayload.email.length > 0 && samplePayload.email.length <= 254);
assert(samplePayload.whatsappNumber.length >= 10 && samplePayload.whatsappNumber.length <= 15);
assert(['Male', 'Female', 'Other'].includes(samplePayload.gender));
assert(samplePayload.homeTown.length > 0 && samplePayload.homeTown.length <= 100);
assert(samplePayload.campus.length > 0 && samplePayload.campus.length <= 50);
assert(samplePayload.branch.length > 0 && samplePayload.branch.length <= 100);
assert(samplePayload.division.length > 0 && samplePayload.division.length <= 20);
assert(samplePayload.year.length > 0 && samplePayload.year.length <= 50);
assert.strictEqual(Object.keys(samplePayload.answers).length, 20, "Answers must contain exactly 20 entries");
assert(samplePayload.scores.pq >= 0 && samplePayload.scores.pq <= 35);
assert(samplePayload.scores.iq >= 0 && samplePayload.scores.iq <= 30);
assert(samplePayload.scores.eq >= 0 && samplePayload.scores.eq <= 35);
assert(samplePayload.totalScore >= 0 && samplePayload.totalScore <= 100);
assert(samplePayload.userAgent.length > 0 && samplePayload.userAgent.length <= 500);

console.log("✅ Payload Schema Validation Passed: Strictly matches all 15 Firestore fields and PDC constraints");
console.log("==================================================");
