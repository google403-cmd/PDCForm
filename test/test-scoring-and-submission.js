const assert = require("assert");
const config = require("../js/content.js");
const engine = config.engine || (typeof window !== "undefined" ? window.PDCAssessmentEngine : null);

console.log("==================================================");
console.log("TESTING PDC SCORING ENGINE & SUBMISSION PAYLOAD");
console.log("==================================================");

assert(engine, "PDCAssessmentEngine must be available");

// -------------------------------------------------------------
// Test Case 1: IQ Perfect Score (All 6 Correct)
// -------------------------------------------------------------
const perfectIQAnswers = {
  IQ1: "D",
  IQ2: "B",
  IQ3: "D",
  IQ5: "C",
  IQ7: "C",
  IQ9: "B"
};

const cognitivePerfect = engine.calculateCognitiveProfile(perfectIQAnswers);
console.log("Test 1 - Perfect IQ Performance:", cognitivePerfect);
assert.strictEqual(cognitivePerfect.correctAnswers, 6, "Correct answers must be 6");
assert.strictEqual(cognitivePerfect.totalMarks, 30, "Total marks must be 30");
assert.strictEqual(cognitivePerfect.percentage, 100, "Percentage must be 100");
assert.strictEqual(cognitivePerfect.performanceText, "IQ Performance: 6 / 6");
console.log("✅ Test 1 Passed: Perfect IQ = 30 marks (6/6, 100%)");

// -------------------------------------------------------------
// Test Case 2: IQ Zero Score (All Incorrect)
// -------------------------------------------------------------
const zeroIQAnswers = {
  IQ1: "A",
  IQ2: "A",
  IQ3: "A",
  IQ5: "A",
  IQ7: "A",
  IQ9: "A"
};

const cognitiveZero = engine.calculateCognitiveProfile(zeroIQAnswers);
console.log("Test 2 - Zero IQ Performance:", cognitiveZero);
assert.strictEqual(cognitiveZero.correctAnswers, 0, "Correct answers must be 0");
assert.strictEqual(cognitiveZero.totalMarks, 0, "Total marks must be 0");
assert.strictEqual(cognitiveZero.percentage, 0, "Percentage must be 0");
assert.strictEqual(cognitiveZero.performanceText, "IQ Performance: 0 / 6");
assert.strictEqual(cognitiveZero.label, "Developing Analytical Thinker");
console.log("✅ Test 2 Passed: Zero IQ = 0 marks (0/6, 0%) Developing Analytical Thinker");

// -------------------------------------------------------------
// Test Case 3: Personality Dimensions Normalization (0–100)
// -------------------------------------------------------------
// Select highest options for RG & AR:
// PQ1: A (RG4, ER3, AR4)
// PQ2: B (RG4, AP3)
// PQ3: C (ER4, IA4)
// PQ5: D (ER3, AP4)
// PQ7: D (ER4, IA4)
// PQ8: B (IA4, AR4)
// PQ10: E (ER3, IA4)
const highLeadershipAnswers = {
  PQ1: "A",
  PQ2: "B",
  PQ3: "C",
  PQ5: "D",
  PQ7: "D",
  PQ8: "B",
  PQ10: "E"
};

const pDimsHigh = engine.calculatePersonalityDimensions(highLeadershipAnswers);
console.log("Test 3 - High Leadership Dimensions:", pDimsHigh.scores);
Object.entries(pDimsHigh.scores).forEach(([dim, val]) => {
  assert(val >= 0 && val <= 100, `Dimension ${dim} score ${val} must be between 0 and 100`);
});

const pProfilesHigh = engine.calculatePersonalityProfiles(pDimsHigh.scores);
console.log("Test 3 - Profiles:", {
  primary: pProfilesHigh.primaryProfile.name,
  fit1: pProfilesHigh.primaryProfile.fit,
  secondary: pProfilesHigh.secondaryProfile.name,
  fit2: pProfilesHigh.secondaryProfile.fit
});
assert(pProfilesHigh.primaryProfile, "Primary profile must exist");
assert(pProfilesHigh.secondaryProfile, "Secondary profile must exist");
assert.notStrictEqual(pProfilesHigh.primaryProfile.id, pProfilesHigh.secondaryProfile.id, "Primary and secondary profiles must be distinct");
console.log("✅ Test 3 Passed: Personality dimensions normalized to 0-100 and distinct profiles calculated");

