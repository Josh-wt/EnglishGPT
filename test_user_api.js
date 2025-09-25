#!/usr/bin/env node

/**
 * Test script to check user data from the backend API
 */

const https = require('https');
const http = require('http');

const userId = 'bbb1f94e-12bf-45fa-b962-35591c34bf33';
const apiUrl = 'http://localhost:5000/api/users/' + userId;

console.log('🔍 Testing user API endpoint...');
console.log('📡 URL:', apiUrl);
console.log('👤 User ID:', userId);

const request = http.get(apiUrl, (response) => {
  let data = '';
  
  console.log('📊 Response status:', response.statusCode);
  console.log('📋 Response headers:', response.headers);
  
  response.on('data', (chunk) => {
    data += chunk;
  });
  
  response.on('end', () => {
    console.log('📄 Response body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.user) {
        console.log('\n🔍 User data analysis:');
        console.log('- current_plan:', jsonData.user.current_plan);
        console.log('- credits:', jsonData.user.credits);
        console.log('- questions_marked:', jsonData.user.questions_marked);
        console.log('- academic_level:', jsonData.user.academic_level);
      }
    } catch (error) {
      console.log('❌ Failed to parse JSON:', error.message);
      console.log('Raw data:', data);
    }
  });
});

request.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

request.setTimeout(10000, () => {
  console.error('❌ Request timeout');
  request.destroy();
});
