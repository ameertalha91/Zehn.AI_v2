export async function POST(req: Request) {
  const { message } = await req.json();
  
  // Use API URL from environment, fallback to localhost for development
  const apiUrl = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  const apiEndpoint = apiUrl.startsWith('http') ? `${apiUrl}/chat/` : `http://${apiUrl}/chat/`;
  
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: message })
  });
  
  const data = await response.json();
  
  return new Response(JSON.stringify({
    success: true,
    response: data.answer
  }));
}
