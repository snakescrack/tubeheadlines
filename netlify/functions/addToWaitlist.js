import crypto from 'crypto';
crypto.setEngine('node:crypto', 'legacy');

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Log to console in production, don't write to filesystem
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

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
      log('Firebase initialized successfully.');
      console.log('Firebase initialized successfully');
    } catch (error) {
      log(`Firebase initialization error: ${error.message}`);
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }
}

export const handler = async (event, context) => {
  log('Handler started.');
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
    initializeFirebase();
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
    
    log(`Successfully added entry with ID: ${docRef.id}`);
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
    log(`Error adding to waitlist: ${error.message}`);
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
