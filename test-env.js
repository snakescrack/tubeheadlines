// Test script to check environment variables
console.log('Environment Variables Check:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : 'MISSING');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'MISSING');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'MISSING');

// Test firebase-admin import
async function testFirebaseImport() {
  try {
    const admin = await import('firebase-admin');
    console.log('firebase-admin import: SUCCESS');
    console.log('firebase-admin version:', admin.default ? 'ESM' : 'CommonJS');
  } catch (error) {
    console.log('firebase-admin import: FAILED');
    console.error(error.message);
  }
}

testFirebaseImport();
