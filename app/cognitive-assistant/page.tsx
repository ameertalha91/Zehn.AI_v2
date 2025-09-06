"use client";
import { useRef, useState } from "react";

export default function CognitiveAssistant() {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Detailed error:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      });
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setProcessingPDF(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Advanced Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🧠 Cognitive Synthesis Engine
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Advanced AI Research Assistant for CSS Examination Preparation
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Knowledge Graph Integration Active</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Syllabus-Grounded Responses</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Exam-Style Formatting</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Knowledge Base Status */}
          <div className="bg-white rounded-lg p-6 mb-8 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Knowledge Base Integration</h3>
                <p className="text-gray-600 mb-4">
                  Initialize the knowledge synthesis engine with CSS-specific documents for enhanced contextual responses.
                </p>
                <button 
                  onClick={processPDF}
                  disabled={processingPDF}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 transition-all font-medium"
                >
                  {processingPDF ? "🔄 Processing Knowledge Base..." : "🚀 Initialize Knowledge Graph"}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Query Interface */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <h2 className="text-xl font-semibold mb-2">Intelligent Query Interface</h2>
              <p className="text-purple-100">Ask complex questions and receive exam-style responses with citations</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={onAsk} className="mb-6">
                <div className="relative">
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-4 pr-24 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Enter your CSS syllabus question... (e.g., 'Analyze the constitutional development of Pakistan from 1947 to 1973 with emphasis on key challenges faced during this period.')"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    rows={4}
                  />
                  <button 
                    disabled={loading || !input.trim()} 
                    className="absolute bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-all font-medium"
                  >
                    {loading ? "🧠 Synthesizing..." : "🔍 Analyze"}
                  </button>
                </div>
              </form>

              {/* Enhanced Response Display */}
              <div className="border border-gray-200 rounded-lg min-h-[300px] bg-gray-50">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <span className="font-medium text-gray-700">AI Cognitive Response</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {answer && (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Response Generated</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cognitive synthesis in progress...</p>
                        <p className="text-sm text-gray-500 mt-2">Analyzing syllabus context and generating exam-style response</p>
                      </div>
                    </div>
                  ) : answer ? (
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{answer}</div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-4 block">💭</span>
                      <p className="text-lg mb-2">Ready for Cognitive Analysis</p>
                      <p className="text-sm">Ask a question to receive an intelligent, exam-formatted response</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Guidelines */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Optimization Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Frame questions in CSS examination style for best results</li>
                  <li>• Include specific time periods, events, or concepts for detailed analysis</li>
                  <li>• Use analytical terms like "evaluate," "assess," "compare," or "analyze"</li>
                  <li>• Responses are formatted in intro-body-conclusion structure</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Access Links */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>🎯</span>
                Learning Integration
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Continue your learning journey with structured pathways and adaptive streams.
              </p>
              <a href="/learning-pathways" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Browse Learning Pathways →
              </a>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>📊</span>
                Progress Tracking
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Monitor your learning analytics and performance metrics.
              </p>
              <a href="/scholar-dashboard" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                View Scholar Dashboard →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
