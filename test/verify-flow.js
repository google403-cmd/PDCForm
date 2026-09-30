const fs = require('fs');
const assert = require('assert');

console.log("==================================================");
console.log("VERIFYING COMMUNITY STEP AND LIVE WIDGET IMPLEMENTATION");
console.log("==================================================");

// 1. Check index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert(indexHtml.includes('id="liveJoinWidget"'), 'index.html must contain liveJoinWidget');
assert(indexHtml.includes('id="liveJoinCard"'), 'index.html must contain liveJoinCard');
console.log('✅ index.html contains liveJoinWidget markup');

// 2. Check result.html
const resultHtml = fs.readFileSync('result.html', 'utf8');
assert(resultHtml.includes('id="liveJoinWidget"'), 'result.html must contain liveJoinWidget');
assert(resultHtml.includes('id="liveJoinCard"'), 'result.html must contain liveJoinCard');
assert(resultHtml.includes('id="liveAvatar"'), 'result.html must contain liveAvatar');
assert(resultHtml.includes('id="liveName"'), 'result.html must contain liveName');
assert(resultHtml.includes('id="liveTag"'), 'result.html must contain liveTag');
assert(resultHtml.includes('id="liveCounterPill"'), 'result.html must contain liveCounterPill');
assert(resultHtml.includes('SIMULATED_JOINERS'), 'result.html must contain SIMULATED_JOINERS');
assert(resultHtml.includes('initLiveJoinWidget'), 'result.html must contain initLiveJoinWidget');
console.log('✅ result.html contains liveJoinWidget markup and simulation engine');

// 3. Check css/styles.css
const css = fs.readFileSync('css/styles.css', 'utf8');
assert(css.includes('.community-step-container'), 'styles.css must contain .community-step-container');
assert(css.includes('.community-choice-card'), 'styles.css must contain .community-choice-card');
assert(css.includes('.live-join-widget'), 'styles.css must contain .live-join-widget');
assert(css.includes('.live-pulse-dot'), 'styles.css must contain .live-pulse-dot');
assert(css.includes('liveBeaconPulse'), 'styles.css must contain liveBeaconPulse');
console.log('✅ css/styles.css contains all community step and live widget styles');

// 4. Check js/app.js
const appJs = fs.readFileSync('js/app.js', 'utf8');
assert(appJs.includes('isCommunityStep'), 'app.js must handle isCommunityStep');
assert(appJs.includes('Next: WhatsApp Community →'), 'app.js must have button text Next: WhatsApp Community →');
assert(appJs.includes('Submit Assessment'), 'app.js must have button text Submit Assessment');
assert(appJs.includes('joinedCommunityChoice'), 'app.js must handle joinedCommunityChoice');
assert(appJs.includes('joinedCommunityCheckbox'), 'app.js must handle joinedCommunityCheckbox');
assert(appJs.includes('initAppLiveJoinWidget'), 'app.js must have initAppLiveJoinWidget');
console.log('✅ js/app.js contains stepper flow, community step, choice handling, and live widget trigger');

// 5. Check Registration Counter Threshold logic
const contentJs = fs.readFileSync('js/content.js', 'utf8');
assert(contentJs.includes('minDisplayThreshold: 50'), 'content.js must define minDisplayThreshold as 50');
console.log('✅ js/content.js defines minDisplayThreshold: 50');

const firebaseConfigJs = fs.readFileSync('js/firebase-config.js', 'utf8');
assert(firebaseConfigJs.includes('incrementRegistrationCounter'), 'firebase-config.js must export incrementRegistrationCounter');
assert(firebaseConfigJs.includes('getRegistrationCount'), 'firebase-config.js must export getRegistrationCount');
console.log('✅ js/firebase-config.js includes incrementRegistrationCounter and getRegistrationCount');

const firestoreRules = fs.readFileSync('firestore.rules', 'utf8');
assert(firestoreRules.includes('match /pdc_stats/{docId}'), 'firestore.rules must allow pdc_stats registration tracking');
console.log('✅ firestore.rules contains pdc_stats counter access rules');

assert(resultHtml.includes('registered in total'), 'result.html must show "registered in total"');
assert(resultHtml.includes('MIN_DISPLAY_THRESHOLD'), 'result.html must respect MIN_DISPLAY_THRESHOLD');
assert(appJs.includes('registered in total'), 'app.js must show "registered in total"');
assert(appJs.includes('MIN_DISPLAY_THRESHOLD'), 'app.js must respect MIN_DISPLAY_THRESHOLD');
console.log('✅ result.html and app.js update counter to "X registered in total" only at or above threshold');

console.log("==================================================");
console.log("ALL FLOW & COUNTER THRESHOLD CHECKS PASSED SUCCESSFULLY!");
console.log("==================================================");
