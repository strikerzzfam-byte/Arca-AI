// Simple test script to check backend functionality
async function testBackend() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('Testing backend endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const health = await healthRes.json();
    console.log('Health:', health);
    
    // Test AI endpoint
    console.log('\n2. Testing AI endpoint...');
    const aiRes = await fetch(`${baseUrl}/api/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Create a simple hello world page' })
    });
    
    if (aiRes.ok) {
      const aiData = await aiRes.json();
      console.log('AI Response type:', aiData.type);
      console.log('AI Response length:', aiData.content?.length || 0);
    } else {
      console.error('AI endpoint failed:', aiRes.status, await aiRes.text());
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run if this file is executed directly
if (typeof window === 'undefined') {
  testBackend();
}