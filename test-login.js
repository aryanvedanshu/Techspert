// Simple test to trigger authentication logging
const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    const response = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@techspert.com',
      password: 'admin123456'
    });
    console.log('Login successful:', response.data);
  } catch (error) {
    console.log('Login failed:', error.response?.data || error.message);
  }
}

testAdminLogin();
