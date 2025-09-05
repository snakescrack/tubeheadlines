const path = require('path');

// Add the netlify/functions directory to the module path
const functionsDir = path.join(__dirname, 'netlify', 'functions');

// Mock the environment
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.FIREBASE_PRIVATE_KEY = 'test-key';

// Test the function directly
console.log('Testing addToWaitlist function...');

try {
  // This will test if the function can be loaded without errors
  const func = require('./netlify/functions/addToWaitlist.js');
  console.log('Function loaded successfully');
  
  // Create a mock event
  const mockEvent = {
    httpMethod: 'POST',
    body: JSON.stringify({
      name: 'Test Creator',
      email: 'test@example.com',
      channelUrl: 'https://youtube.com/testchannel'
    })
  };
  
  // Test the handler
  if (func.handler) {
    console.log('Handler function found, testing...');
    func.handler(mockEvent, {})
      .then(result => {
        console.log('Success:', JSON.stringify(result, null, 2));
      })
      .catch(error => {
        console.log('Error:', error.message);
      });
  } else {
    console.log('No handler function found');
  }
} catch (error) {
  console.log('Error loading function:', error.message);
  console.log('Stack:', error.stack);
}