// -------------------------------------------------------------
// Test Case 4: Spiritual Dimensions and Personalized Suggestions
// -------------------------------------------------------------
// Select responses with high Spiritual Application (SA) but low Higher Power Awareness (HP)
// SQ1: A (SE3 PE4 HP2 GR1 SA4)
// SQ2: B (SE2 PE3 HP2 GR2 SA4)
// SQ4: D (SE3 PE3 HP3 GR5 SA5)
// SQ5: E (SE4 PE5 HP3 GR3 SA5)
// SQ6: B (SE4 PE4 HP2 GR2 SA5)
// SQ7: A (SE5 PE4 HP3 GR2 SA5)
// SQ9: E (SE3 PE5 HP4 GR4 SA5)
const deepSpiritualAnswers = {
  SQ1: "A",
  SQ2: "B",
  SQ4: "D",
  SQ5: "E",
  SQ6: "B",
  SQ7: "A",
  SQ9: "E"
};

const spiritualResult = engine.calculateSpiritualProfile(deepSpiritualAnswers);
console.log("Test 4 - Spiritual Profile Result:", {
  level: spiritualResult.level,
  score: spiritualResult.overallScore,
  weakest: spiritualResult.weakestDimension,
  suggestion: spiritualResult.personalizedSuggestion
});

assert.strictEqual(spiritualResult.level, "Deep Spiritual Orientation", "Should have Deep Spiritual Orientation");
assert(spiritualResult.explanationParagraph.includes("self") || spiritualResult.explanationParagraph.includes("God"), "Spiritual explanation must cover spiritual concepts");
assert(spiritualResult.personalizedSuggestion.length > 20, "Personalized suggestion must be substantial");
console.log("✅ Test 4 Passed: Deep Spiritual Orientation with personalized suggestion");

// -------------------------------------------------------------
// Test Case 5: Master Assessment Evaluation (Full 20 Questions)
// -------------------------------------------------------------
const fullAnswers = {
  ...highLeadershipAnswers,
  ...perfectIQAnswers,
  ...deepSpiritualAnswers
};

const fullEvaluation = engine.evaluateAssessment(fullAnswers);
console.log("Test 5 - Full Evaluation Report Structure:");
console.log("1. Primary Profile:", fullEvaluation.report.primaryProfile.name);
console.log("2. Secondary Profile:", fullEvaluation.report.secondaryProfile.name);
console.log("3. Cognitive Profile:", fullEvaluation.report.cognitiveProfile.label, `(${fullEvaluation.report.cognitiveProfile.performanceText})`);
console.log("4. Spiritual Profile:", fullEvaluation.report.spiritualProfile.name);
console.log("5. Strengths Count:", fullEvaluation.report.strengths.length);
console.log("6. Development Areas Count:", fullEvaluation.report.developmentAreas.length);
console.log("7. Overall Synthesis Length:", fullEvaluation.report.overallSynthesis.length);

// 1. Primary Profile
assert(fullEvaluation.report.primaryProfile.name, "Primary profile name required");
assert(fullEvaluation.report.primaryProfile.description, "Primary profile description required");

// 2. Secondary Profile
assert(fullEvaluation.report.secondaryProfile.name, "Secondary profile name required");
assert(fullEvaluation.report.secondaryProfile.description, "Secondary profile description required");

// 3. Cognitive Profile
assert(fullEvaluation.report.cognitiveProfile.label, "Cognitive label required");
assert(fullEvaluation.report.cognitiveProfile.performanceText, "Cognitive performance text required");

