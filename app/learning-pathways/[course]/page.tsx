"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewsIcon, BookIcon, TargetIcon, VideoIcon } from '@/components/Icons';

// Type definition for video
type Video = {
  id: string;
  title: string;
  instructor: string;
  subject: string;
  description: string;
  uploadDate: string;
  duration: string;
  thumbnail: string;
  views: number;
};

// Course information mapping
const courseInfo: Record<string, {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = {
  'pakistan-studies': {
    title: 'Pakistan Studies',
    description: 'Constitutional development, political evolution, and governance structures of Pakistan',
    icon: '🇵🇰',
    color: 'green'
  },
  'international-relations': {
    title: 'International Relations',
    description: 'Diplomatic protocols, foreign policy analysis, and global affairs',
    icon: '🌍',
    color: 'blue'
  },
  'current-affairs': {
    title: 'Current Affairs',
    description: 'Contemporary issues, policy analysis, and strategic thinking',
    icon: <NewsIcon className="w-6 h-6" />,
    color: 'purple'
  }
};

export default function CourseVideoLibrary() {
  const params = useParams();
  const courseSlug = params.course as string;
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const course = courseInfo[courseSlug];

  // Fetch videos from API and filter by course subject
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await fetch('/api/admin/videos');
        const data = await response.json();
        
        if (data.success && data.videos) {
          // Filter videos by course subject
          const courseVideos = data.videos.filter((video: Video) => 
            video.subject.toLowerCase().replace(/\s+/g, '-') === courseSlug
          );
          setVideos(courseVideos);
        }
      } catch (error) {
        console.error('Failed to load videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [courseSlug]);

  // Filter videos based on search
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!course) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
        <Link href="/learning-pathways" className="btn-primary">
          Back to Course Catalog
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading course videos...</p>
      </div>
    );
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-900 to-emerald-800 text-green-100';
      case 'blue': return 'from-blue-900 to-indigo-800 text-blue-100';
      case 'purple': return 'from-purple-900 to-violet-800 text-purple-100';
      default: return 'from-gray-900 to-slate-800 text-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="container py-3">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/learning-pathways" className="hover:text-blue-600">Course Catalog</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{course.title}</span>
          </nav>
        </div>
      </div>

      {/* Course Header */}
      <div className={`bg-gradient-to-br ${getColorClasses(course.color)} py-16`}>
        <div className="container">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{course.icon}</span>
              <h1 className="text-4xl font-bold">{course.title}</h1>
            </div>
            <p className="text-xl mb-8 opacity-90">
              {course.description}
            </p>
            <div className="flex items-center gap-6 text-sm opacity-75">
              <span className="flex items-center gap-2">
                <BookIcon className="w-4 h-4" />
                {filteredVideos.length} Video Lectures
              </span>
              <span className="flex items-center gap-2">
                <TargetIcon className="w-4 h-4" />
                Interactive Quizzes
              </span>
              <span className="flex items-center gap-2">
                <VideoIcon className="w-4 h-4" />
                AI-Powered Learning
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Library */}
      <div className="container py-12">
        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Video Library</h2>
            <p className="text-gray-600">
              {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg px-4 py-2 w-64"
            />
          </div>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Link 
                key={video.id}
                href={`/videos/${video.id}`}
                className="card hover:shadow-lg transition-all group"
              >
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {video.description.length > 100 
                      ? video.description.substring(0, 100) + '...' 
                      : video.description
                    }
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>👨‍🏫 {video.instructor}</span>
                    <span>👁️ {video.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <VideoIcon className="w-24 h-24 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">No Videos Available</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No videos match "${searchTerm}". Try a different search term.`
                : `No videos have been added to this course yet.`
              }
            </p>
            {!searchTerm && (
              <Link href="/admin/videos" className="btn-primary">
                Add Course Videos
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
