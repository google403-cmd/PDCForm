const assert = require("assert");
const config = require("../js/content.js");

console.log("==================================================");
console.log("PDC (PERSONALITY DEVELOPMENT CLUB) ASSESSMENT VALIDATION SUITE");
console.log("==================================================");

// 1. Verify steps
assert(config.steps && Array.isArray(config.steps), "config.steps must be an array");
assert.strictEqual(config.steps.length, 4, "Must have exactly 4 steps (Profile, PQ, IQ, EQ)");

const [profileStep, pqStep, iqStep, eqStep] = config.steps;

// Profile Step Validation
assert(profileStep.isPersonalDetails, "Step 0 must be personal details");
const expectedFields = ["fullName", "whatsappNumber", "email", "gender", "homeTown", "branch", "campus", "division"];
assert.deepStrictEqual(profileStep.fields.map(field => field.name), [...expectedFields, "year"], "Profile fields must keep Campus immediately after Branch and Division separate");
expectedFields.forEach(f => {
  assert(profileStep.fields.some(field => field.name === f), `Profile must contain field ${f}`);
});

const campusField = profileStep.fields.find(field => field.name === "campus");
assert(campusField && campusField.type === "select", "Campus must be a select field");
assert.deepStrictEqual(campusField.options, ["Bibwewadi", "Kondhwa"], "Campus options must be exactly Bibwewadi and Kondhwa");

const divisionField = profileStep.fields.find(field => field.name === "division");
assert(divisionField && divisionField.type === "select", "Division must be a select field");
assert.deepStrictEqual(divisionField.options, ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "SEDA"], "Division options must match the required 13 choices");

const branchField = profileStep.fields.find(field => field.name === "branch");
assert(branchField && branchField.type === "select", "Branch must be a select field");
assert.deepStrictEqual(branchField.options, [
  "Question Type",
  "Computer Engineering",
  "Information Technology",
  "Electronics and Telecommunication Engineering",
  "Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
  "Computer Science and Engineering (Artificial Intelligence)",
  "Artificial Intelligence and Data Science",
  "Mechanical Engineering",
  "Chemical Engineering",
  "Instrumentation and Control Engineering",
  "Other"
], "Branch options must match the exact PDC list");

assert(config.club.logoPath.includes("pdc-logo") || config.club.logoPath.includes("pdclogo1"), "PDC logo must point to PDC asset");
assert.strictEqual(config.club.bannerPath, "Stories/PDC Banner.png", "PDC banner must use the Stories asset");
assert(config.whatsappLinks.COMMUNITY_URL, "PDC WhatsApp link must be configured");

const activityImages = (config.activities || config.resultPage?.activities || []).map(activity => activity.image);
assert.deepStrictEqual(activityImages, [
  "Stories/iitstw.png",
  "Stories/pdw.png",
  "Stories/mmc.png",
  "Stories/camps.png",
  "Stories/wisdom.png"
], "Activities must use the required PDC activity images");

// Section Steps Validation
assert.strictEqual(pqStep.dimension, "pq", "PQ step dimension must be 'pq'");
assert.strictEqual(iqStep.dimension, "iq", "IQ step dimension must be 'iq'");
assert(eqStep.dimension === "eq" || eqStep.dimension === "sq", "EQ step dimension must be 'eq'");

// Question Counts
assert.strictEqual(pqStep.questions.length, 7, "PQ section must have exactly 7 questions");
assert.strictEqual(iqStep.questions.length, 6, "IQ section must have exactly 6 questions");
assert.strictEqual(eqStep.questions.length, 7, "EQ section must have exactly 7 questions");

const allQuestions = [...pqStep.questions, ...iqStep.questions, ...eqStep.questions];
assert.strictEqual(allQuestions.length, 20, "Total question count must be exactly 20");

// Expected IDs
const expectedPQIds = ["PQ1", "PQ2", "PQ3", "PQ4", "PQ5", "PQ8", "PQ10"];
const actualPQIds = pqStep.questions.map(q => q.id);
assert.deepStrictEqual(actualPQIds, expectedPQIds, "PQ question IDs must match specification exactly");

const expectedIQIds = ["IQ1", "IQ2", "IQ3", "IQ4", "IQ7", "IQ9"];
const actualIQIds = iqStep.questions.map(q => q.id);
assert.deepStrictEqual(actualIQIds, expectedIQIds, "IQ question IDs must match specification exactly");

