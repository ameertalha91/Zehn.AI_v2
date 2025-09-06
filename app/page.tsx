
import Link from 'next/link';
export default function Home(){
  return (
    <div>
      <header className="bg-gradient-to-br from-white to-subtle">
        <div className="container py-16">
          <h1 className="text-4xl font-bold mb-2">Zehn Learning Ecosystem</h1>
          <p className="text-gray-600 max-w-2xl mb-2">Advanced AI-Powered CSS Examination Preparation</p>
          <p className="text-gray-500 max-w-2xl">Adaptive Learning Streams · Cognitive Intelligence · Competency Validation</p>
          <div className="mt-8 flex gap-4">
            <Link className="btn-primary text-lg px-6 py-3" href="/learning-pathways">Explore Learning Pathways</Link>
            <Link className="btn-primary bg-purple-600 hover:bg-purple-700 text-lg px-6 py-3" href="/cognitive-assistant">AI Cognitive Assistant</Link>
          </div>
        </div>
      </header>
      
      {/* Advanced Features Section */}
      <div className="container py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Advanced Learning Technologies</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Link href="/learning-pathways" className="card p-8 hover:shadow-xl transition-all group border-l-4 border-blue-500">
            <h3 className="font-bold text-xl mb-3 group-hover:text-blue-600">🎯 Adaptive Learning Streams</h3>
            <p className="text-gray-600 mb-4">Experience interactive knowledge streams with AI-powered quiz generation every 5 minutes. Adaptive difficulty based on your comprehension velocity.</p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>Access Learning Pathways</span>
              <span className="ml-2">→</span>
            </div>
          </Link>
          
          <Link href="/cognitive-assistant" className="card p-8 hover:shadow-xl transition-all group border-l-4 border-purple-500">
            <h3 className="font-bold text-xl mb-3 group-hover:text-purple-600">� Cognitive Synthesis Engine</h3>
            <p className="text-gray-600 mb-4">Advanced AI research assistant trained on CSS syllabus. Generate exam-style responses with proper citations and knowledge graph integration.</p>
            <div className="flex items-center text-purple-600 font-medium">
              <span>Launch Cognitive Assistant</span>
              <span className="ml-2">→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Platform Capabilities */}
      <div className="bg-gray-50 py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-12">Platform Intelligence Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">Learning Analytics Engine</h3>
              <p className="text-sm text-gray-600">Real-time progress tracking with cognitive load optimization and performance benchmarking.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎪</span>
              </div>
              <h3 className="font-semibold mb-2">Competency Validation Suite</h3>
              <p className="text-sm text-gray-600">Intelligent document scanning, automated feedback generation, and assessment orchestration.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold mb-2">Institutional Command Center</h3>
              <p className="text-sm text-gray-600">Complete educator toolkit with pathway architect, scholar analytics, and insight dashboards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
