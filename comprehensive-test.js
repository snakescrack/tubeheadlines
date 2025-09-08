// Since the project is using ES modules ("type": "module" in package.json),
// we cannot use 'require'. This script is updated to use dynamic import().

import path from 'path';
import { promises as fs } from 'fs';

// Mock the environment for the test
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.FIREBASE_PRIVATE_KEY = 'test-key';

async function runTest() {
  console.log('Testing addToWaitlist function...');

  try {
    // Dynamically import the function to test it
    const functionPath = path.resolve('./netlify/functions/addToWaitlist.js');
    const { handler } = await import(`file://${functionPath}`);
    console.log('Function loaded successfully.');

    // Create a mock event to simulate a form submission
    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        name: 'Test Creator',
        email: 'test@example.com',
        channelUrl: 'https://youtube.com/testchannel'
      })
    };

    // Test the handler function
    if (handler) {
      console.log('Handler function found, executing test...');
      const result = await handler(mockEvent, {});
      console.log('Success:', JSON.stringify(result, null, 2));
    } else {
      console.log('Error: No handler function was exported from the module.');
    }
  } catch (error) {
    console.error('Error during test execution:', error);
  }
}

runTest();
