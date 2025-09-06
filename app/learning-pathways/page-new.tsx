import Link from 'next/link';

interface LearningPathway {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: string;
  students: number;
  difficulty: string;
  thumbnail: string;
  outcomes: string[];
  prerequisites: string[];
}

export default function LearningPathways() {
  const pathways: LearningPathway[] = [
    {
      id: 'css-excellence-pathway',
      title: 'CSS Excellence Mastery Pathway',
      description: 'Comprehensive preparation for Pakistan Civil Services examination with focus on constitutional development, political evolution, and governance structures.',
      category: 'Pakistan Studies',
      instructor: 'Dr. Ahmed Hassan Khan',
      duration: '180 hours',
      students: 245,
      difficulty: 'Advanced',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      outcomes: [
        'Master constitutional development timeline',
        'Analyze political evolution patterns',
        'Understand governance structures',
        'Apply analytical thinking to policy questions'
      ],
      prerequisites: [
        'Basic knowledge of Pakistan history',
        'Understanding of political systems',
        'Critical analysis skills'
      ]
    },
    {
      id: 'diplomatic-mastery-track',
      title: 'Diplomatic Intelligence Mastery Track',
      description: 'Advanced curriculum covering international relations, diplomatic protocols, and foreign policy analysis for aspiring diplomats.',
      category: 'International Relations',
      instructor: 'Ambassador Sarah Malik',
      duration: '150 hours',
      students: 189,
      difficulty: 'Advanced',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      outcomes: [
        'Understand international law frameworks',
        'Analyze diplomatic strategies',
        'Master negotiation techniques',
        'Apply foreign policy analysis'
      ],
      prerequisites: [
        'International relations basics',
        'Understanding of global politics',
        'Research and analysis skills'
      ]
    },
    {
      id: 'current-affairs-intelligence',
      title: 'Current Affairs Intelligence Journey',
      description: 'Dynamic learning pathway focusing on contemporary issues, policy analysis, and strategic thinking for competitive examinations.',
      category: 'Current Affairs',
      instructor: 'Prof. Muhammad Ali Shah',
      duration: '120 hours',
      students: 312,
      difficulty: 'Intermediate',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      outcomes: [
        'Stay updated with current developments',
        'Analyze policy implications',
        'Develop strategic thinking',
        'Master exam-style responses'
      ],
      prerequisites: [
        'Basic awareness of current events',
        'Reading comprehension skills',
        'Analytical mindset'
      ]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-blue-600 bg-blue-100';
      case 'Advanced': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              🧠 Advanced Learning Pathways
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Discover sophisticated, AI-powered learning journeys designed for CSS examination excellence. 
              Our intelligent pathway system adapts to your learning style and accelerates knowledge acquisition.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/cognitive-assistant" className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                🤖 Cognitive Assistant
              </Link>
              <Link href="/educator-center" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                👨‍🏫 Educator Center
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{pathways.length}</div>
            <div className="text-gray-600">Learning Pathways</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {pathways.reduce((sum, p) => sum + p.students, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Active Scholars</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {pathways.reduce((sum, p) => sum + parseInt(p.duration), 0)}h
            </div>
            <div className="text-gray-600">Total Content</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
            <div className="text-gray-600">Knowledge Domains</div>
          </div>
        </div>

        {/* Pathways Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {pathways.map((pathway) => (
            <Link 
              key={pathway.id} 
              href={`/learning-pathways/${pathway.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full">
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                  <img 
                    src={pathway.thumbnail} 
                    alt={pathway.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(pathway.difficulty)}`}>
                      {pathway.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-3">
                    <span className="text-sm text-blue-600 font-medium">{pathway.category}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {pathway.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {pathway.description.length > 150 ? pathway.description.substring(0, 150) + '...' : pathway.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">👨‍🎓</span>
                      <span>{pathway.instructor}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="mr-1">⏱️</span>
                        <span>{pathway.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">👥</span>
                        <span>{pathway.students.toLocaleString()} scholars</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Key Learning Outcomes:</p>
                    <div className="flex flex-wrap gap-1">
                      {pathway.outcomes.slice(0, 2).map((outcome, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {outcome.length > 30 ? outcome.substring(0, 30) + '...' : outcome}
                        </span>
                      ))}
                      {pathway.outcomes.length > 2 && (
                        <span className="text-xs text-blue-600">
                          +{pathway.outcomes.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Learning Journey?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of scholars who have transformed their knowledge through our intelligent learning pathways. 
            Start with our AI cognitive assistant for personalized guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/cognitive-assistant" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              🤖 Start with AI Assistant
            </Link>
            <Link href="/student-learning" className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              📊 View Progress Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
