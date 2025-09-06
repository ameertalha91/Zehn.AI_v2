"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Type definition for videos
type Video = {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  thumbnail: string;
  subject: string;
  description: string;
  views: number;
  uploadDate: string;
};

// Fallback mock data in case API fails
const fallbackVideos: Video[] = [
  {
    id: 'vxCnkM48zPY',
    title: 'Pakistan Studies - Constitutional Development',
    instructor: 'Dr. Ahmed Khan',
    duration: '45:30',
    thumbnail: `https://img.youtube.com/vi/vxCnkM48zPY/hqdefault.jpg`,
    subject: 'Pakistan Studies',
    description: 'Comprehensive overview of Pakistan\'s constitutional development from 1947 to present.',
    views: 1250,
    uploadDate: '2024-08-15'
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'International Relations - Pakistan\'s Foreign Policy',
    instructor: 'Prof. Sara Ali',
    duration: '38:45',
    thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg`,
    subject: 'International Relations',
    description: 'Analysis of Pakistan\'s foreign policy strategies and diplomatic relations.',
    views: 890,
    uploadDate: '2024-08-10'
  },
  {
    id: 'eBGIQ7ZuuiU',
    title: 'Current Affairs - Economic Challenges',
    instructor: 'Dr. Ahmed Khan',
    duration: '52:15',
    thumbnail: `https://img.youtube.com/vi/eBGIQ7ZuuiU/hqdefault.jpg`,
    subject: 'Current Affairs',
    description: 'Discussion on current economic challenges facing Pakistan and potential solutions.',
    views: 2100,
    uploadDate: '2024-08-20'
  }
];

export default function VideoLibrary() {
  const [videos, setVideos] = useState<Video[]>(fallbackVideos);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Load videos from API
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await fetch('/api/admin/videos');
        const data = await response.json();
        
        if (data.success && data.videos.length > 0) {
          setVideos(data.videos);
        } else {
          // Keep fallback videos if no videos in database
          console.log('Using fallback videos - no videos found in database');
        }
      } catch (error) {
        console.error('Failed to load videos:', error);
        // Keep fallback videos on error
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  // Get unique subjects for filter
  const subjects = ['all', ...new Set(videos.map(video => video.subject))];

  // Filter videos based on search and subject
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || video.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Library</h1>
        <p className="text-gray-600">Interactive video lectures with AI-powered quizzes</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search videos by title or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map(video => (
          <Link 
            key={video.id} 
            href={`/videos/${video.id}`}
            className="card overflow-hidden hover:shadow-lg transition-shadow group"
          >
            {/* Thumbnail */}
            <div className="relative">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 line-clamp-2">
                {video.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-2">
                by {video.instructor}
              </p>
              
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {video.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {video.subject}
                </span>
                <span>{video.views} views</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No results message */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No videos found matching your criteria.</p>
          <button 
            onClick={() => {setSearchTerm(''); setSelectedSubject('all');}}
            className="text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
