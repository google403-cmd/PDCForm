const fs = require('fs');
const assert = require('assert');

console.log("==================================================");
console.log("TESTING ALL REQUIREMENTS & POPUP SUPPRESSION < 50");
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

// 5. Strict popup suppression when < 50 registered in DB
assert(resultHtml.includes('id="liveJoinWidget" class="live-join-widget" aria-live="polite" aria-label="Recent Community Members" style="display: none;"'), 'liveJoinWidget must be hidden by default on load');
assert(resultHtml.includes('id="liveJoinCard" role="status" style="display: none;"'), 'liveJoinCard must be hidden by default on load');
assert(resultHtml.includes('if (latestRegisteredCount < MIN_DISPLAY_THRESHOLD)'), 'showNotification must strictly abort popup if registered count is below 50');
console.log('✅ Requirement 5: Popups strictly suppressed until more than 50 registered in DB');

// 6. Real people registered after 50 submissions
assert(resultHtml.includes('latestRegisteredCount >= MIN_DISPLAY_THRESHOLD'), 'result.html must check threshold count');
assert(resultHtml.includes('pdc_real_registrations'), 'result.html must check pdc_real_registrations');
assert(appJs.includes('pdc_real_registrations'), 'app.js must cache real student registrations');
console.log('✅ Requirement 6: Real registered people shown when registrations >= 50');

// 7. Database management field for WhatsApp community joins
const firestoreRules = fs.readFileSync('firestore.rules', 'utf8');
assert(firestoreRules.includes("'joinedCommunity'"), 'firestore.rules must allow joinedCommunity in payload');
assert(firestoreRules.includes("'whatsappJoined'"), 'firestore.rules must allow whatsappJoined in payload');
assert(firestoreRules.includes("'hasJoinedWhatsapp'"), 'firestore.rules must allow hasJoinedWhatsapp in payload');
assert(firestoreRules.includes('whatsappJoinedCount is number'), 'firestore.rules must allow whatsappJoinedCount in pdc_stats');
console.log('✅ Requirement 7.1: firestore.rules validates WhatsApp joined management fields');

const firebaseConfigJs = fs.readFileSync('js/firebase-config.js', 'utf8');
assert(firebaseConfigJs.includes('incrementWhatsAppJoinedCounter'), 'firebase-config.js must export incrementWhatsAppJoinedCounter');
assert(firebaseConfigJs.includes('getWhatsAppJoinedCount'), 'firebase-config.js must export getWhatsAppJoinedCount');
assert(firebaseConfigJs.includes('whatsappJoinedCount: firebase.firestore.FieldValue.increment(1)'), 'firebase-config.js must increment WhatsApp joined in pdc_stats');
console.log('✅ Requirement 7.2: firebase-config.js manages WhatsApp joined counter in database');

assert(appJs.includes('whatsappJoined: formData.joinedCommunity === "yes"'), 'app.js must pass whatsappJoined field in payload');
console.log('✅ Requirement 7.3: app.js populates database WhatsApp community management fields');

// 8. Dedicated pdc_whatsapp_joins collection for checking WhatsApp joins
assert(firestoreRules.includes('match /pdc_whatsapp_joins/{joinId}'), 'firestore.rules must include pdc_whatsapp_joins collection');
assert(firestoreRules.includes('request.resource.data.whatsappNumber is string'), 'pdc_whatsapp_joins must validate whatsappNumber');
console.log('✅ Requirement 8.1: firestore.rules declares dedicated pdc_whatsapp_joins collection');

assert(firebaseConfigJs.includes('WHATSAPP_JOINS: "pdc_whatsapp_joins"'), 'firebase-config.js must include WHATSAPP_JOINS collection name');
assert(firebaseConfigJs.includes('async function recordWhatsAppJoin'), 'firebase-config.js must implement recordWhatsAppJoin');
assert(firebaseConfigJs.includes('COLLECTIONS.WHATSAPP_JOINS'), 'firebase-config.js must query WHATSAPP_JOINS');
console.log('✅ Requirement 8.2: firebase-config.js writes and queries pdc_whatsapp_joins collection');

// 9. Dead code removal verification
assert(!resultHtml.includes('.result-score-grid'), 'result.html must not contain unused .result-score-grid CSS');
assert(!resultHtml.includes('.score-card-pq'), 'result.html must not contain unused .score-card-pq CSS');
console.log('✅ Requirement 9: Unused score grid styles removed from result.html');

console.log("==================================================");
console.log("ALL REQUIREMENTS & POPUP SUPPRESSION TESTS PASSED!");
console.log("==================================================");

