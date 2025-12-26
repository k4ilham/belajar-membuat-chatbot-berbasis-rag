
async function testN8n() {
  const url = 'https://n8n.inercorp.com/webhook/a79b8372-e5c7-406e-a523-2a10c181082f/chat';
  try {
    console.log('Testing URL:', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chatInput: 'Hello, this is a test', 
        sessionId: 'test-session-' + Date.now() 
      })
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response Type:', res.headers.get('content-type'));
    console.log('Response Length:', text.length);
    if (text.length < 500) console.log('Response:', text);
  } catch (e) {
    console.error('Error:', e);
  }
}

testN8n();
