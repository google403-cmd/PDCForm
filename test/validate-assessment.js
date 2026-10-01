const assert = require("assert");
const config = require("../js/content.js");

console.log("==================================================");
console.log("PDC ASSESSMENT & REPORT VALIDATION SUITE");
console.log("==================================================");

// 1. Verify steps
assert(config.steps && Array.isArray(config.steps), "config.steps must be an array");
assert(config.steps.length === 5, "Must have exactly 5 steps (Profile, PQ, IQ, SQ, Community)");

const [profileStep, pqStep, iqStep, sqStep, communityStep] = config.steps;
assert(communityStep && communityStep.isCommunityStep, "5th step must be community step");

// Profile Step Validation: Campus field removed, campus derived from branch
assert(profileStep.isPersonalDetails, "Step 0 must be personal details");
const expectedFields = ["fullName", "whatsappNumber", "email", "gender", "homeTown", "branch", "division"];
assert.deepStrictEqual(profileStep.fields.map(field => field.name), [...expectedFields, "year"], "Profile fields must not include campus; campus is derived from branch");
expectedFields.forEach(f => {
  assert(profileStep.fields.some(field => field.name === f), `Profile must contain field ${f}`);
});

// Ensure campus field is completely removed from personal details
const campusField = profileStep.fields.find(field => field.name === "campus");
assert.strictEqual(campusField, undefined, "Campus field must be removed from student registration");

const divisionField = profileStep.fields.find(field => field.name === "division");
assert(divisionField && divisionField.type === "select", "Division must be a select field");
assert.deepStrictEqual(divisionField.options, ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "SEDA"], "Division options must match the required 13 choices");

const branchField = profileStep.fields.find(field => field.name === "branch");
assert(branchField && branchField.type === "select", "Branch must be a select field");
assert.deepStrictEqual(branchField.options, [
  "Computer Engineering",
  "Information Technology",
  "CSE (Artificial Intelligence)",
  "CSE (Artificial Intelligence & Machine Learning)"
], "Registration branch options must match official Bibwewadi branches");

// Central Branch-to-Campus Mapping Validation
const mapping = config.campusMapping;
assert(mapping, "config.campusMapping must exist");
assert.strictEqual(mapping.BIBWEWADI_BRANCHES.length, 4, "Must have exactly 4 Bibwewadi branches");
assert.strictEqual(mapping.KONDHWA_BRANCHES.length, 8, "Must have exactly 8 Kondhwa branches");
assert.strictEqual(Object.keys(mapping.BRANCH_CAMPUS_MAP).length, 12, "Total branches must be exactly 12");
assert.strictEqual(mapping.KONDHWA_WEBSITE_URL, "https://c-cube-vit-pune.vercel.app/", "Kondhwa URL must be C-Cube home page");

// Validate all 12 branches via getCampusFromBranch helper
mapping.BIBWEWADI_BRANCHES.forEach(b => {
  assert.strictEqual(config.getCampusFromBranch(b), "Bibwewadi", `${b} must map to Bibwewadi`);
});
mapping.KONDHWA_BRANCHES.forEach(b => {
  assert.strictEqual(config.getCampusFromBranch(b), "Kondhwa", `${b} must map to Kondhwa`);
});
assert.strictEqual(config.getCampusFromBranch("Unknown Random Branch"), null, "Unknown branch must return null");
assert.strictEqual(config.getCampusFromBranch(""), null, "Empty branch must return null");

// Brand & Activity Validation
assert(config.club.logoPath.includes("pdc-logo") || config.club.logoPath.includes("pdclogo1"), "PDC logo must point to PDC asset");
assert.strictEqual(config.club.bannerPath, "Stories/PDC Banner.png", "PDC banner must use the Stories asset");
assert(config.whatsappLinks.COMMUNITY_URL, "PDC WhatsApp link must be configured");
assert.strictEqual(config.whatsappLinks.BOYS_WHATSAPP_LINK, "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl", "Boys must use the boys WhatsApp group");
assert.strictEqual(config.whatsappLinks.GIRLS_WHATSAPP_LINK, "https://chat.whatsapp.com/K26ctdpLyC85tutbp93kxu", "Girls must use the girls WhatsApp group");
assert.strictEqual(config.getWhatsAppCommunityLink("Male"), config.whatsappLinks.BOYS_WHATSAPP_LINK, "Male students must resolve to the boys group");
assert.strictEqual(config.getWhatsAppCommunityLink("Female"), config.whatsappLinks.GIRLS_WHATSAPP_LINK, "Female students must resolve to the girls group");

const activityImages = (config.activities || config.resultPage?.activities || []).map(activity => activity.image);
assert.deepStrictEqual(activityImages, [
  "Stories/iitstw.png",
  "Stories/pdw.png",
  "Stories/mmc.png",
  "Stories/camps.png",
  "Stories/wisdom.png"
], "Activities must use the required PDC activity images");

