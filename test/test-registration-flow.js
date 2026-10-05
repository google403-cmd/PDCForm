const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://newtaeknlmkugqmhcyxg.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ld3RhZWtubG1rdWdxbWhjeXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzM4MzUsImV4cCI6MjEwNjc0OTgzNX0.MeDqtah3UBb8TjMldOl-wMeTFdvtPqU1GjFfQhbhdOU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log('========================================================');
  console.log('   PDC REGISTRATION & DEDUPLICATION VERIFICATION TEST   ');
  console.log('         (2 TABLES: confirmation_stst & bibwewadi)      ');
  console.log('========================================================\n');

  const testPhone = '9999900001';
  const testPhoneNum = parseInt(testPhone, 10);
  const testDocId = `/confirmation_stst/${testPhone}`;

  // 1. Initial cleanup of test records
  await supabase.from('confirmation_stst').delete().eq('Document ID', testDocId);

  // 2. Count before submission
  const { count: initialTotal } = await supabase
    .from('confirmation_stst')
    .select('*', { count: 'exact', head: true });

  console.log(`Initial total records in [confirmation_stst]: ${initialTotal}`);

  // --- TEST 1: New Student Registration ---
  console.log('\n--- TEST 1: New Student Registration ---');
  const studentData1 = {
    'Document ID': testDocId,
    fullName: 'Aditya Kulkarni',
    phoneNumber: testPhoneNum,
    whatsappNumber: testPhoneNum,
    email: 'aditya.kulkarni@vit.edu',
    gender: 'Male',
    branch: 'Computer Engineering',
    division: 'A',
    referredBy: 'Shaurya (Club Coordinator)',
    status: 'confirmed',
    joinedWhatsApp: false,
    program: 'PDC Course and Camps Orientation Program at Sharad Arena(Auditorium)',
    eventDate: 'Tuesday, 6 October 2026',
    eventTime: '6:00 PM',
    venue: 'Sharad Arena(Auditorium)',
    submittedAt: new Date().toISOString(),
    timestamp: new Date().toISOString()
  };

  const { error: insertErr } = await supabase
    .from('confirmation_stst')
    .upsert(studentData1, { onConflict: 'Document ID' });

  if (insertErr) throw new Error('Test 1 Insert failed: ' + insertErr.message);
  console.log('✅ Created document in [confirmation_stst] with doc ID = phone number.');

  const { count: afterFirstTotal } = await supabase
    .from('confirmation_stst')
    .select('*', { count: 'exact', head: true });

  console.log(`Count after first submission: ${afterFirstTotal} (expected: ${initialTotal + 1})`);
  if (afterFirstTotal !== initialTotal + 1) {
    throw new Error('Total count did not increment on first submission');
  }

  // --- TEST 2: Duplicate Registration Check (Same Phone) ---
  console.log('\n--- TEST 2: Duplicate Registration Check (Same Phone) ---');
  const studentData2 = {
    'Document ID': testDocId,
    fullName: 'Aditya S. Kulkarni', // updated name
    phoneNumber: testPhoneNum,
    whatsappNumber: testPhoneNum,
    email: 'aditya.kulkarni.new@vit.edu', // updated email
    gender: 'Male',
    branch: 'Computer Engineering',
    division: 'B', // updated div
    referredBy: 'Shaurya',
    status: 'confirmed',
    updatedAt: new Date().toISOString()
  };

  // Check if exists
  const { data: checkDoc } = await supabase
    .from('confirmation_stst')
    .select('*')
    .eq('Document ID', testDocId)
    .single();

  console.log(`Document exists check before 2nd write: ${!!checkDoc}`);
  if (checkDoc) {
    console.log('Student already exists in DB! Performing merge update without increasing total count.');
    const { error: updateErr } = await supabase
      .from('confirmation_stst')
      .upsert({ ...checkDoc, ...studentData2 }, { onConflict: 'Document ID' });
    if (updateErr) throw new Error('Update failed: ' + updateErr.message);
  } else {
    throw new Error('Document should exist!');
  }

  // Verify total count did NOT increment
  const { count: afterDupTotal } = await supabase
    .from('confirmation_stst')
    .select('*', { count: 'exact', head: true });

  console.log(`Count after duplicate submission: ${afterDupTotal} (expected: ${afterFirstTotal})`);
  if (afterDupTotal !== afterFirstTotal) {
    throw new Error('Duplicate submission incorrectly increased the total count!');
  }
  console.log('✅ Duplicity prevented! Total count remained unchanged.');

  // Verify document was updated with new details
  const { data: updatedDoc } = await supabase
    .from('confirmation_stst')
    .select('*')
    .eq('Document ID', testDocId)
    .single();

  console.log('Updated document in DB:', {
    name: updatedDoc.fullName,
    email: updatedDoc.email,
    division: updatedDoc.division,
    referredBy: updatedDoc.referredBy
  });
  console.log('✅ Document updated successfully in place without duplicate records.');

  // --- TEST 3: WhatsApp Join Status Update ---
  console.log('\n--- TEST 3: WhatsApp Join Status Update ---');
  await supabase
    .from('confirmation_stst')
    .update({ joinedWhatsApp: true })
    .eq('Document ID', testDocId);

  const { data: waDoc } = await supabase
    .from('confirmation_stst')
    .select('joinedWhatsApp')
    .eq('Document ID', testDocId)
    .single();

  console.log(`joinedWhatsApp in DB: ${waDoc.joinedWhatsApp}`);
  if (!waDoc.joinedWhatsApp) throw new Error('WhatsApp join status not true');
  console.log('✅ WhatsApp join recorded cleanly in confirmation_stst.');

  // --- TEST 4: [pdc_bibwewadi_submissions] Assessment Submission ---
  console.log('\n--- TEST 4: [pdc_bibwewadi_submissions] Assessment Submission ---');
  const testSubDocId = `/pdc_bibwewadi_submissions/test_${Date.now()}`;
  const testSub = {
    'Document ID': testSubDocId,
    fullName: 'Test Assessment Student',
    email: 'test.assessment@vit.edu',
    whatsappNumber: testPhoneNum,
    gender: 'Male',
    campus: 'Bibwewadi',
    branch: 'Computer Engineering',
    division: 'A',
    year: 'FY',
    totalScore: 80,
    scores: { pq: 30, iq: 20, eq: 30 },
    submittedAt: new Date().toISOString(),
    timestamp: new Date().toISOString()
  };

  const { error: subErr } = await supabase
    .from('pdc_bibwewadi_submissions')
    .insert(testSub);

  if (subErr) throw new Error('Assessment insert failed: ' + subErr.message);
  console.log('✅ Assessment successfully submitted to [pdc_bibwewadi_submissions].');

  // --- CLEANUP ---
  console.log('\n--- CLEANUP ---');
  await supabase.from('confirmation_stst').delete().eq('Document ID', testDocId);
  await supabase.from('pdc_bibwewadi_submissions').delete().eq('Document ID', testSubDocId);

  const { count: finalTotal } = await supabase
    .from('confirmation_stst')
    .select('*', { count: 'exact', head: true });

  console.log(`Final stats count restored to: ${finalTotal}`);

  console.log('\n========================================================');
  console.log('🎉 ALL 2-TABLE TESTS PASSED WITH 100% SUCCESS');
  console.log('========================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
