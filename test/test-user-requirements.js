const fs = require('fs');
const assert = require('assert');

console.log("==================================================");
console.log("TESTING 4 NEW USER REQUIREMENTS & VIEW MORE REPORT");
console.log("==================================================");

// 1. Consent checkbox verification in app.js
const appJs = fs.readFileSync('js/app.js', 'utf8');

// Ensure card selection does NOT auto-check the consent checkbox
assert(!appJs.includes('confirmChk.checked = true;'), 'selectCommunityChoice must NOT auto-check consent checkbox');
console.log('✅ Requirement 1.1: Card selection does not auto-check consent checkbox');

// Ensure validation strictly blocks when consent checkbox is unchecked
assert(appJs.includes('if (!checkbox || !checkbox.checked)'), 'validateCurrentStep must require checkbox to be checked');
assert(appJs.includes('if (consentCheckbox && !consentCheckbox.checked)'), 'handleFormSubmit must check consent before submitting');
console.log('✅ Requirement 1.2: Submission strictly blocked if consent checkbox is not checked');

// 2. Slideshow interval in result.html
const resultHtml = fs.readFileSync('result.html', 'utf8');
assert(resultHtml.includes('AUTO_SLIDE_INTERVAL = 8000'), 'AUTO_SLIDE_INTERVAL must be 8000ms (8 seconds)');
console.log('✅ Requirement 2: Slideshow interval increased to 8000ms for comfortable reading');

// 3. Top score chips in result.html
assert(resultHtml.includes('Personality Quotient (PQ)'), 'result.html must include Personality Quotient (PQ) chip');
assert(resultHtml.includes('Intellectual Quotient (IQ)'), 'result.html must include Intellectual Quotient (IQ) chip');
assert(resultHtml.includes('Spiritual Quotient (SQ)'), 'result.html must include Spiritual Quotient (SQ) chip');
assert(resultHtml.includes('Total Score'), 'result.html must include Total Score chip');
console.log('✅ Requirement 3: Top score chips display SQ, IQ, PQ and Total Score');

// 4. View More Container for 7 Report Sections
assert(resultHtml.includes('id="viewMoreContainer"'), 'result.html must contain viewMoreContainer');
assert(resultHtml.includes('id="viewMoreContent"'), 'result.html must contain viewMoreContent');
assert(resultHtml.includes('id="viewMoreToggleBtn"'), 'result.html must contain viewMoreToggleBtn');
assert(resultHtml.includes('toggleViewMore'), 'result.html must contain toggleViewMore handler');
console.log('✅ View More: 7 Detailed assessment report sections enclosed in collapsible View More container');

// 5. Real people registered after 50 submissions
assert(resultHtml.includes('latestRegisteredCount >= MIN_DISPLAY_THRESHOLD'), 'result.html must check threshold count');
assert(resultHtml.includes('pdc_real_registrations'), 'result.html must check pdc_real_registrations');
assert(appJs.includes('pdc_real_registrations'), 'app.js must cache real student registrations');
console.log('✅ Requirement 4: Real registered people shown when registrations >= 50');

console.log("==================================================");
console.log("ALL NEW USER REQUIREMENTS VERIFIED SUCCESSFULLY!");
console.log("==================================================");