// Section Dimension Validation
assert.strictEqual(pqStep.dimension, "pq", "PQ step dimension must be 'pq'");
assert.strictEqual(iqStep.dimension, "iq", "IQ step dimension must be 'iq'");
assert(sqStep.dimension === "sq" || sqStep.dimension === "eq", "SQ step dimension must be 'sq' or 'eq'");

// Question Counts: exactly 7 PQ, 6 IQ, 7 SQ = 20 questions
assert.strictEqual(pqStep.questions.length, 7, "PQ section must have exactly 7 questions");
assert.strictEqual(iqStep.questions.length, 6, "IQ section must have exactly 6 questions");
assert.strictEqual(sqStep.questions.length, 7, "SQ section must have exactly 7 questions");

const allQuestions = [...pqStep.questions, ...iqStep.questions, ...sqStep.questions];
assert.strictEqual(allQuestions.length, 20, "Total question count must be exactly 20");

// Question IDs
const expectedPQIds = ["PQ1", "PQ2", "PQ3", "PQ5", "PQ7", "PQ8", "PQ10"];
const actualPQIds = pqStep.questions.map(q => q.id);
assert.deepStrictEqual(actualPQIds, expectedPQIds, "PQ question IDs must be PQ1, PQ2, PQ3, PQ5, PQ7, PQ8, PQ10");

const expectedIQIds = ["IQ1", "IQ2", "IQ3", "IQ5", "IQ7", "IQ9"];
const actualIQIds = iqStep.questions.map(q => q.id);
assert.deepStrictEqual(actualIQIds, expectedIQIds, "IQ question IDs must be IQ1, IQ2, IQ3, IQ5, IQ7, IQ9");

const expectedSQIds = ["SQ1", "SQ2", "SQ4", "SQ5", "SQ6", "SQ7", "SQ9"];
const actualSQIds = sqStep.questions.map(q => q.id);
assert.deepStrictEqual(actualSQIds, expectedSQIds, "SQ question IDs must be SQ1, SQ2, SQ4, SQ5, SQ6, SQ7, SQ9");

// Every question has exactly 5 options A-E with unique text
allQuestions.forEach(q => {
  assert.strictEqual(q.options.length, 5, `Question ${q.id} must have exactly 5 options`);
  const optIds = q.options.map(o => o.id);
  assert.deepStrictEqual(optIds, ["A", "B", "C", "D", "E"], `Question ${q.id} options must be A, B, C, D, E`);

  const optTexts = q.options.map(o => o.text.trim());
  const uniqueTexts = new Set(optTexts);
  assert.strictEqual(uniqueTexts.size, 5, `Question ${q.id} options must all have unique text`);
});

// IQ Specific Validation
const expectedIQAnswers = {
  IQ1: "D",
  IQ2: "B",
  IQ3: "D",
  IQ5: "C",
  IQ7: "C",
  IQ9: "B"
};

let iqMaxScore = 0;
iqStep.questions.forEach(q => {
  const expectedCorrect = expectedIQAnswers[q.id];
  assert(expectedCorrect, `IQ question ${q.id} must have expected correct answer`);
  assert.strictEqual(q.correctAnswer, expectedCorrect, `IQ question ${q.id} correctAnswer must be ${expectedCorrect}`);

  q.options.forEach(opt => {
    if (opt.id === expectedCorrect) {
      assert.strictEqual(opt.marks, 5, `IQ question ${q.id} option ${opt.id} must have 5 marks`);
    } else {
      assert.strictEqual(opt.marks, 0, `IQ question ${q.id} option ${opt.id} must have 0 marks`);
    }
  });

  const maxQ = Math.max(...q.options.map(o => o.marks));
  assert.strictEqual(maxQ, 5, `Question ${q.id} max mark must be 5`);
  iqMaxScore += maxQ;
});
assert.strictEqual(iqMaxScore, 30, "IQ maximum score must be exactly 30 (6 questions x 5 marks)");

// Validate IQ9 Option A is NJPE and Option B is NJOE
const iq9 = iqStep.questions.find(q => q.id === "IQ9");
assert(iq9, "IQ9 must exist");
const iq9OptA = iq9.options.find(o => o.id === "A");
const iq9OptB = iq9.options.find(o => o.id === "B");
assert.strictEqual(iq9OptA.text, "NJPE", "IQ9 option A must be NJPE");
assert.strictEqual(iq9OptB.text, "NJOE", "IQ9 option B must be NJOE");
assert.notStrictEqual(iq9OptA.text, iq9OptB.text, "IQ9 option A and B must NOT be identical");

// Personality Dimension Mappings Validation
const validPDims = ["RG", "ER", "IA", "AR", "AP", "PS"];
pqStep.questions.forEach(q => {
  q.options.forEach(opt => {
    assert(opt.personalityPoints !== undefined, `PQ option ${q.id}-${opt.id} must have personalityPoints object`);
    Object.keys(opt.personalityPoints).forEach(dim => {
      assert(validPDims.includes(dim), `Invalid personality dimension: ${dim}`);
      assert(typeof opt.personalityPoints[dim] === "number", `Points for ${dim} must be number`);
    });
  });
});

