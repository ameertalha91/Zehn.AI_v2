"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function AdminVideos() {
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [formData, setFormData] = useState({
    videoUrl: '',
    title: '',
    instructor: '',
    subject: '',
    description: '',
    duration: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Video "${formData.title}" added successfully!`);
        setFormData({
          videoUrl: '',
          title: '',
          instructor: '',
          subject: '',
          description: '',
          duration: ''
        });
        setIsAddingVideo(false);
        // Refresh the page to show new video
        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to add video');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const subjects = [
    'Pakistan Studies',
    'International Relations', 
    'Current Affairs',
    'History',
    'Psychology',
    'Economics',
    'Political Science',
    'English Literature',
    'Islamic Studies',
    'Geography'
  ];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Video Management</h1>
          <p className="text-gray-600">Manage instructor video library</p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/videos" className="btn-ghost">
            View Library
          </Link>
          <button
            onClick={() => setIsAddingVideo(true)}
            className="btn-primary"
          >
            + Add Video
          </button>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Add Video Modal */}
      {isAddingVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add New Video</h2>
              <button
                onClick={() => setIsAddingVideo(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video URL *
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the full YouTube URL here
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Pakistan Studies - Constitutional Development"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Instructor and Subject Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor Name *
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    placeholder="e.g., Dr. Ahmed Khan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 45:30 (MM:SS format)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: MM:SS (e.g., 45:30 for 45 minutes 30 seconds)
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of what this video covers..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Preview */}
              {formData.videoUrl && extractVideoId(formData.videoUrl) && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview:</h4>
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://img.youtube.com/vi/${extractVideoId(formData.videoUrl)}/hqdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-24 h-18 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{formData.title || 'Video Title'}</p>
                      <p className="text-sm text-gray-600">Video ID: {extractVideoId(formData.videoUrl)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingVideo(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Adding Video...' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Current Videos List */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4">Current Videos</h3>
        <p className="text-gray-600 mb-4">
          Currently showing mock data. In production, this would list all videos from the database.
        </p>
        
        <div className="space-y-3">
          {/* Mock current videos */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Pakistan Studies - Constitutional Development</h4>
              <p className="text-sm text-gray-600">by Dr. Ahmed Khan • Pakistan Studies • 45:30</p>
            </div>
            <button className="text-blue-600 hover:underline text-sm">Edit</button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">International Relations - Pakistan's Foreign Policy</h4>
              <p className="text-sm text-gray-600">by Prof. Sara Ali • International Relations • 38:45</p>
            </div>
            <button className="text-blue-600 hover:underline text-sm">Edit</button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Current Affairs - Economic Challenges</h4>
              <p className="text-sm text-gray-600">by Dr. Ahmed Khan • Current Affairs • 52:15</p>
            </div>
            <button className="text-blue-600 hover:underline text-sm">Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
