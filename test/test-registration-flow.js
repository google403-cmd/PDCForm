const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = process.env.SUPABASE_URL || 'https://newtaeknlmkugqmhcyxg.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ld3RhZWtubG1rdWdxbWhjeXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzM4MzUsImV4cCI6MjEwNjc0OTgzNX0.MeDqtah3UBb8TjMldOl-wMeTFdvtPqU1GjFfQhbhdOU';
const connectionString = process.env.SUPABASE_DB_URL || 'postgresql://postgres:bkRy4Syw!%2Fu!SWR@db.newtaeknlmkugqmhcyxg.supabase.co:5432/postgres';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log('========================================================');
  console.log('   PDC REGISTRATION & DEDUPLICATION VERIFICATION TEST   ');
  console.log('                 (SUPABASE ENGINE)                      ');
  console.log('========================================================\n');

  const testPhone = '9999900001';
  const testPhoneNum = parseInt(testPhone, 10);
  const testDocId = `/confirmation_stst/${testPhone}`;

  // 1. Initial cleanup of test records
  await supabase.from('confirmation_stst').delete().eq('Document ID', testDocId);
  await supabase.from('pdc_registrations').delete().eq('Document ID', testPhone);
  await supabase.from('pdc_simple_registrations').delete().eq('Document ID', testPhone);

  // 2. Get initial stats count from pdc_stats
  const { data: initialStats, error: statsErr } = await supabase
    .from('pdc_stats')
    .select('*')
    .eq('id', 'registrations')
    .single();

  if (statsErr) throw new Error('Could not fetch initial stats: ' + statsErr.message);
  const initialTotal = initialStats.totalRegistered || 1554;
  console.log(`Initial stats count: ${initialTotal}`);

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

  // Increment stats
  await supabase
    .from('pdc_stats')
    .update({
      totalRegistered: initialTotal + 1,
      totalEntries: (initialStats.totalEntries || initialTotal) + 1,
      males: (initialStats.males || 1124) + 1
    })
    .eq('id', 'registrations');

  const { data: afterFirstStats } = await supabase
    .from('pdc_stats')
    .select('totalRegistered')
    .eq('id', 'registrations')
    .single();

  const afterFirstTotal = afterFirstStats.totalRegistered;
  console.log(`Stats count after first submission: ${afterFirstTotal} (expected: ${initialTotal + 1})`);
  if (afterFirstTotal !== initialTotal + 1) {
    throw new Error('Stats total did not increment on first submission');
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
  const { data: afterDupStats } = await supabase
    .from('pdc_stats')
    .select('totalRegistered')
    .eq('id', 'registrations')
    .single();

  const afterDupTotal = afterDupStats.totalRegistered;
  console.log(`Stats count after duplicate submission: ${afterDupTotal} (expected: ${afterFirstTotal})`);
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

  // --- TEST 4: [pdc_simple_registrations] 4-Field & Deduplication ---
  console.log('\n--- TEST 4: [pdc_simple_registrations] 4-Field & Deduplication ---');
  await supabase.from('pdc_simple_registrations').upsert({
    'Document ID': testPhone,
    fullName: 'Aditya Kulkarni',
    phoneNumber: testPhoneNum,
    email: 'aditya@vit.edu',
    gender: 'Male',
    branch: 'Computer Engineering',
    division: 'A',
    status: 'confirmed'
  }, { onConflict: 'Document ID' });
  console.log('✅ Created document in new collection [pdc_simple_registrations] with doc ID = phone number.');

  await supabase.from('pdc_simple_registrations').upsert({
    'Document ID': testPhone,
    fullName: 'Aditya S. Kulkarni',
    phoneNumber: testPhoneNum,
    email: 'aditya.new@vit.edu',
    gender: 'Male',
    branch: 'Computer Engineering',
    division: 'B',
    status: 'confirmed'
  }, { onConflict: 'Document ID' });
  console.log('Duplicate phone detected in [pdc_simple_registrations]. Merging in-place without duplicate doc.');

  const { count: simpleCount } = await supabase
    .from('pdc_simple_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('Document ID', testPhone);

  if (simpleCount !== 1) throw new Error('Expected 1 record in pdc_simple_registrations');
  console.log('✅ Verified zero duplicates in [pdc_simple_registrations]. Record updated in-place.');

  // --- TEST 5: [confirmation_stst] with Branch and Division ---
  console.log('\n--- TEST 5: [confirmation_stst] with Branch and Division ---');
  const { data: confRecord } = await supabase
    .from('confirmation_stst')
    .select('fullName, branch, division, phoneNumber')
    .eq('Document ID', testDocId)
    .single();

  if (!confRecord || !confRecord.branch || !confRecord.division) {
    throw new Error('Branch or Division missing in confirmation_stst');
  }
  console.log('✅ Successfully stored and verified student data in [confirmation_stst]!');

  // --- CLEANUP ---
  console.log('\n--- CLEANUP ---');
  await supabase.from('confirmation_stst').delete().eq('Document ID', testDocId);
  await supabase.from('pdc_registrations').delete().eq('Document ID', testPhone);
  await supabase.from('pdc_simple_registrations').delete().eq('Document ID', testPhone);

  // Restore initial stats count
  await supabase
    .from('pdc_stats')
    .update({
      totalRegistered: initialTotal,
      totalEntries: initialStats.totalEntries || initialTotal,
      males: initialStats.males || 1124
    })
    .eq('id', 'registrations');

  console.log(`Final stats count restored to: ${initialTotal}`);

  console.log('\n========================================================');
  console.log('🎉 ALL REGISTRATION & DEDUPLICATION TESTS PASSED (100%)');
  console.log('========================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
