// Script to create a new Firebase web app and get a fresh API key
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK with your service account
// You'll need to download your service account key from Firebase console
// Project Settings > Service Accounts > Generate new private key
try {
  // Try to initialize with environment variables first
  initializeApp({
    projectId: 'tubeheadlines'
  });
  
  console.log('Successfully initialized Firebase Admin SDK');
  console.log('\nTo create a new API key:');
  console.log('1. Go to https://console.firebase.google.com/project/tubeheadlines/overview');
  console.log('2. Click "Add app" and select the web platform (</> icon)');
  console.log('3. Register the app with a name like "TubeHeadlines-Web-New"');
  console.log('4. Copy the new firebaseConfig object that contains a fresh API key');
  console.log('5. Update your Netlify environment variables with this new API key');
  
} catch (error) {
  console.error('Error initializing Firebase:', error);
  console.log('\nPlease follow these manual steps:');
  console.log('1. Go to https://console.firebase.google.com/project/tubeheadlines/overview');
  console.log('2. Click "Add app" and select the web platform (</> icon)');
  console.log('3. Register the app with a name like "TubeHeadlines-Web-New"');
  console.log('4. Copy the new firebaseConfig object that contains a fresh API key');
  console.log('5. Update your Netlify environment variables with this new API key');
}
