const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let db;

function initializeFirebase() {
  if (!db) {
    try {
      if (getApps().length === 0) {
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        };

        initializeApp({
          credential: cert(serviceAccount)
        });
      }
      
      db = getFirestore();
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse request body
    const { name, email, channelUrl } = JSON.parse(event.body);

    // Validate required fields
    if (!name || !channelUrl) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ error: 'Missing required fields: name and channelUrl are required.' })
      };
    }

    // Create entry object
    const entry = {
      name: name.trim(),
      channelUrl: channelUrl.trim(),
      submittedAt: new Date().toISOString(),
    };

    // Add email if provided
    if (email && email.trim()) {
      entry.email = email.trim();
    }

    // Add to Firestore
    const docRef = await db.collection('waitlist').add(entry);
    
    console.log('Successfully added entry with ID:', docRef.id);

    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify({ 
        message: 'Successfully added to waitlist!',
        id: docRef.id 
      })
    };

  } catch (error) {
    console.error('Error adding to waitlist:', error);
    
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        error: 'Failed to add to waitlist. Please try again.',
        details: error.message 
      })
    };
  }
};
