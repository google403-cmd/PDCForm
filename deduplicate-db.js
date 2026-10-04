/**
 * ===================================================================
 * PDC FIRESTORE DATABASE DEDUPLICATION & INTEGRITY SCRIPT
 * ===================================================================
 * 
 * 1. Scans submissions collections (pdc_bibwewadi_submissions, etc.)
 * 2. Identifies and removes duplicate documents (keeping newest per phone)
 * 3. Populates / syncs pdc_registrations with unique phone IDs
 * 4. Recalculates clean deduplicated statistics in pdc_stats/registrations
 * 
 * Usage:
 *   node deduplicate-db.js
 * ===================================================================
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const serviceKeyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceKeyPath)) {
  console.error('❌ Error: serviceAccountKey.json not found.');
  process.exit(1);
}

const serviceAccount = require(serviceKeyPath);
admin.initializeApp({
  credential: admin.cert(serviceAccount)
});

const db = getFirestore();

function cleanPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/[^0-9]/g, '');
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

async function deduplicateCollection(collectionName) {
  console.log(`\n🔍 Checking [${collectionName}] for duplicate documents...`);
  const snapshot = await db.collection(collectionName).get();
  console.log(`   Total documents in [${collectionName}]: ${snapshot.size}`);

  const docsByPhone = new Map();

  snapshot.forEach(doc => {
    const data = doc.data() || {};
    const phone = cleanPhone(data.whatsappNumber || data.phone);
    if (!phone) return;

    if (!docsByPhone.has(phone)) {
      docsByPhone.set(phone, []);
    }
    docsByPhone.get(phone).push({
      id: doc.id,
      data,
      time: new Date(data.submittedAt || data.timestamp || 0).getTime()
    });
  });

  const duplicateDocsToDelete = [];
  const uniqueStudents = [];

  for (const [phone, docs] of docsByPhone.entries()) {
    if (docs.length === 1) {
      uniqueStudents.push(docs[0]);
    } else {
      // Sort newest first
      docs.sort((a, b) => b.time - a.time);
      // Keep docs[0] as primary
      uniqueStudents.push(docs[0]);
      // Mark others as duplicates to delete
      for (let i = 1; i < docs.length; i++) {
        duplicateDocsToDelete.push(docs[i].id);
      }
    }
  }

  console.log(`   Unique phone numbers: ${docsByPhone.size}`);
  console.log(`   Duplicate documents to remove: ${duplicateDocsToDelete.length}`);

  if (duplicateDocsToDelete.length > 0) {
    console.log(`   🗑️ Purging ${duplicateDocsToDelete.length} duplicate documents in batches...`);
    const batchSize = 400;
    for (let i = 0; i < duplicateDocsToDelete.length; i += batchSize) {
      const batch = db.batch();
      const chunk = duplicateDocsToDelete.slice(i, i + batchSize);
      for (const docId of chunk) {
        batch.delete(db.collection(collectionName).doc(docId));
      }
      await batch.commit();
      console.log(`      Deleted ${i + chunk.length}/${duplicateDocsToDelete.length} duplicates...`);
    }
    console.log(`   ✅ Duplicates removed from [${collectionName}]!`);
  } else {
    console.log(`   ✨ No duplicates found in [${collectionName}].`);
  }

  return uniqueStudents;
}

async function run() {
  console.log('====================================================');
  console.log('   PDC DATABASE DEDUPLICATION & SYNC UTILITY       ');
  console.log('====================================================');

  // 1. Deduplicate pdc_bibwewadi_submissions
  const uniqueBibwewadi = await deduplicateCollection('pdc_bibwewadi_submissions');

  // 2. Also check pdc_kondhwa_submissions and pdc_test_submissions if any
  const uniqueKondhwa = await deduplicateCollection('pdc_kondhwa_submissions');
  const uniqueTest = await deduplicateCollection('pdc_test_submissions');

  // 3. Aggregate all unique students across campus collections
  const masterStudentsByPhone = new Map();

  function mergeStudents(list) {
    for (const item of list) {
      const d = item.data;
      const phone = cleanPhone(d.whatsappNumber || d.phone);
      if (!phone) continue;

      const name = String(d.fullName || d.name || 'Student').trim();
      const gender = String(d.gender || 'Male').trim();
      const isFemale = gender.toLowerCase() === 'female';
      const branch = d.branch || '';
      const division = d.division || '';
      const email = d.email || '';
      const referredBy = d.referredBy || d.referencer || 'Direct';
      const hasJoined = d.whatsappJoined === true || d.joinedCommunity === 'yes' || d.hasJoinedWhatsapp === true;

      if (!masterStudentsByPhone.has(phone)) {
        masterStudentsByPhone.set(phone, {
          fullName: name,
          whatsappNumber: phone,
          email,
          gender: isFemale ? 'Female' : 'Male',
          branch,
          division,
          referredBy,
          hasJoined,
          status: 'registered',
          submittedAt: d.submittedAt || d.timestamp || new Date().toISOString()
        });
      } else {
        // Merge - prioritize joined status
        const existing = masterStudentsByPhone.get(phone);
        if (hasJoined) existing.hasJoined = true;
        if (!existing.email && email) existing.email = email;
        if (!existing.branch && branch) existing.branch = branch;
        if (!existing.division && division) existing.division = division;
      }
    }
  }

  mergeStudents(uniqueBibwewadi);
  mergeStudents(uniqueKondhwa);
  mergeStudents(uniqueTest);

  console.log(`\n📊 Total unique students across all records: ${masterStudentsByPhone.size}`);

  // 4. Sync unique students into the NEW collection: pdc_registrations
  console.log(`\n💾 Syncing unique records into [pdc_registrations] with phone number IDs...`);
  const regEntries = Array.from(masterStudentsByPhone.entries());
  const batchSize = 400;
  for (let i = 0; i < regEntries.length; i += batchSize) {
    const batch = db.batch();
    const chunk = regEntries.slice(i, i + batchSize);
    for (const [phone, studentData] of chunk) {
      const docRef = db.collection('pdc_registrations').doc(phone);
      batch.set(docRef, {
        fullName: studentData.fullName,
        whatsappNumber: studentData.whatsappNumber,
        email: studentData.email,
        gender: studentData.gender,
        branch: studentData.branch,
        division: studentData.division,
        referredBy: studentData.referredBy,
        joinedWhatsApp: studentData.hasJoined,
        status: 'registered',
        submittedAt: studentData.submittedAt
      }, { merge: true });
    }
    await batch.commit();
    process.stdout.write(`   Synced ${Math.min(i + batchSize, regEntries.length)}/${regEntries.length} records...\r`);
  }
  console.log(`\n   ✅ Successfully synced ${regEntries.length} unique records to [pdc_registrations]!`);

  // 5. Compute clean, deduplicated statistics
  let malesCount = 0;
  let femalesCount = 0;
  const joinedWhatsApp = [];
  const notJoinedWhatsApp = [];

  for (const s of masterStudentsByPhone.values()) {
    if (s.gender === 'Female') {
      femalesCount++;
    } else {
      malesCount++;
    }

    const miniProfile = {
      name: s.fullName,
      phone: s.whatsappNumber
    };

    if (s.hasJoined) {
      joinedWhatsApp.push(miniProfile);
    } else {
      notJoinedWhatsApp.push(miniProfile);
    }
  }

  const cleanStats = {
    totalEntries: masterStudentsByPhone.size,
    totalRegistered: masterStudentsByPhone.size,
    males: malesCount,
    females: femalesCount,
    joinedWhatsAppCount: joinedWhatsApp.length,
    notJoinedWhatsAppCount: notJoinedWhatsApp.length,
    joinedWhatsApp,
    notJoinedWhatsApp,
    lastDeduplicatedAt: new Date().toISOString()
  };

  console.log(`\n📈 Deduplicated Database Totals:`);
  console.log(`   Total Registered: ${cleanStats.totalRegistered}`);
  console.log(`   Males:            ${cleanStats.males}`);
  console.log(`   Females:          ${cleanStats.females}`);
  console.log(`   Joined WhatsApp:  ${cleanStats.joinedWhatsAppCount}`);
  console.log(`   Not Joined WA:    ${cleanStats.notJoinedWhatsAppCount}`);

  // Write to pdc_stats/registrations & pdc_stats/registration
  await db.collection('pdc_stats').doc('registrations').set(cleanStats, { merge: true });
  await db.collection('pdc_stats').doc('registration').set(cleanStats, { merge: true });
  console.log(`\n   ✅ Updated [pdc_stats/registrations] and [pdc_stats/registration] with zero duplicity!`);

  console.log('\n====================================================');
  console.log('🎉 DATABASE DEDUPLICATION COMPLETED SUCCESSFULLY!');
  console.log('====================================================\n');
}

run().catch(err => {
  console.error('\n❌ Deduplication failed:', err);
  process.exit(1);
});
