"use client";
import { useRef, useState } from "react";
import { BookIcon, BrainIcon, TargetIcon, ChartIcon } from "@/components/Icons";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="container py-16">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              COGNITIVE SYNTHESIS ENGINE
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Advanced AI Research Assistant for CSS Examination Preparation
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-teal-500 border border-teal-400"></div>
                <span className="text-gray-300">Knowledge Graph Integration</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 border border-blue-400"></div>
                <span className="text-gray-300">Syllabus-Grounded Responses</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 border border-purple-400"></div>
                <span className="text-gray-300">Exam-Style Formatting</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Knowledge Base Status */}
          <div className="bg-white border-2 border-gray-200 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-teal-100 border-2 border-teal-200 p-3">
                <BookIcon className="w-6 h-6 text-teal-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-gray-900">KNOWLEDGE BASE INTEGRATION</h3>
                <p className="text-gray-600 mb-4">
                  Initialize the knowledge synthesis engine with CSS-specific documents for enhanced contextual responses.
                </p>
                <button 
                  onClick={processPDF}
                  disabled={processingPDF}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 disabled:opacity-50 transition-all font-bold border-2 border-gray-900"
                >
                  {processingPDF ? "PROCESSING KNOWLEDGE BASE..." : "INITIALIZE KNOWLEDGE GRAPH"}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Query Interface */}
          <div className="bg-white border-2 border-gray-200 overflow-hidden">
            <div className="bg-teal-600 text-white p-6 border-b-2 border-teal-700">
              <h2 className="text-xl font-bold mb-2">INTELLIGENT QUERY INTERFACE</h2>
              <p className="text-teal-100">Ask complex questions and receive exam-style responses with citations</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={onAsk} className="mb-6">
                <div className="relative">
                  <textarea
                    className="w-full border-2 border-gray-300 px-4 py-4 pr-24 focus:outline-none focus:border-teal-500 resize-none bg-white"
                    placeholder="Enter your CSS syllabus question... (e.g., 'Analyze the constitutional development of Pakistan from 1947 to 1973 with emphasis on key challenges faced during this period.')"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    rows={4}
                  />
                  <button 
                    disabled={loading || !input.trim()} 
                    className="absolute bottom-4 right-4 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 disabled:opacity-50 transition-all font-bold border-2 border-gray-900"
                  >
                    {loading ? "SYNTHESIZING..." : "ANALYZE"}
                  </button>
                </div>
              </form>

              {/* Enhanced Response Display */}
              <div className="border-2 border-gray-200 min-h-[300px] bg-gray-50">
                <div className="bg-gray-200 px-4 py-3 border-b-2 border-gray-300 flex items-center justify-between">
                  <span className="font-bold text-gray-900">AI COGNITIVE RESPONSE</span>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {answer && (
                      <>
                        <span className="w-3 h-3 bg-teal-500 border border-teal-400"></span>
                        <span className="font-bold">RESPONSE GENERATED</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin h-12 w-12 border-b-4 border-teal-600 mx-auto mb-4"></div>
                        <p className="text-gray-700 font-bold">COGNITIVE SYNTHESIS IN PROGRESS...</p>
                        <p className="text-sm text-gray-600 mt-2">Analyzing syllabus context and generating exam-style response</p>
                      </div>
                    </div>
                  ) : answer ? (
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{answer}</div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BrainIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg mb-2 font-bold text-gray-700">READY FOR COGNITIVE ANALYSIS</p>
                      <p className="text-sm">Ask a question to receive an intelligent, exam-formatted response</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Guidelines */}
              <div className="mt-6 bg-teal-50 border-2 border-teal-200 p-4">
                <h4 className="font-bold text-teal-900 mb-2">OPTIMIZATION TIPS</h4>
                <ul className="text-sm text-teal-800 space-y-1">
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
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-900">
                <TargetIcon className="w-5 h-5 text-teal-600" />
                LEARNING INTEGRATION
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Continue your learning journey with structured pathways and adaptive streams.
              </p>
              <a href="/learning-pathways" className="text-teal-600 hover:text-teal-700 font-bold text-sm border-b-2 border-teal-600 hover:border-teal-700 pb-1">
                BROWSE LEARNING PATHWAYS →
              </a>
            </div>
            
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-900">
                <ChartIcon className="w-5 h-5 text-teal-600" />
                PROGRESS TRACKING
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Monitor your learning analytics and performance metrics.
              </p>
              <a href="/dashboard" className="text-teal-600 hover:text-teal-700 font-bold text-sm border-b-2 border-teal-600 hover:border-teal-700 pb-1">
                VIEW DASHBOARD →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
