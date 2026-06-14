// Test Email Script
const { Resend } = require('resend');

// Manually set API key (since we can't load .env.local easily)
const RESEND_API_KEY = 're_b6wv427H_8auMEFcHndquMDWrZ3wwxRua';

const resend = new Resend(RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('Testing Resend API...');
    console.log('API Key:', RESEND_API_KEY ? 'Found ✅' : 'Missing ❌');
    
    const result = await resend.emails.send({
      from: 'Freecoino <onboarding@resend.dev>',
      to: 'soueabhkumar8310@gmail.com',
      subject: 'Test Email from Freecoino',
      html: '<h1>Test Email</h1><p>If you receive this, email system is working! ✅</p>',
    });

    console.log('✅ Email sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Email send failed:');
    console.error(error);
  }
}

testEmail();
