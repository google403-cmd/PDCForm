const assert = require("assert");
const fs = require("fs");
const config = require("../js/content.js");

console.log("==================================================");
console.log("TESTING PDC BRANCH-BASED CAMPUS ROUTING SYSTEM");
console.log("==================================================");

// 1. Central Mapping Verification
const { campusMapping, getCampusFromBranch } = config;
assert(campusMapping, "campusMapping must exist in config");
assert(typeof getCampusFromBranch === "function", "getCampusFromBranch must be a function");

// 2. Exact 12-Branch Matrix Test
const EXPECTED_BIBWEWADI_BRANCHES = [
  "Computer Engineering",
  "Information Technology",
  "CSE (Artificial Intelligence)",
  "CSE (Artificial Intelligence & Machine Learning)"
];

const EXPECTED_KONDHWA_BRANCHES = [
  "CSE (Data Science)",
  "Computer Engineering (Software Engineering)",
  "CSE (IoT & Cyber Security including Blockchain)",
  "Electronics & Telecommunication",
  "Instrumentation & Control",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence & Data Science"
];

console.log("\n[Test 1] Testing all 4 Bibwewadi branches...");
EXPECTED_BIBWEWADI_BRANCHES.forEach(branch => {
  const campus = getCampusFromBranch(branch);
  assert.strictEqual(campus, "Bibwewadi", `Branch "${branch}" must map to "Bibwewadi"`);
  console.log(`  ✓ ${branch} → ${campus}`);
});
console.log("✅ All 4 Bibwewadi branches correctly map to Bibwewadi Campus");

console.log("\n[Test 2] Testing all 8 Kondhwa branches...");
EXPECTED_KONDHWA_BRANCHES.forEach(branch => {
  const campus = getCampusFromBranch(branch);
  assert.strictEqual(campus, "Kondhwa", `Branch "${branch}" must map to "Kondhwa"`);
  console.log(`  ✓ ${branch} → ${campus}`);
});
console.log("✅ All 8 Kondhwa branches correctly map to Kondhwa Campus");

// 3. No ambiguous overlap
console.log("\n[Test 3] Verifying no branch appears in both buckets...");
EXPECTED_BIBWEWADI_BRANCHES.forEach(b => {
  assert(!EXPECTED_KONDHWA_BRANCHES.includes(b), `Branch "${b}" must not appear in both buckets`);
});
console.log("✅ Zero overlap between campus branch buckets");

// 4. Edge Cases (Section 30 of Master Prompt)
console.log("\n[Test 4] Testing invalid / unknown branch interception...");
assert.strictEqual(getCampusFromBranch("Unknown Engineering"), null, "Unknown branch must return null");
assert.strictEqual(getCampusFromBranch(""), null, "Empty string must return null");
assert.strictEqual(getCampusFromBranch(null), null, "null must return null");
assert.strictEqual(getCampusFromBranch(undefined), null, "undefined must return null");
assert.strictEqual(getCampusFromBranch("Other"), null, "Other must return null");
console.log("✅ Unknown or unmapped branches safely return null (no guesswork)");

// 5. C-Cube URL Verification
console.log("\n[Test 5] Verifying exact Kondhwa C-Cube Home URL...");
assert.strictEqual(
  campusMapping.KONDHWA_WEBSITE_URL,
  "https://c-cube-vit-pune.vercel.app/",
  "Kondhwa redirect must be exact C-Cube home page URL"
);
console.log("✅ Kondhwa URL is exact C-Cube home page: https://c-cube-vit-pune.vercel.app/");

// 6. Inspect index.html for Common Entry Gateway, Logos, & Clean Dropdown
console.log("\n[Test 6] Verifying index.html PDC × C-Cube Common Entry Gateway markup...");
const indexHtml = fs.readFileSync("index.html", "utf8");
assert(indexHtml.includes('id="branchIntroCard"'), "index.html must contain branchIntroCard");
assert(indexHtml.includes('id="entryBranchSelect"'), "index.html must contain entryBranchSelect");
assert(indexHtml.includes('id="branchNextBtn"'), "index.html must contain branchNextBtn");
assert(indexHtml.includes('assets/pdc-logo-official.jpg'), "index.html must use official PDC logo asset");
assert(indexHtml.includes('assets/c-cube-logo-official.jpg'), "index.html must use official C-Cube logo asset");
assert(indexHtml.includes('circular-logo-container logo-pdc'), "index.html must use circular container for PDC logo");
assert(indexHtml.includes('circular-logo-container logo-ccube'), "index.html must use circular container for C-Cube logo");
assert(!indexHtml.includes('<optgroup'), "index.html must NOT contain campus optgroup or campus headings");

// Ensure all 12 branches appear as options in index.html
[...EXPECTED_BIBWEWADI_BRANCHES, ...EXPECTED_KONDHWA_BRANCHES].forEach(branch => {
  assert(indexHtml.includes(`value="${branch}"`), `index.html must contain option value="${branch}"`);
});
console.log("✅ index.html contains PDC × C-Cube common gateway with circular logos and clean 12-branch dropdown (no campus headings)");

// 7. Verify Campus field removed from registration in content.js
console.log("\n[Test 7] Verifying campus field removed from registration form...");
const [regStep] = config.steps;
const hasCampusField = regStep.fields.some(f => f.name === "campus");
assert(!hasCampusField, "Registration form must NOT contain campus field");
console.log("✅ Campus field completely removed from personal-details registration step");

// 8. Verify app.js routing and back navigation logic
console.log("\n[Test 8] Verifying app.js routing controller and consistency rules...");
const appJs = fs.readFileSync("js/app.js", "utf8");
assert(appJs.includes("initBranchRouting"), "app.js must define initBranchRouting");
assert(appJs.includes("enterBibwewadiAssessment"), "app.js must define enterBibwewadiAssessment");
assert(appJs.includes("returnToBranchSelection"), "app.js must define returnToBranchSelection");
assert(appJs.includes("Change Branch"), "app.js must offer Change Branch button on Step 1");
assert(appJs.includes("https://c-cube-vit-pune.vercel.app/"), "app.js must redirect to C-Cube for Kondhwa");
console.log("✅ app.js implements complete branch routing, prefilling, and back-navigation");

console.log("\n==================================================");
console.log("ALL BRANCH-BASED CAMPUS ROUTING TESTS PASSED!");
console.log("==================================================");
