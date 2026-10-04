/**
 * Quick Tool to move verified WhatsApp community members from notJoinedWhatsApp to joinedWhatsApp.
 * 
 * Usage:
 *   1. Via command line:
 *      node mark-joined.js 9860923254, 9763361547, 7559301083
 * 
 *   2. Or paste numbers into "joined_numbers.txt" (one per line, or comma-separated) and run:
 *      node mark-joined.js
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json');
if (!admin.getApps().length) {
  admin.initializeApp({
    credential: admin.cert(serviceAccount)
  });
}
const db = getFirestore();

function cleanPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/[^0-9]/g, '');
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

async function markJoined(inputNumbers) {
  console.log('====================================================');
  console.log('  PDC WHATSAPP COMMUNITY MEMBER VERIFICATION TOOL  ');
  console.log('====================================================\n');

  let rawList = [];

  // 1. Check CLI arguments
  const args = process.argv.slice(2).join(' ');
  if (args.trim()) {
    rawList = args.split(/[,\s\n\r\t]+/).filter(Boolean);
  }

  // 2. Check joined_numbers.txt file if no CLI args or file exists
  const textFilePath = path.join(__dirname, 'joined_numbers.txt');
  if (fs.existsSync(textFilePath)) {
    const fileContent = fs.readFileSync(textFilePath, 'utf8');
    const fromFile = fileContent.split(/[,\s\n\r\t]+/).filter(Boolean);
    rawList = rawList.concat(fromFile);
  }

  // Deduplicate and clean
  const targetPhones = new Set(rawList.map(cleanPhone).filter(p => p.length === 10));

  if (targetPhones.size === 0) {
    console.log('⚠️ No phone numbers provided.');
    console.log('\nHow to use:');
    console.log('  Option A: Pass numbers in command line:');
    console.log('    node mark-joined.js 9860923254, 9763361547');
    console.log('\n  Option B: Paste numbers into "joined_numbers.txt" and run:');
    console.log('    node mark-joined.js\n');
    process.exit(1);
  }

  console.log(`Searching for ${targetPhones.size} verified phone numbers in pdc_stats/registrations...\n`);

  const docRef = db.collection('pdc_stats').doc('registrations');
  const snap = await docRef.get();

  if (!snap.exists) {
    console.error('❌ Document pdc_stats/registrations not found.');
    process.exit(1);
  }

  const data = snap.data();
  const notJoined = data.notJoinedWhatsApp || [];
  const joined = data.joinedWhatsApp || [];

  const existingJoinedPhones = new Set(joined.map(x => cleanPhone(x.phone)));
  const newlyJoined = [];
  const remainingNotJoined = [];

  for (const student of notJoined) {
    const p = cleanPhone(student.phone);
    if (targetPhones.has(p)) {
      if (!existingJoinedPhones.has(p)) {
        newlyJoined.push(student);
        existingJoinedPhones.add(p);
      }
    } else {
      remainingNotJoined.push(student);
    }
  }

  if (newlyJoined.length === 0) {
    console.log('ℹ️ No students in notJoinedWhatsApp matched the provided numbers (they may already be in joinedWhatsApp).');
    process.exit(0);
  }

  const updatedJoined = joined.concat(newlyJoined);

  console.log(`Found ${newlyJoined.length} matching students in notJoinedWhatsApp:`);
  newlyJoined.slice(0, 10).forEach((s, idx) => {
    console.log(`  ${idx + 1}. ${s.name} (${s.phone})`);
  });
  if (newlyJoined.length > 10) {
    console.log(`  ... and ${newlyJoined.length - 10} more.`);
  }

  console.log('\nSaving updated lists to Firestore...');
  await docRef.set({
    totalEntries: data.totalEntries || (updatedJoined.length + remainingNotJoined.length),
    totalRegistered: data.totalRegistered || (updatedJoined.length + remainingNotJoined.length),
    males: data.males,
    females: data.females,
    joinedWhatsAppCount: updatedJoined.length,
    notJoinedWhatsAppCount: remainingNotJoined.length,
    joinedWhatsApp: updatedJoined,
    notJoinedWhatsApp: remainingNotJoined
  }, { merge: false });

  console.log('\n✅ SUCCESS!');
  console.log(`  Moved:                 ${newlyJoined.length} students to joinedWhatsApp`);
  console.log(`  Total joinedWhatsApp:    ${updatedJoined.length}`);
  console.log(`  Total notJoinedWhatsApp: ${remainingNotJoined.length}`);
  process.exit(0);
}

markJoined().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