// 4. Spiritual Profile
assert.strictEqual(fullEvaluation.report.spiritualProfile.sectionTitle, "Spiritual Profile", "Section title must be 'Spiritual Profile'");
assert(fullEvaluation.report.spiritualProfile.name, "Spiritual profile name required");
assert(fullEvaluation.report.spiritualProfile.explanationParagraph, "Spiritual explanation paragraph required");
assert(fullEvaluation.report.spiritualProfile.personalizedSuggestion, "Personalized suggestion required");

// 5. Strengths (4–5 items, format: title, 1-2 sentences, 'PDC can strengthen this:')
assert(fullEvaluation.report.strengths.length >= 4 && fullEvaluation.report.strengths.length <= 5, "Must have 4-5 strengths");
fullEvaluation.report.strengths.forEach((s, idx) => {
  assert(s.title, `Strength ${idx} must have title`);
  assert(s.description, `Strength ${idx} must have description`);
  assert(s.pdcStrengthen.includes("PDC can strengthen this:"), `Strength ${idx} must contain 'PDC can strengthen this:'`);
});

// 6. Development Areas (2–3 items, format: title, 1-2 sentences, 'PDC can help:')
assert(fullEvaluation.report.developmentAreas.length >= 2 && fullEvaluation.report.developmentAreas.length <= 3, "Must have 2-3 development areas");
fullEvaluation.report.developmentAreas.forEach((d, idx) => {
  assert(d.title, `Development Area ${idx} must have title`);
  assert(d.description, `Development Area ${idx} must have description`);
  assert(d.pdcHelp.includes("PDC can help:"), `Development Area ${idx} must contain 'PDC can help:'`);
});

// 7. Overall Profile Synthesis
assert(fullEvaluation.report.overallSynthesis && fullEvaluation.report.overallSynthesis.length > 50, "Overall profile synthesis must be complete");
console.log("✅ Test 5 Passed: All 7 Report sections follow specification exactly");

// -------------------------------------------------------------
// Test Case 6: Firestore Payload Validation
// -------------------------------------------------------------
const sampleSubmissionPayload = {
  fullName: "Aarav Sharma",
  mobile: "9876543210",
  whatsappNumber: "9876543210",
  email: "aarav.sharma@vit.edu",
  campus: "Bibwewadi",
  year: "FY",
  branch: "Computer Engineering",
  division: "A",
  gender: "Male",
  homeTown: "Pune",
  answers: fullAnswers,
  answersByQuestion: fullAnswers,
  questionIds: Object.keys(fullAnswers),
  selectedOptionIds: fullAnswers,
  scores: {
    pq: fullEvaluation.scores.pq,
    iq: fullEvaluation.scores.iq,
    sq: fullEvaluation.scores.sq,
    eq: fullEvaluation.scores.eq,
    personalityDimensions: fullEvaluation.personalityDimensions,
    spiritualDimensions: fullEvaluation.spiritualDimensions,
    primaryProfile: fullEvaluation.primaryProfile,
    secondaryProfile: fullEvaluation.secondaryProfile,
    cognitiveScore: fullEvaluation.cognitiveScore,
    cognitiveProfile: fullEvaluation.cognitiveProfile,
    spiritualProfile: fullEvaluation.spiritualProfile,
    report: fullEvaluation.report
  },
  totalScore: fullEvaluation.totalScore,
  personalityDimensions: fullEvaluation.personalityDimensions,
  primaryProfile: fullEvaluation.primaryProfile,
  secondaryProfile: fullEvaluation.secondaryProfile,
  cognitiveScore: fullEvaluation.cognitiveScore,
  cognitiveProfile: fullEvaluation.cognitiveProfile,
  spiritualDimensions: fullEvaluation.spiritualDimensions,
  spiritualProfile: fullEvaluation.spiritualProfile,
  report: fullEvaluation.report,
  timestamp: new Date().toISOString(),
  submittedAt: new Date().toISOString(),
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
};

