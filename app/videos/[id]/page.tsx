"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import VideoQuizComponent from '../../../components/VideoQuizComponent';
import Link from 'next/link';
import { BookIcon, ChartIcon, UserIcon, ClockIcon, CalendarIcon } from '@/components/Icons';

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

export default function VideoPage() {
  const params = useParams();
  const videoId = params.id as string;
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch video data from API
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch('/api/admin/videos');
        const data = await response.json();
        
        if (data.success && data.videos) {
          const foundVideo = data.videos.find((v: Video) => v.id === videoId);
          if (foundVideo) {
            setVideo(foundVideo);
          } else {
            setError('Video not found');
          }
        } else {
          setError('Failed to load video data');
        }
      } catch (error) {
        console.error('Error fetching video:', error);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading video...</p>
      </div>
    );
  }
  
  
  if (error || !video) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
        <p className="text-gray-600 mb-6">
          {error || "The video you're looking for doesn't exist."}
        </p>
        <Link href="/videos" className="btn-primary">
          Back to Video Library
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="container py-3">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/videos" className="hover:text-blue-600">Video Library</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{video.title}</span>
          </nav>
        </div>
      </div>

      {/* Video Header */}
      <div className="bg-white">
        <div className="container py-6">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
              {video.subject}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{video.title}</h1>
            <p className="text-gray-600 mb-4">{video.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-teal-600" />
                {video.instructor}
              </span>
              <span className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-teal-600" />
                {video.duration}
              </span>
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-teal-600" />
                {new Date(video.uploadDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Component */}
      <div className="container py-8">
        {/* Your existing VideoQuizComponent will be rendered here */}
        <VideoQuizComponent videoId={videoId} />
        
        {/* Additional Study Resources */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BookIcon className="w-5 h-5 text-teal-600" />
              Related Study Materials
            </h3>
            <p className="text-gray-600 mb-4">
              Access additional resources for {video.subject} to deepen your understanding.
            </p>
            <Link href="/chat" className="btn-primary">
              Ask AI Questions
            </Link>
          </div>
          
          <div className="card p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ChartIcon className="w-5 h-5 text-teal-600" />
              Track Your Progress
            </h3>
            <p className="text-gray-600 mb-4">
              Monitor your quiz performance and study plan progress.
            </p>
            <Link href="/dashboard" className="btn-ghost">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
