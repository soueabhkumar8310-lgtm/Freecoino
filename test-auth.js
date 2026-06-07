// Test script to debug authentication
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uqxxpeirvnuphabkbvnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeHhwZWlydm51cGhhYmtidm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMTc1ODMsImV4cCI6MjA5Mzg5MzU4M30.d1iTzAlUHYpL5wVw5JBx9lBUsnUfJh6fQqMhy8CLVsA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔍 Testing Authentication...\n');

  // Test 1: Check connection
  console.log('✅ Supabase URL:', supabaseUrl);
  console.log('✅ Anon Key:', supabaseAnonKey.substring(0, 30) + '...\n');

  // Test 2: Try to login with existing user
  console.log('📝 Test 1: Login with umag2587@gmail.com');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'umag2587@gmail.com',
      password: 'test123', // Replace with actual password
    });

    if (error) {
      console.log('❌ Login Error:', error.message);
      console.log('   Error Code:', error.status);
      console.log('   Error Name:', error.name);
    } else {
      console.log('✅ Login Success!');
      console.log('   User ID:', data.user?.id);
      console.log('   Email:', data.user?.email);
    }
  } catch (err) {
    console.log('❌ Unexpected Error:', err.message);
  }

  console.log('\n---\n');

  // Test 3: Check user status in database
  console.log('📝 Test 2: Check user confirmation status');
  try {
    const { data: users, error } = await supabase
      .from('auth.users')
      .select('email, email_confirmed_at')
      .eq('email', 'umag2587@gmail.com');

    if (error) {
      console.log('❌ Database Error:', error.message);
    } else {
      console.log('✅ User found:', users);
    }
  } catch (err) {
    console.log('❌ Database Error:', err.message);
  }

  console.log('\n---\n');

  // Test 4: Try signup with new email
  console.log('📝 Test 3: Signup test');
  const testEmail = `test-${Date.now()}@example.com`;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456',
      options: {
        data: {
          display_name: 'Test User',
        },
      },
    });

    if (error) {
      console.log('❌ Signup Error:', error.message);
      console.log('   Error Code:', error.status);
    } else {
      console.log('✅ Signup Success!');
      console.log('   User ID:', data.user?.id);
      console.log('   Email Confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    }
  } catch (err) {
    console.log('❌ Unexpected Error:', err.message);
  }
}

testAuth().then(() => {
  console.log('\n✅ Tests completed!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