// Validate required fields exist
assert(sampleSubmissionPayload.fullName);
assert(sampleSubmissionPayload.campus === "Bibwewadi" || sampleSubmissionPayload.campus === "Kondhwa");
assert.strictEqual(Object.keys(sampleSubmissionPayload.answers).length, 20, "Must contain exactly 20 answers");
assert(sampleSubmissionPayload.scores.pq <= 35, "Legacy PQ score must be <= 35");
assert(sampleSubmissionPayload.scores.iq <= 30, "Legacy IQ score must be <= 30");
assert(sampleSubmissionPayload.scores.sq <= 35, "Legacy SQ score must be <= 35");
assert(sampleSubmissionPayload.totalScore <= 100, "Legacy Total score must be <= 100");

// Check strict 15-key fallback extraction for older Firestore rule compatibility
const allowedStrict15Keys = [
  'fullName', 'email', 'whatsappNumber', 'gender', 'homeTown', 'campus',
  'branch', 'division', 'year', 'answers', 'scores', 'totalScore',
  'timestamp', 'submittedAt', 'userAgent'
];

const strict15Payload = {};
allowedStrict15Keys.forEach(k => {
  if (sampleSubmissionPayload[k] !== undefined) {
    strict15Payload[k] = sampleSubmissionPayload[k];
  }
});

assert.strictEqual(Object.keys(strict15Payload).length, 15, "Strict 15 fallback payload must contain exactly 15 keys");
// Ensure that the extended evaluation data is preserved inside scores in the fallback payload
assert(strict15Payload.scores.primaryProfile, "Primary profile preserved in fallback payload");
assert(strict15Payload.scores.spiritualProfile, "Spiritual profile preserved in fallback payload");
assert(strict15Payload.scores.report, "Full report preserved in fallback payload");

console.log("✅ Test 6 Passed: Firestore Submission Payload safely formatted with full report & legacy fallback");

// -------------------------------------------------------------
// Section 20: Mandatory Test Cases A, B, C, D, E
// -------------------------------------------------------------
console.log("\n--- Running Section 20 Mandatory Test Cases A-E ---");

// Test Case A: Mostly growth/accountability-oriented answers
const testCaseA = {
  PQ1: "A", PQ2: "C", PQ3: "D", PQ5: "B", PQ7: "C", PQ8: "B", PQ10: "D",
  IQ1: "D", IQ2: "B", IQ3: "D", IQ5: "C", IQ7: "C", IQ9: "B",
  SQ1: "A", SQ2: "B", SQ4: "D", SQ5: "E", SQ6: "B", SQ7: "A", SQ9: "E"
};
const evalCaseA = engine.evaluateAssessment(testCaseA);
console.log("Test Case A Profiles:", {
  primary: evalCaseA.primaryProfile.name,
  secondary: evalCaseA.secondaryProfile.name
});
const validNamesA = ["Reflective Achiever", "Responsible Leader"];
assert(
  validNamesA.includes(evalCaseA.primaryProfile.name) && validNamesA.includes(evalCaseA.secondaryProfile.name),
  "Test Case A expected tendency: Reflective Achiever / Responsible Leader combination"
);
console.log("✅ Test Case A Passed: Reflective Achiever / Responsible Leader combination");

// Test Case B: Mostly adaptability/resilience-oriented answers
const testCaseB = {
  PQ1: "A", PQ2: "B", PQ3: "D", PQ5: "A", PQ7: "A", PQ8: "C", PQ10: "A",
  IQ1: "A", IQ2: "B", IQ3: "A", IQ5: "C", IQ7: "A", IQ9: "B",
  SQ1: "C", SQ2: "A", SQ4: "A", SQ5: "D", SQ6: "C", SQ7: "B", SQ9: "A"
};
const evalCaseB = engine.evaluateAssessment(testCaseB);
console.log("Test Case B Profiles:", {
  primary: evalCaseB.primaryProfile.name,
  secondary: evalCaseB.secondaryProfile.name
});
const validNamesB = ["Adaptive Problem Solver", "Resilient Builder"];
assert(
  validNamesB.includes(evalCaseB.primaryProfile.name) && validNamesB.includes(evalCaseB.secondaryProfile.name),
  "Test Case B expected tendency: Adaptive Problem Solver / Resilient Builder combination"
);
console.log("✅ Test Case B Passed: Adaptive Problem Solver / Resilient Builder combination");

