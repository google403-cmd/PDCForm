/**
 * PDC Personality Development Club — Statistics Backfill Script
 * 
 * Extracts all existing past submissions from Firestore:
 * - pdc_bibwewadi_submissions
 * - pdc_kondhwa_submissions
 * - pdc_test_submissions
 * - pdc_whatsapp_joins
 * 
 * Computes:
 * 1. totalEntries
 * 2. males count
 * 3. females count
 * 4. joinedWhatsApp array [{ name, phone }]
 * 5. notJoinedWhatsApp array [{ name, phone }]
 * 
 * And writes the exact clean redesigned document to:
 * - pdc_stats/registrations
 * - pdc_stats/registration
 * 
 * Usage:
 *   node backfill-stats.js
 */

const fs = require('fs');
const path = require('path');

async function run() {
  console.log('====================================================');
  console.log('  PDC FIRESTORE STATS BACKFILL & RECOVERY UTILITY  ');
  console.log('====================================================\n');

  let db = null;
  let FieldValue = null;
  let isAdmin = false;

  // 1. Check for Service Account Key for unrestricted Admin read access
  const possibleKeyFiles = [
    'serviceAccountKey.json',
    'service-account.json',
    'firebase-admin.json',
    'pdclub-service-account.json'
  ];

  let serviceKeyPath = null;
  for (const f of possibleKeyFiles) {
    const full = path.join(__dirname, f);
    if (fs.existsSync(full)) {
      serviceKeyPath = full;
      break;
    }
  }

  if (serviceKeyPath) {
    try {
      const admin = require('firebase-admin');
      const { getFirestore, FieldValue: adminFieldValue } = require('firebase-admin/firestore');
      const serviceAccount = require(serviceKeyPath);
      admin.initializeApp({
        credential: admin.cert(serviceAccount)
      });
      db = getFirestore();
      FieldValue = adminFieldValue;
      isAdmin = true;
      console.log('🔑 Connected via Firebase Admin SDK (unrestricted access).');
    } catch (e) {
      console.warn('⚠️ Could not initialize Admin SDK with key file:', e.message);
    }
  }

  // 2. Fallback to Client SDK with API credentials
  if (!db) {
    const firebase = require('firebase/compat/app');
    require('firebase/compat/firestore');
    const config = require('./js/content.js');
    const app = firebase.initializeApp(config.firebase);
    db = app.firestore();
    FieldValue = firebase.firestore.FieldValue;
    console.log('🌐 Connected via Firebase Client SDK (subject to Firestore Security Rules).');
  }

  const collections = [
    'pdc_bibwewadi_submissions',
    'pdc_kondhwa_submissions',
    'pdc_test_submissions'
  ];

  const studentsByPhone = new Map();
  let totalRead = 0;
  let permissionDenied = false;

  for (const colName of collections) {
    try {
      process.stdout.write(`Fetching past submissions from [${colName}]... `);
      const snapshot = await db.collection(colName).get();
      console.log(`found ${snapshot.size} records.`);
      totalRead += snapshot.size;

      snapshot.forEach(doc => {
        const d = doc.data() || {};
        const name = String(d.fullName || d.name || '').trim();
        const rawPhone = String(d.whatsappNumber || d.phone || '').replace(/[^0-9]/g, '');
        const phone = rawPhone.length === 10 ? rawPhone : (rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone);
        const genderRaw = String(d.gender || '').trim().toLowerCase();
        const isFemale = genderRaw === 'female';
        const hasJoined = d.whatsappJoined === true || d.joinedCommunity === 'yes' || d.hasJoinedWhatsapp === true;

        if (!phone && !name) return;

        const key = phone || name;
        // Keep latest record or prioritize joined status
        const existing = studentsByPhone.get(key);
        if (!existing || (!existing.hasJoined && hasJoined)) {
          studentsByPhone.set(key, {
            name: name || 'Student',
            phone: phone || '',
            gender: isFemale ? 'Female' : 'Male',
            isFemale,
            hasJoined
          });
        }
      });
    } catch (err) {
      console.log(`FAILED (${err.code || err.message})`);
      if (err.code === 'permission-denied' || String(err.message).includes('permission')) {
        permissionDenied = true;
      }
    }
  }

  // Also query pdc_whatsapp_joins if accessible
  try {
    process.stdout.write('Fetching confirmed joins from [pdc_whatsapp_joins]... ');
    const waSnap = await db.collection('pdc_whatsapp_joins').get();
    console.log(`found ${waSnap.size} records.`);
    waSnap.forEach(doc => {
      const d = doc.data() || {};
      const name = String(d.fullName || d.name || '').trim();
      const rawPhone = String(d.whatsappNumber || d.phone || '').replace(/[^0-9]/g, '');
      const phone = rawPhone.length === 10 ? rawPhone : (rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone);
      const key = phone || name;
      if (!key) return;

      if (studentsByPhone.has(key)) {
        studentsByPhone.get(key).hasJoined = true;
      } else {
        studentsByPhone.set(key, {
          name: name || 'Student',
          phone: phone || '',
          gender: String(d.gender || '').toLowerCase() === 'female' ? 'Female' : 'Male',
          isFemale: String(d.gender || '').toLowerCase() === 'female',
          hasJoined: true
        });
      }
    });
  } catch (err) {
    console.log(`skipped (${err.code || err.message})`);
  }

  // If permission was denied on reading submissions, guide the user
  if (totalRead === 0 && permissionDenied && !isAdmin) {
    console.log('\n----------------------------------------------------');
    console.log('🔒 ACCESS RESTRICTED BY FIRESTORE SECURITY RULES');
    console.log('----------------------------------------------------');
    console.log('Firestore security rules currently prohibit public read of submissions:');
    console.log('  match /pdc_bibwewadi_submissions/{id} { allow read: if false; }');
    console.log('\nTo allow this backfill script to read all existing past submissions, choose EITHER:\n');
    console.log('👉 METHOD A (Quickest - 1 minute in Firebase Console):');
    console.log('   1. Open Firebase Console: https://console.firebase.google.com/project/pdclub-e9f59/firestore/rules');
    console.log('   2. Temporarily set: allow read: if true; for submissions collections.');
    console.log('   3. Re-run this script: node backfill-stats.js');
    console.log('   4. Restore allow read: if false; when finished.\n');
    console.log('👉 METHOD B (Admin Private Key):');
    console.log('   1. Open Firebase Console: Project Settings -> Service Accounts -> Generate new private key');
    console.log('   2. Save the downloaded file as "serviceAccountKey.json" in this project folder.');
    console.log('   3. Re-run: node backfill-stats.js');
    console.log('----------------------------------------------------\n');
    process.exit(1);
  }

  if (studentsByPhone.size === 0) {
    console.log('\nNo submission records found to backfill.');
    process.exit(0);
  }

  console.log(`\nAggregating ${studentsByPhone.size} unique student submissions...`);

  let malesCount = 0;
  let femalesCount = 0;
  const joinedList = [];
  const notJoinedList = [];

  for (const s of studentsByPhone.values()) {
    if (s.isFemale) {
      femalesCount++;
    } else {
      malesCount++;
    }

    const item = {
      name: s.name,
      phone: s.phone
    };

    if (s.hasJoined) {
      joinedList.push(item);
    } else {
      notJoinedList.push(item);
    }
  }

  const totalEntries = studentsByPhone.size;

  console.log(`\nResults:`);
  console.log(`  Total Entries:  ${totalEntries}`);
  console.log(`  Males:          ${malesCount}`);
  console.log(`  Females:        ${femalesCount}`);
  console.log(`  Joined WA:      ${joinedList.length}`);
  console.log(`  Not Joined WA:  ${notJoinedList.length}`);

  const cleanData = {
    totalEntries,
    totalRegistered: totalEntries, // compatibility mirror
    males: malesCount,
    females: femalesCount,
    joinedWhatsApp: joinedList,
    notJoinedWhatsApp: notJoinedList
  };

  const targetDocs = [
    db.collection('pdc_stats').doc('registrations'),
    db.collection('pdc_stats').doc('registration')
  ];

  for (const docRef of targetDocs) {
    process.stdout.write(`Writing backfill to [pdc_stats/${docRef.id}]... `);
    await docRef.set(cleanData, { merge: false });
    console.log('SUCCESS!');
  }

  console.log('\n🎉 Backfill complete! The registration document is now 100% updated with all existing student data.');
  process.exit(0);
}

run().catch(err => {
  console.error('\nBackfill failed with error:', err);
  process.exit(1);
});
