'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PathwaySession {
  id: string;
  videoId: string;
  videoUrl: string;
  title: string;
  instructor: string;
  category: string;
  description: string;
  duration: string;
  thumbnail: string;
  sessionOrder: number;
}

interface LearningPathway {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: string;
  students: number;
  difficulty: string;
  sessions: PathwaySession[];
  outcomes: string[];
  prerequisites: string[];
  thumbnail: string;
}

export default function PathwayPage() {
  const params = useParams();
  const { user } = useAuth();
  const [pathway, setPathway] = useState<LearningPathway | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPathway = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/educator/stream-sessions');
        if (!response.ok) {
          throw new Error('Failed to fetch pathways');
        }
        
        const data = await response.json();
        const foundPathway = data.pathways.find((p: LearningPathway) => p.id === params.pathwayId);
        
        if (foundPathway) {
          setPathway(foundPathway);
        } else {
          setError('Pathway not found');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.pathwayId) {
      fetchPathway();
    }
  }, [params.pathwayId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pathway...</p>
        </div>
      </div>
    );
  }

  if (error || !pathway) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pathway Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested pathway could not be found.'}</p>
          <a href="/learning-pathways" className="text-blue-600 hover:text-blue-800">
            ← Back to Learning Pathways
          </a>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student', 'tutor', 'admin']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{pathway.title}</h1>
                <p className="text-gray-600 mb-4">{pathway.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {pathway.instructor}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {pathway.duration}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {pathway.difficulty}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    {pathway.students} students
                  </span>
                </div>
              </div>
              
              {pathway.thumbnail && (
                <img 
                  src={pathway.thumbnail} 
                  alt={pathway.title}
                  className="w-32 h-24 object-cover rounded-lg ml-6"
                />
              )}
            </div>
          </div>

          {/* Sessions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Sessions</h2>
            
            {pathway.sessions && pathway.sessions.length > 0 ? (
              <div className="space-y-4">
                {pathway.sessions
                  .sort((a, b) => a.sessionOrder - b.sessionOrder)
                  .map((session, index) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{index + 1}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{session.title}</h3>
                        <p className="text-gray-600 mb-2">{session.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Duration: {session.duration} min</span>
                          <span>Instructor: {session.instructor}</span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <a
                          href={`/learning-pathways/${pathway.id}/stream-sessions/${session.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Watch Session
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No sessions available for this pathway yet.</p>
              </div>
            )}
          </div>

          {/* Outcomes and Prerequisites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Outcomes</h3>
              <ul className="space-y-2">
                {pathway.outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prerequisites</h3>
              <ul className="space-y-2">
                {pathway.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

