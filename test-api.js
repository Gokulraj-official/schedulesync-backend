const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testSignup() {
  try {
    console.log('Testing Signup...');
    const response = await axios.post(`${API_URL}/auth/signup`, {
      name: 'Test Faculty',
      email: 'testfaculty@example.com',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science'
    });
    console.log('✅ Signup Success:', response.data);
    return response.data.token;
  } catch (error) {
    console.log('❌ Signup Error:', error.response?.data || error.message);
    return null;
  }
}

async function testLogin() {
  try {
    console.log('\nTesting Login...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'testfaculty@example.com',
      password: 'password123'
    });
    console.log('✅ Login Success:', response.data);
    return response.data.token;
  } catch (error) {
    console.log('❌ Login Error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetMe(token) {
  try {
    console.log('\nTesting Get Current User...');
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get Me Success:', response.data);
  } catch (error) {
    console.log('❌ Get Me Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('=== Testing SchedulSync Backend API ===\n');
  
  const signupToken = await testSignup();
  
  if (signupToken) {
    await testGetMe(signupToken);
  }
  
  await testLogin();
  
  console.log('\n=== Tests Complete ===');
}

runTests();