// Spiritual Dimension Mappings Validation
const validSDims = ["SE", "PE", "HP", "GR", "SA"];
sqStep.questions.forEach(q => {
  q.options.forEach(opt => {
    assert(opt.spiritualPoints !== undefined, `SQ option ${q.id}-${opt.id} must have spiritualPoints object`);
    Object.keys(opt.spiritualPoints).forEach(dim => {
      assert(validSDims.includes(dim), `Invalid spiritual dimension: ${dim}`);
      assert(typeof opt.spiritualPoints[dim] === "number", `Points for ${dim} must be number`);
    });
  });
});

// Personality Profiles (8 Custom PDC Profiles)
const expectedProfileIds = [
  "reflective_achiever",
  "resilient_builder",
  "empathetic_harmonizer",
  "responsible_leader",
  "purpose_driven_thinker",
  "adaptive_problem_solver",
  "compassionate_thinker",
  "strategic_achiever"
];

assert(config.personalityProfiles, "config.personalityProfiles must exist");
const profileList = Array.isArray(config.personalityProfiles)
  ? config.personalityProfiles
  : Object.values(config.personalityProfiles);
assert.strictEqual(profileList.length, 8, "Must have exactly 8 personality profiles");

expectedProfileIds.forEach(id => {
  const profile = Array.isArray(config.personalityProfiles)
    ? config.personalityProfiles.find(p => p.id === id)
    : config.personalityProfiles[id];
  assert(profile, `Profile ${id} must exist`);
  assert(profile.name, `Profile ${id} must have name`);
  assert(profile.description, `Profile ${id} must have description`);
  assert(profile.weights, `Profile ${id} must have weights`);

  const weightSum = Object.values(profile.weights).reduce((a, b) => a + b, 0);
  assert.strictEqual(weightSum, 100, `Profile ${id} weights must sum to exactly 100% (got ${weightSum})`);
});

// Cognitive Profiles (5 Custom Profiles)
const expectedCognitiveLabels = [
  "Analytical & Pattern-Oriented Thinker",
  "Logical Problem Solver",
  "Quantitative Reasoner",
  "Balanced Analytical Thinker",
  "Developing Analytical Thinker"
];
assert(config.cognitiveProfiles, "config.cognitiveProfiles must exist");
const cognitiveList = Array.isArray(config.cognitiveProfiles)
  ? config.cognitiveProfiles
  : Object.values(config.cognitiveProfiles);
expectedCognitiveLabels.forEach(label => {
  assert(cognitiveList.some(cp => (cp.label === label || cp.name === label)), `Cognitive profile '${label}' must exist`);
});

// Spiritual Profiles (5 Custom Levels)
const expectedSpiritualLevels = [
  "Deep Spiritual Orientation",
  "Purposeful Spiritual Orientation",
  "Developing Spiritual Understanding",
  "Beginning Spiritual Exploration",
  "Open to Spiritual Exploration"
];
assert(config.spiritualProfiles, "config.spiritualProfiles must exist");
const spiritualList = Array.isArray(config.spiritualProfiles)
  ? config.spiritualProfiles
  : Object.values(config.spiritualProfiles);
expectedSpiritualLevels.forEach(level => {
  assert(spiritualList.some(sp => (sp.level === level || sp.name === level)), `Spiritual profile '${level}' must exist`);
});

// Engine Validation
const engine = config.engine || (typeof window !== "undefined" ? window.PDCAssessmentEngine : null);
assert(engine, "PDCAssessmentEngine must be exported on config.engine");
assert(typeof engine.calculatePersonalityDimensions === "function", "calculatePersonalityDimensions must be function");
assert(typeof engine.calculatePersonalityProfiles === "function", "calculatePersonalityProfiles must be function");
assert(typeof engine.calculateCognitiveProfile === "function", "calculateCognitiveProfile must be function");
assert(typeof engine.calculateSpiritualProfile === "function", "calculateSpiritualProfile must be function");
assert(typeof engine.evaluateAssessment === "function", "evaluateAssessment must be function");

// Verify profiles are always generated for any responses
const sampleEval = engine.evaluateAssessment({});
assert(sampleEval.primaryProfile && sampleEval.primaryProfile.name, "Primary profile must always be generated");
assert(sampleEval.secondaryProfile && sampleEval.secondaryProfile.name, "Secondary profile must always be generated");
assert(sampleEval.cognitiveProfile && (sampleEval.cognitiveProfile.label || sampleEval.cognitiveProfile.name), "Cognitive profile must always be generated");
assert(sampleEval.spiritualProfile && (sampleEval.spiritualProfile.name || sampleEval.spiritualProfile.level), "Spiritual profile must always be generated");
assert(sampleEval.report && sampleEval.report.strengths && sampleEval.report.strengths.length >= 4, "Strengths must always be generated");
assert(sampleEval.report && sampleEval.report.developmentAreas && sampleEval.report.developmentAreas.length >= 2, "Development areas must always be generated");

console.log("--------------------------------------------------");
console.log("✅ ALL 20-QUESTION PDC SPECIFICATION CHECKS PASSED!");
console.log("==================================================");
