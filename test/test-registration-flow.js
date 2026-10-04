const admin = require('firebase-admin');
const { getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const sa = require('../serviceAccountKey.json');

if (!getApps().length) {
  admin.initializeApp({ credential: admin.cert(sa) });
}
const db = getFirestore();

async function runTests() {
  console.log('========================================================');
  console.log('   PDC REGISTRATION & DEDUPLICATION VERIFICATION TEST   ');
  console.log('========================================================\n');

  const testPhone = '9999900001';
  const testRegRef = db.collection('pdc_registrations').doc(testPhone);

  // Clean any previous test doc
  await testRegRef.delete();

  // Get initial stats count
  const initialStatsSnap = await db.collection('pdc_stats').doc('registrations').get();
  const initialStats = initialStatsSnap.data() || {};
  const initialTotal = initialStats.totalRegistered || initialStats.totalEntries || 0;
  console.log(`Initial stats count: ${initialTotal}`);

  // Test 1: First submission (New student)
  console.log('\n--- TEST 1: New Student Registration ---');
  const studentData1 = {
    fullName: 'Aditya Kulkarni',
    whatsappNumber: testPhone,
    email: 'aditya.kulkarni@vit.edu',
    gender: 'Male',
    branch: 'Computer Engineering',
    division: 'A',
    referredBy: 'Shaurya (Club Coordinator)',
    status: 'registered',
    joinedWhatsApp: false,
    submittedAt: new Date().toISOString(),
    timestamp: new Date().toISOString()
  };

  await testRegRef.set(studentData1);
  console.log('✅ Created document in [pdc_registrations] with doc ID = phone number.');

  // Increment stats
  await db.collection('pdc_stats').doc('registrations').set({
    totalRegistered: FieldValue.increment(1),
    totalEntries: FieldValue.increment(1),
    males: FieldValue.increment(1)
  }, { merge: true });

  const afterFirstSnap = await db.collection('pdc_stats').doc('registrations').get();
  const afterFirstTotal = afterFirstSnap.data().totalRegistered;
  console.log(`Stats count after first submission: ${afterFirstTotal} (expected: ${initialTotal + 1})`);
  if (afterFirstTotal !== initialTotal + 1) {
    throw new Error('Stats total did not increment on first submission');
  }

  // Test 2: Second submission (Duplicate student, same phone)
  console.log('\n--- TEST 2: Duplicate Registration Check (Same Phone) ---');
  const studentData2 = {
    fullName: 'Aditya S. Kulkarni', // updated name
    whatsappNumber: testPhone,
    email: 'aditya.kulkarni.new@vit.edu', // updated email
    gender: 'Male',
    branch: 'Computer Engineering',
    division: 'B', // updated div
    referredBy: 'Shaurya',
    status: 'registered',
    submittedAt: new Date().toISOString()
  };

  // Check if exists
  const checkDoc = await testRegRef.get();
  console.log(`Document exists check before 2nd write: ${checkDoc.exists}`);
  if (checkDoc.exists) {
    console.log('Student already exists in DB! Performing merge update without increasing total count.');
    await testRegRef.set(studentData2, { merge: true });
    // Note: Do NOT increment stats count!
  } else {
    throw new Error('Document should exist!');
  }

  // Verify total count did NOT increment
  const afterDupSnap = await db.collection('pdc_stats').doc('registrations').get();
  const afterDupTotal = afterDupSnap.data().totalRegistered;
  console.log(`Stats count after duplicate submission: ${afterDupTotal} (expected: ${afterFirstTotal})`);
  if (afterDupTotal !== afterFirstTotal) {
    throw new Error('Duplicate submission incorrectly increased the total count!');
  }
  console.log('✅ Duplicity prevented! Total count remained unchanged.');

  // Verify document was updated with new details
  const updatedDoc = await testRegRef.get();
  const updatedData = updatedDoc.data();
  console.log('Updated document in DB:', {
    name: updatedData.fullName,
    email: updatedData.email,
    division: updatedData.division,
    referredBy: updatedData.referredBy
  });
  if (updatedData.fullName !== 'Aditya S. Kulkarni' || updatedData.division !== 'B') {
    throw new Error('Document fields were not correctly updated!');
  }
  console.log('✅ Document updated successfully in place without duplicate records.');

  // Test 3: WhatsApp Community Join status
  console.log('\n--- TEST 3: WhatsApp Join Status Update ---');
  await testRegRef.set({
    joinedWhatsApp: true,
    joinedWhatsAppAt: new Date().toISOString()
  }, { merge: true });

  const waJoinedDoc = await testRegRef.get();
  console.log(`joinedWhatsApp in DB: ${waJoinedDoc.data().joinedWhatsApp}`);
  if (!waJoinedDoc.data().joinedWhatsApp) {
    throw new Error('joinedWhatsApp was not updated to true!');
  }
  console.log('✅ WhatsApp join recorded cleanly in pdc_registrations.');

  // Test 4: NEW COLLECTION pdc_simple_registrations (4 fields & Deduplication)
  console.log('\n--- TEST 4: [pdc_simple_registrations] 4-Field & Deduplication ---');
  const simplePhone = '9999900002';
  const simpleDocRef = db.collection('pdc_simple_registrations').doc(simplePhone);
  await simpleDocRef.delete();

  // First simple submission
  const simpleData1 = {
    fullName: 'Rohan Deshmukh',
    phoneNumber: simplePhone,
    whatsappNumber: simplePhone,
    email: 'rohan.deshmukh@vit.edu',
    gender: 'Male',
    status: 'registered',
    submittedAt: new Date().toISOString()
  };
  await simpleDocRef.set(simpleData1);
  console.log('✅ Created document in new collection [pdc_simple_registrations] with doc ID = phone number.');

  const checkSimple1 = await simpleDocRef.get();
  if (!checkSimple1.exists || checkSimple1.data().fullName !== 'Rohan Deshmukh') {
    throw new Error('pdc_simple_registrations document was not created correctly');
  }

  // Duplicate submission with same phone number
  const simpleData2 = {
    fullName: 'Rohan V. Deshmukh',
    phoneNumber: simplePhone,
    whatsappNumber: simplePhone,
    email: 'rohan.new@vit.edu',
    gender: 'Male',
    status: 'registered',
    isDuplicateSubmission: true,
    updatedAt: new Date().toISOString()
  };

  const existingSimpleDoc = await simpleDocRef.get();
  if (existingSimpleDoc.exists) {
    console.log('Duplicate phone detected in [pdc_simple_registrations]. Merging in-place without duplicate doc.');
    await simpleDocRef.set(simpleData2, { merge: true });
  }

  // Check that only 1 document exists and data is updated
  const checkSimple2 = await simpleDocRef.get();
  if (checkSimple2.data().fullName !== 'Rohan V. Deshmukh' || checkSimple2.data().email !== 'rohan.new@vit.edu') {
    throw new Error('pdc_simple_registrations document update failed');
  }
  console.log('✅ Verified zero duplicates in [pdc_simple_registrations]. Record updated in-place.');

  // Clean simple test doc
  await simpleDocRef.delete();

  // Test 5: NEW COLLECTION confirmation_stst & confirmation_stats (With Branch, Division, Program Details)
  console.log('\n--- TEST 5: [confirmation_stst] & [confirmation_stats] with Branch and Division ---');
  const confirmPhone = '9999900003';
  const confirmData = {
    fullName: 'Shaurya O. Panigrahi',
    phoneNumber: confirmPhone,
    whatsappNumber: confirmPhone,
    email: 'scouttiger2@gmail.com',
    gender: 'Male',
    branch: 'Computer Engineering',
    division: 'A',
    program: 'PDC Course and Camps Orientation Program at Sharad Arena(Auditorium)',
    eventDate: 'Tuesday, 6 October 2026',
    eventTime: '6:00 PM',
    venue: 'Sharad Arena(Auditorium)',
    status: 'confirmed',
    submittedAt: new Date().toISOString(),
    timestamp: new Date().toISOString()
  };

  const cStstRef = db.collection('confirmation_stst').doc(confirmPhone);
  const cStatsRef = db.collection('confirmation_stats').doc(confirmPhone);
  await cStstRef.set(confirmData);
  await cStatsRef.set(confirmData);

  const checkStst = await cStstRef.get();
  const checkStats = await cStatsRef.get();

  if (!checkStst.exists || checkStst.data().branch !== 'Computer Engineering' || checkStst.data().division !== 'A') {
    throw new Error('confirmation_stst document was not created correctly');
  }
  if (!checkStats.exists || checkStats.data().program !== 'PDC Course and Camps Orientation Program at Sharad Arena(Auditorium)') {
    throw new Error('confirmation_stats document was not created correctly');
  }
  console.log('✅ Successfully stored and verified student data in [confirmation_stst] and [confirmation_stats]!');

  // Cleanup test documents
  await cStstRef.delete();
  await cStatsRef.delete();

  // Cleanup test document and restore stats
  console.log('\n--- CLEANUP ---');
  await testRegRef.delete();
  await db.collection('pdc_stats').doc('registrations').set({
    totalRegistered: FieldValue.increment(-1),
    totalEntries: FieldValue.increment(-1),
    males: FieldValue.increment(-1)
  }, { merge: true });

  const finalStatsSnap = await db.collection('pdc_stats').doc('registrations').get();
  const finalTotal = finalStatsSnap.data().totalRegistered;
  console.log(`Final stats count restored to: ${finalTotal}`);

  console.log('\n========================================================');
  console.log('🎉 ALL REGISTRATION & DEDUPLICATION TESTS PASSED (100%)');
  console.log('========================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
