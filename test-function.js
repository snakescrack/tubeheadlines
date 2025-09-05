const fs = require('fs');
const path = require('path');

// Simple test of the addToWaitlist function
const functionPath = path.join(__dirname, 'netlify', 'functions', 'addToWaitlist.js');

// Mock event object
const mockEvent = {
  httpMethod: 'POST',
  body: JSON.stringify({
    name: 'Test Creator',
    email: 'test@example.com',
    channelUrl: 'https://youtube.com/testchannel'
  })
};

// Mock context object
const mockContext = {};

console.log('Testing addToWaitlist function...');

// Read and execute the function
try {
  const func = require(functionPath);
  
  // Call the handler
  func.handler(mockEvent, mockContext)
    .then(result => {
      console.log('Function result:', result);
    })
    .catch(error => {
      console.error('Function error:', error);
    });
} catch (error) {
  console.error('Error loading function:', error);
}
