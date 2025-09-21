
import Link from 'next/link';

export default function Home(){
  return (
    <div>
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 text-white">
        <div className="container py-20">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              The CSS Intelligence
              <span className="text-teal-400"> Cloud</span>
            </h1>
            <p className="text-xl text-gray-300 mb-4 max-w-3xl">
              Where aspiring civil servants find infinite scale to master CSS examination preparation
            </p>
            <p className="text-gray-400 mb-10 max-w-2xl">
              AI-Powered Learning · Adaptive Pathways · Cognitive Assessment · Intelligence Amplification
            </p>
            <div className="flex gap-4">
              <Link className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors" href="/learning-pathways">
                Launch Learning Platform
              </Link>
              <Link className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-8 py-4 rounded-lg font-semibold text-lg transition-colors" href="/cognitive-assistant">
                Try Ilmi thotbot
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Advanced Learning Infrastructure
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Get the most sophisticated and highest-performing CSS preparation platform
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Link href="/learning-pathways" className="group">
              <div className="bg-gray-50 hover:bg-gray-100 p-8 rounded-2xl transition-all border border-gray-200 hover:border-teal-300 hover:shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                    Course Catalog & Pathways
                  </h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Comprehensive course catalog featuring structured learning pathways for all CSS subjects. 
                  Interactive video libraries, AI-powered assessments, and adaptive difficulty progression.
                </p>
                <div className="flex items-center text-teal-600 font-semibold group-hover:text-teal-700">
                  <span>Browse Course Catalog</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
            
            <Link href="/cognitive-assistant" className="group">
              <div className="bg-gray-50 hover:bg-gray-100 p-8 rounded-2xl transition-all border border-gray-200 hover:border-purple-300 hover:shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Ilmi thotbot
                  </h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Advanced AI research assistant trained on complete CSS syllabus. Generate exam-style responses, 
                  conduct policy analysis, and access intelligent document processing with citation support.
                </p>
                <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                  <span>Launch Ilmi thotbot</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Assignment Management Section */}
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto mt-12">
            <Link href="/assignments" className="group">
              <div className="bg-gray-50 hover:bg-gray-100 p-8 rounded-2xl transition-all border border-gray-200 hover:border-blue-300 hover:shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Assignment Management
                  </h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Create and manage assignments with intelligent PDF processing. Teachers can review submissions, 
                  provide detailed feedback, and track student progress with automated grading support.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  <span>Manage Assignments</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
            
            <Link href="/student-assignments" className="group">
              <div className="bg-gray-50 hover:bg-gray-100 p-8 rounded-2xl transition-all border border-gray-200 hover:border-green-300 hover:shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    Submit Assignments
                  </h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Upload PDF assignments with automatic text extraction. Track submission status, 
                  receive teacher feedback, and view grades with detailed performance analytics.
                </p>
                <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700">
                  <span>View My Assignments</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-16">Platform Intelligence Metrics</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-teal-400 mb-2">8</div>
              <div className="text-gray-400 text-sm">CSS Subjects</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-2">100+</div>
              <div className="text-gray-400 text-sm">Video Lectures</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-2">AI</div>
              <div className="text-gray-400 text-sm">Powered Learning</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-400 text-sm">Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