const expectedEQIds = ["EQ1", "EQ2", "EQ4", "EQ5", "EQ6", "EQ8", "EQ9"];
const actualEQIds = eqStep.questions.map(q => q.id);
assert.deepStrictEqual(actualEQIds, expectedEQIds, "EQ question IDs must match specification exactly");

// Every question has exactly 5 options with unique IDs ['A', 'B', 'C', 'D', 'E'] and valid marks
let maxPQ = 0, minPQ = 0;
let maxIQ = 0, minIQ = 0;
let maxEQ = 0, minEQ = 0;

allQuestions.forEach((q) => {
  assert.strictEqual(q.options.length, 5, `Question ${q.id} must have exactly 5 options`);
  const optIds = q.options.map(o => o.id);
  assert.deepStrictEqual(optIds, ["A", "B", "C", "D", "E"], `Question ${q.id} option IDs must be A, B, C, D, E`);

  // Unique option texts
  const optTexts = q.options.map(o => o.text.trim());
  const uniqueTexts = new Set(optTexts);
  assert.strictEqual(uniqueTexts.size, 5, `Question ${q.id} options must all be unique text`);

  // Check marks
  const marks = q.options.map(o => o.marks);
  marks.forEach(m => {
    assert(typeof m === "number" && !isNaN(m), `Question ${q.id} marks must be a number`);
    assert(m >= 2.5 && m <= 5.0, `Question ${q.id} marks must be between 2.5 and 5.0`);
  });

  const maxQ = Math.max(...marks);
  const minQ = Math.min(...marks);
  assert.strictEqual(maxQ, 5, `Question ${q.id} maximum marks must be 5`);

  if (q.section === "PQ") {
    maxPQ += maxQ;
    minPQ += minQ;
  } else if (q.section === "IQ") {
    maxIQ += maxQ;
    minIQ += minQ;
  } else if (q.section === "EQ" || q.section === "SQ") {
    maxEQ += maxQ;
    minEQ += minQ;
  }
});

// Validate IQ9
const iq9 = iqStep.questions.find(q => q.id === "IQ9");
assert(iq9, "IQ9 must exist");
const iq9Texts = iq9.options.map(o => o.text);
assert.notStrictEqual(iq9Texts[0], iq9Texts[1], "IQ9 option A and B must NOT be identical");
assert.strictEqual(iq9.options.find(o => o.id === "B").text, "NJOE", "IQ9 option B must be NJOE");
assert.strictEqual(iq9.options.find(o => o.id === "B").marks, 5, "IQ9 option B must have 5 marks");
assert.strictEqual(iq9.options.find(o => o.id === "A").marks, 3, "IQ9 option A must have 3 marks");

// Maximum scores
console.log(`Calculated Max PQ: ${maxPQ} (Expected: 35)`);
console.log(`Calculated Max IQ: ${maxIQ} (Expected: 30)`);
console.log(`Calculated Max EQ: ${maxEQ} (Expected: 35)`);
console.log(`Calculated Total Max: ${maxPQ + maxIQ + maxEQ} (Expected: 100)`);

assert.strictEqual(maxPQ, 35, "Maximum PQ score must be 35");
assert.strictEqual(maxIQ, 30, "Maximum IQ score must be 30");
assert.strictEqual(maxEQ, 35, "Maximum EQ score must be 35");
assert.strictEqual(maxPQ + maxIQ + maxEQ, 100, "Maximum total score must be 100");

// Minimum scores
console.log(`Calculated Min PQ: ${minPQ} (Expected: 17.5)`);
console.log(`Calculated Min IQ: ${minIQ} (Expected: 15)`);
console.log(`Calculated Min EQ: ${minEQ} (Expected: 17.5)`);
console.log(`Calculated Total Min: ${minPQ + minIQ + minEQ} (Expected: 50)`);

assert.strictEqual(minPQ, 17.5, "Minimum PQ score must be 17.5");
assert.strictEqual(minIQ, 15, "Minimum IQ score must be 15");
assert.strictEqual(minEQ, 17.5, "Minimum EQ score must be 17.5");
assert.strictEqual(minPQ + minIQ + minEQ, 50, "Minimum total score must be 50");

console.log("--------------------------------------------------");
console.log("✅ ALL 20-QUESTION PDC VALIDATION CHECKS PASSED!");
console.log("==================================================");
