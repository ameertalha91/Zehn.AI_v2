export async function POST(req: Request) {
  const { message } = await req.json();
  
  const response = await fetch('http://localhost:8001/chat/', {
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
