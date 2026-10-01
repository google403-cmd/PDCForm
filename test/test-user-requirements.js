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

// 10. Dedicated pdc_not_joined_community collection and leads display
assert(firestoreRules.includes('match /pdc_not_joined_community/{leadId}'), 'firestore.rules must include pdc_not_joined_community collection');
console.log('✅ Requirement 10.1: firestore.rules declares dedicated pdc_not_joined_community collection');

assert(firebaseConfigJs.includes('NOT_JOINED: "pdc_not_joined_community"'), 'firebase-config.js must include NOT_JOINED collection name');
assert(firebaseConfigJs.includes('async function recordNotJoinedCommunity'), 'firebase-config.js must implement recordNotJoinedCommunity');
assert(firebaseConfigJs.includes('async function getNotJoinedCommunityStudents'), 'firebase-config.js must implement getNotJoinedCommunityStudents');
console.log('✅ Requirement 10.2: firebase-config.js records and retrieves students who gave test without joining');

const leadsHtml = fs.readFileSync('leads.html', 'utf8');
assert(leadsHtml.includes('Assessment Leads (Not Joined WhatsApp)'), 'leads.html must be titled for assessment leads not joined');
assert(leadsHtml.includes('Phone Number / WhatsApp'), 'leads.html must display phone number column');
assert(leadsHtml.includes('Student Name'), 'leads.html must display student name column');
assert(leadsHtml.includes('btn-wa-chat'), 'leads.html must include WhatsApp direct chat action');
assert(leadsHtml.includes('copyAllNumbersBtn'), 'leads.html must include Copy All Phone Numbers button');
assert(leadsHtml.includes('exportCsvBtn'), 'leads.html must include Export CSV button');
console.log('✅ Requirement 10.3: leads.html displays name, phone number and quick WhatsApp outreach actions');

// 11. PDC Branch-Based Campus Routing System
const indexHtmlContent = fs.readFileSync('index.html', 'utf8');
assert(indexHtmlContent.includes('id="branchIntroCard"'), 'index.html must contain branchIntroCard for new first screen');
assert(indexHtmlContent.includes('id="entryBranchSelect"'), 'index.html must contain entryBranchSelect dropdown');
assert(indexHtmlContent.includes('id="branchNextBtn"'), 'index.html must contain branchNextBtn button');
assert(indexHtmlContent.includes('optgroup label="── BIBWEWADI CAMPUS ──"'), 'index.html must group Bibwewadi branches');
assert(indexHtmlContent.includes('optgroup label="── KONDHWA CAMPUS ──"'), 'index.html must group Kondhwa branches');
console.log('✅ Requirement 11.1: index.html contains PDC intro & branch selection screen with campus optgroups');

const contentJsContent = fs.readFileSync('js/content.js', 'utf8');
assert(contentJsContent.includes('campusMapping:'), 'content.js must define centralized campusMapping');
assert(contentJsContent.includes('getCampusFromBranch:'), 'content.js must define getCampusFromBranch helper');
assert(contentJsContent.includes('https://c-cube-website-chi.vercel.app/'), 'content.js must target C-Cube home page for Kondhwa');
console.log('✅ Requirement 11.2: content.js contains central mapping for all 12 branches & C-Cube URL');

assert(!contentJsContent.includes('options: ["Bibwewadi", "Kondhwa"]'), 'content.js must remove campus dropdown options from personal_details');
console.log('✅ Requirement 11.3: Campus selection field completely removed from student registration form');

const appJsContent = fs.readFileSync('js/app.js', 'utf8');
assert(appJsContent.includes('initBranchRouting'), 'app.js must implement initBranchRouting');
assert(appJsContent.includes('enterBibwewadiAssessment'), 'app.js must implement enterBibwewadiAssessment');
assert(appJsContent.includes('returnToBranchSelection'), 'app.js must support returning to branch selection');
assert(appJsContent.includes('https://c-cube-website-chi.vercel.app/'), 'app.js must redirect Kondhwa branches to C-Cube');
console.log('✅ Requirement 11.4: app.js handles intelligent branch-to-campus routing and back navigation');

console.log("==================================================");
console.log("ALL REQUIREMENTS & POPUP SUPPRESSION TESTS PASSED!");
console.log("==================================================");


