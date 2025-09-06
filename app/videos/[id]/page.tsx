"use client";

import { useParams } from 'next/navigation';
import VideoQuizComponent from '../../../components/VideoQuizComponent';
import Link from 'next/link';

// Mock data - in real app, this would come from database
const videoData: Record<string, {
  title: string;
  instructor: string;
  subject: string;
  description: string;
  uploadDate: string;
  duration: string;
}> = {
  'vxCnkM48zPY': {
    title: 'Pakistan Studies - Constitutional Development',
    instructor: 'Dr. Ahmed Khan',
    subject: 'Pakistan Studies',
    description: 'A comprehensive overview of Pakistan\'s constitutional development from 1947 to the present day. This lecture covers the major constitutional milestones, challenges faced during different eras, and the evolution of democratic institutions in Pakistan.',
    uploadDate: '2024-08-15',
    duration: '45:30'
  },
  'dQw4w9WgXcQ': {
    title: 'International Relations - Pakistan\'s Foreign Policy',
    instructor: 'Prof. Sara Ali',
    subject: 'International Relations',
    description: 'An in-depth analysis of Pakistan\'s foreign policy strategies, diplomatic relations with major powers, and regional dynamics in South Asia.',
    uploadDate: '2024-08-10',
    duration: '38:45'
  },
  'eBGIQ7ZuuiU': {
    title: 'Current Affairs - Economic Challenges',
    instructor: 'Dr. Ahmed Khan',
    subject: 'Current Affairs',
    description: 'Discussion on current economic challenges facing Pakistan, including inflation, debt management, and potential solutions for sustainable growth.',
    uploadDate: '2024-08-20',
    duration: '52:15'
  },
  // ADD THE SAME VIDEO HERE
  'ABC123XYZ': {
    title: 'CSS History Paper Preparation',
    instructor: 'Prof. Maria Khan',
    subject: 'History',
    description: 'Complete guide to preparing for CSS History paper with key topics, exam strategies, and important historical events that frequently appear in CSS examinations.',
    uploadDate: '2024-09-01',
    duration: '60:00'
  }
};

export default function VideoPage() {
  const params = useParams();
  const videoId = params.id as string;
  
  // Get video metadata
  const video = videoData[videoId];
  
  if (!video) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
        <p className="text-gray-600 mb-6">The video you're looking for doesn't exist.</p>
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
              <span>👨‍🏫 {video.instructor}</span>
              <span>🕒 {video.duration}</span>
              <span>📅 {new Date(video.uploadDate).toLocaleDateString()}</span>
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
            <h3 className="font-semibold mb-3">📚 Related Study Materials</h3>
            <p className="text-gray-600 mb-4">
              Access additional resources for {video.subject} to deepen your understanding.
            </p>
            <Link href="/chat" className="btn-primary">
              Ask AI Questions
            </Link>
          </div>
          
          <div className="card p-6">
            <h3 className="font-semibold mb-3">📊 Track Your Progress</h3>
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
