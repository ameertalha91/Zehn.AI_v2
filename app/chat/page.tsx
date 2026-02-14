"use client";
import { useRef, useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingPDF, setProcessingPDF] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function onAsk(e: React.FormEvent) {
    e.preventDefault();
    setAnswer("");
    setLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({ message: input }),
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Parse JSON response instead of streaming
      const data = await res.json();
      
      if (data.success) {
        setAnswer(data.response);
      } else {
        setAnswer("Sorry, there was an error processing your request.");
      }
      
    } catch (error) {
      console.error('Error:', error);
      setAnswer("Sorry, there was an error processing your request.");
    } finally {
      setLoading(false);
    }
  }

  // Function to process the PDF
  async function processPDF() {
    setProcessingPDF(true);
    try {
      const requestBody = { 
        action: 'process',
        timestamp: Date.now()
      };
      console.log('Sending request:', {
        url: '/api/process-document',
        body: requestBody
      });
      
      const res = await fetch('/api/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response details:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        url: res.url
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Full error response:', errorText);
        throw new Error(`API error (${res.status}): ${res.statusText}`);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType}`);
      }
      
      const data = await res.json();
      console.log('PDF Processing Result:', data);
      
      if (data.success) {
        alert(`✅ Success! ${data.message}`);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
      
    } catch (error) {
      console.error('Detailed error:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.constructor.name : typeof error
      });
      alert(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setProcessingPDF(false);
    }
  }

  return (
    <div className="container py-10 space-y-4">
      <h1 className="text-2xl font-semibold">Research Chat (CSS)</h1>
      
      {/* PDF Processing Test Button */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800 mb-2">
          <strong>One-time setup:</strong> Process the Pakistan Studies PDF first
        </p>
        <button 
          onClick={processPDF}
          disabled={processingPDF}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {processingPDF ? "Processing PDF..." : "Process Pakistan Studies PDF"}
        </button>
      </div>

      <form onSubmit={onAsk} className="flex gap-2">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Ask a CSS syllabus question…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button disabled={loading} className="btn-primary">
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>
      <div className="card p-4 whitespace-pre-wrap min-h-[160px]">
        {answer || "Answer will appear here…"}
      </div>
      <p className="text-xs text-gray-500">
        Answers are grounded in syllabus context when available and formatted like exam responses.
      </p>
    </div>
  );
}