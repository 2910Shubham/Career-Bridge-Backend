// Simple test script to verify cookie functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testLogin() {
    try {
        console.log('Testing login...');
        
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        // Check if cookies are set
        const cookies = response.headers.get('set-cookie');
        console.log('Cookies set:', cookies);
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

async function testAuthCheck() {
    try {
        console.log('\nTesting auth check...');
        
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
            method: 'GET',
            credentials: 'include'
        });
        
        console.log('Auth check status:', response.status);
        const data = await response.json();
        console.log('Auth check data:', data);
        
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

// Run tests
testLogin().then(() => {
    setTimeout(testAuthCheck, 1000);
}); 