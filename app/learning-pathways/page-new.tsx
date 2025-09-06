import Link from 'next/link';

interface LearningPathway {
  id: string;
  title: string;
  description: string;
  category: string;
  videoCount: number;
  duration: string;
  difficulty: string;
  icon: string;
}

export default function LearningPathways() {
  const pathways: LearningPathway[] = [
    {
      id: 'pakistan-studies',
      title: 'Pakistan Studies',
      description: 'Constitutional development, political evolution, governance structures, and Pakistan\'s history from 1947 to present.',
      category: 'Core Subject',
      videoCount: 12,
      duration: '45 hours',
      difficulty: 'Advanced',
      icon: '🇵🇰'
    },
    {
      id: 'international-relations',
      title: 'International Relations',
      description: 'Global politics, diplomatic relations, foreign policy analysis, and international organizations.',
      category: 'Core Subject',
      videoCount: 8,
      duration: '32 hours',
      difficulty: 'Advanced',
      icon: '🌍'
    },
    {
      id: 'current-affairs',
      title: 'Current Affairs',
      description: 'Contemporary issues, policy analysis, national and international developments.',
      category: 'Core Subject',
      videoCount: 15,
      duration: '25 hours',
      difficulty: 'Intermediate',
      icon: '📰'
    },
    {
      id: 'islamic-studies',
      title: 'Islamic Studies',
      description: 'Islamic history, jurisprudence, philosophy, and contemporary Islamic thought.',
      category: 'Compulsory Subject',
      videoCount: 10,
      duration: '30 hours',
      difficulty: 'Intermediate',
      icon: '🕌'
    },
    {
      id: 'english-essay',
      title: 'English Essay',
      description: 'Essay writing techniques, composition skills, and English language proficiency.',
      category: 'Compulsory Subject',
      videoCount: 6,
      duration: '18 hours',
      difficulty: 'Intermediate',
      icon: '✍️'
    },
    {
      id: 'english-precis',
      title: 'English Precis & Composition',
      description: 'Precis writing, comprehension, and advanced English composition skills.',
      category: 'Compulsory Subject',
      videoCount: 5,
      duration: '15 hours',
      difficulty: 'Intermediate',
      icon: '📝'
    },
    {
      id: 'general-science',
      title: 'General Science & Ability',
      description: 'Basic mathematics, general science concepts, and analytical reasoning.',
      category: 'Compulsory Subject',
      videoCount: 8,
      duration: '24 hours',
      difficulty: 'Beginner',
      icon: '🔬'
    },
    {
      id: 'urdu',
      title: 'Urdu',
      description: 'Urdu language, literature, and composition skills.',
      category: 'Compulsory Subject',
      videoCount: 4,
      duration: '12 hours',
      difficulty: 'Beginner',
      icon: '🇺🇷'
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Core Subject': return 'text-red-600 bg-red-100';
      case 'Compulsory Subject': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Separate pathways by category
  const coreSubjects = pathways.filter(p => p.category === 'Core Subject');
  const compulsorySubjects = pathways.filter(p => p.category === 'Compulsory Subject');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              🎯 CSS Course Catalog
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Complete course catalog for CSS examination preparation. Each subject includes comprehensive video lectures, 
              interactive quizzes, and AI-powered learning assistance organized by CSS syllabus structure.
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
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{pathways.length}</div>
            <div className="text-gray-600">CSS Subjects</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {pathways.reduce((sum, p) => sum + p.videoCount, 0)}
            </div>
            <div className="text-gray-600">Video Lectures</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {pathways.reduce((sum, p) => sum + parseInt(p.duration), 0)}h
            </div>
            <div className="text-gray-600">Total Content</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">AI</div>
            <div className="text-gray-600">Powered Learning</div>
          </div>
        </div>

        {/* Core Subjects */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Core Subjects</h2>
          <p className="text-gray-600 mb-8">Main subjects with advanced preparation required</p>
          
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {coreSubjects.map((pathway) => (
              <Link 
                key={pathway.id} 
                href={`/learning-pathways/${pathway.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full">
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <span className="text-6xl">{pathway.icon}</span>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(pathway.difficulty)}`}>
                        {pathway.difficulty}
                      </span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(pathway.category)}`}>
                        {pathway.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {pathway.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {pathway.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-1">📹</span>
                          <span>{pathway.videoCount} videos</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">⏱️</span>
                          <span>{pathway.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Click to view videos</span>
                        <span className="text-blue-600 group-hover:text-blue-700">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Compulsory Subjects */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Compulsory Subjects</h2>
          <p className="text-gray-600 mb-8">Essential subjects required for all CSS candidates</p>
          
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {compulsorySubjects.map((pathway) => (
              <Link 
                key={pathway.id} 
                href={`/learning-pathways/${pathway.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full">
                  <div className="relative h-32 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                    <span className="text-4xl">{pathway.icon}</span>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(pathway.difficulty)}`}>
                        {pathway.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {pathway.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {pathway.description.length > 80 ? pathway.description.substring(0, 80) + '...' : pathway.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>📹 {pathway.videoCount} videos</span>
                      <span>⏱️ {pathway.duration}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">View course</span>
                        <span className="text-blue-600 group-hover:text-blue-700">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