// Test Case C: Mostly empathy/interpersonal-oriented answers
const testCaseC = {
  PQ1: "C", PQ2: "C", PQ3: "C", PQ5: "D", PQ7: "D", PQ8: "B", PQ10: "E",
  IQ1: "D", IQ2: "A", IQ3: "D", IQ5: "A", IQ7: "C", IQ9: "A",
  SQ1: "B", SQ2: "B", SQ4: "D", SQ5: "D", SQ6: "B", SQ7: "A", SQ9: "E"
};
const evalCaseC = engine.evaluateAssessment(testCaseC);
console.log("Test Case C Profiles:", {
  primary: evalCaseC.primaryProfile.name,
  secondary: evalCaseC.secondaryProfile.name
});
const validNamesC = ["Empathetic Harmonizer", "Compassionate Thinker"];
assert(
  validNamesC.includes(evalCaseC.primaryProfile.name) && validNamesC.includes(evalCaseC.secondaryProfile.name),
  "Test Case C expected tendency: Empathetic Harmonizer / Compassionate Thinker combination"
);
console.log("✅ Test Case C Passed: Empathetic Harmonizer / Compassionate Thinker combination");

// Test Case D: Strong purpose/spiritual responses
const testCaseD = {
  PQ1: "C", PQ2: "C", PQ3: "D", PQ5: "D", PQ7: "C", PQ8: "B", PQ10: "D",
  IQ1: "D", IQ2: "B", IQ3: "D", IQ5: "C", IQ7: "C", IQ9: "B",
  SQ1: "A", SQ2: "B", SQ4: "D", SQ5: "E", SQ6: "B", SQ7: "A", SQ9: "E"
};
const evalCaseD = engine.evaluateAssessment(testCaseD);
console.log("Test Case D Spiritual Dimensions:", evalCaseD.spiritualDimensions);
assert(evalCaseD.spiritualDimensions.PE >= 90, "Purpose of Existence dimension must be high (>=90%)");
assert(evalCaseD.spiritualDimensions.SA >= 90, "Spiritual Application dimension must be high (>=90%)");
assert.strictEqual(evalCaseD.spiritualProfile.level, "Deep Spiritual Orientation");
console.log("✅ Test Case D Passed: High Purpose of Existence (PE) and Spiritual Application (SA) dimensions");

// Test Case E: Mixed responses
const testCaseE = {
  PQ1: "B", PQ2: "E", PQ3: "B", PQ5: "C", PQ7: "E", PQ8: "D", PQ10: "B",
  IQ1: "A", IQ2: "A", IQ3: "A", IQ5: "A", IQ7: "A", IQ9: "A",
  SQ1: "D", SQ2: "D", SQ4: "B", SQ5: "B", SQ6: "D", SQ7: "C", SQ9: "C"
};
const evalCaseE = engine.evaluateAssessment(testCaseE);
assert(evalCaseE.primaryProfile && evalCaseE.primaryProfile.name, "Test Case E must generate primary profile without crashing");
assert(evalCaseE.secondaryProfile && evalCaseE.secondaryProfile.name, "Test Case E must generate secondary profile without crashing");
assert(evalCaseE.cognitiveProfile && evalCaseE.cognitiveProfile.label, "Test Case E must generate cognitive profile without crashing");
assert(evalCaseE.spiritualProfile && evalCaseE.spiritualProfile.level, "Test Case E must generate spiritual profile without crashing");
assert(evalCaseE.report && evalCaseE.report.strengths.length >= 4, "Test Case E must generate strengths");
assert(evalCaseE.report && evalCaseE.report.developmentAreas.length >= 2, "Test Case E must generate development areas");
console.log("✅ Test Case E Passed: Mixed responses generated all profiles without crashes");

console.log("==================================================");
console.log("ALL SCORING AND SUBMISSION TESTS PASSED SUCCESSFULLY!");
console.log("==================================================");
