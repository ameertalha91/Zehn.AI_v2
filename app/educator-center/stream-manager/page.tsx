"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function StreamManager() {
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [formData, setFormData] = useState({
    videoUrl: '',
    title: '',
    instructor: '',
    pathwayId: '',
    category: '',
    description: '',
    duration: '',
    objectives: [''],
    keyTopics: [''],
    difficultyLevel: 'Intermediate',
    sessionOrder: 1
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Available learning pathways
  const availablePathways = [
    { id: 'css-excellence-pathway', title: 'CSS Excellence Mastery Pathway', category: 'Pakistan Studies' },
    { id: 'diplomatic-mastery-track', title: 'Diplomatic Intelligence Mastery Track', category: 'International Relations' },
    { id: 'current-affairs-intelligence', title: 'Current Affairs Intelligence Journey', category: 'Current Affairs' }
  ];

  // Subject categories
  const categories = [
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
      const videoId = extractVideoId(formData.videoUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please use format: https://www.youtube.com/watch?v=VIDEO_ID');
      }

      // Prepare enhanced session data
      const sessionData = {
        ...formData,
        videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        objectives: formData.objectives.filter(obj => obj.trim() !== ''),
        keyTopics: formData.keyTopics.filter(topic => topic.trim() !== ''),
        uploadDate: new Date().toISOString().split('T')[0]
      };

      const response = await fetch('/api/educator/stream-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Stream session "${formData.title}" added successfully to ${availablePathways.find(p => p.id === formData.pathwayId)?.title}!`);
        setFormData({
          videoUrl: '',
          title: '',
          instructor: '',
          pathwayId: '',
          category: '',
          description: '',
          duration: '',
          objectives: [''],
          keyTopics: [''],
          difficultyLevel: 'Intermediate',
          sessionOrder: 1
        });
        setIsAddingSession(false);
      } else {
        throw new Error(data.error || 'Failed to add stream session');
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

  const handleArrayInputChange = (index: number, value: string, field: 'objectives' | 'keyTopics') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: 'objectives' | 'keyTopics') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (index: number, field: 'objectives' | 'keyTopics') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <nav className="flex text-sm text-gray-600 mb-4">
            <Link href="/educator-center" className="hover:text-blue-600">Educator Center</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Stream Session Manager</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📺 Stream Session Manager</h1>
              <p className="text-gray-600">Create and manage adaptive learning stream sessions with AI integration</p>
            </div>
            
            <div className="flex gap-3">
              <Link href="/learning-pathways" className="btn-ghost">
                View Live Pathways
              </Link>
              <button
                onClick={() => setIsAddingSession(true)}
                className="btn-primary"
              >
                + Create Stream Session
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Add Stream Session Modal */}
        {isAddingSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Create Advanced Stream Session</h2>
                <button
                  onClick={() => setIsAddingSession(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Pathway *
                    </label>
                    <select
                      name="pathwayId"
                      value={formData.pathwayId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Learning Pathway</option>
                      {availablePathways.map(pathway => (
                        <option key={pathway.id} value={pathway.id}>
                          {pathway.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Session Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream Session Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Constitutional Development Foundations"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Instructor, Category, Duration */}
                <div className="grid md:grid-cols-3 gap-4">
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
                      Knowledge Domain *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Domain</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 45:30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      name="difficultyLevel"
                      value={formData.difficultyLevel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Order
                    </label>
                    <input
                      type="number"
                      name="sessionOrder"
                      value={formData.sessionOrder}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Comprehensive description of what this stream session covers..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Learning Objectives */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Objectives
                  </label>
                  {formData.objectives.map((objective, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => handleArrayInputChange(index, e.target.value, 'objectives')}
                        placeholder="e.g., Understand constitutional development timeline"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formData.objectives.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(index, 'objectives')}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('objectives')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Learning Objective
                  </button>
                </div>

                {/* Key Topics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Topics Covered
                  </label>
                  {formData.keyTopics.map((topic, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => handleArrayInputChange(index, e.target.value, 'keyTopics')}
                        placeholder="e.g., Government of India Act 1935"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formData.keyTopics.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(index, 'keyTopics')}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('keyTopics')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Key Topic
                  </button>
                </div>

                {/* Preview */}
                {formData.videoUrl && extractVideoId(formData.videoUrl) && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Stream Session Preview:</h4>
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://img.youtube.com/vi/${extractVideoId(formData.videoUrl)}/hqdefault.jpg`}
                        alt="Session thumbnail"
                        className="w-32 h-24 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{formData.title || 'Session Title'}</p>
                        <p className="text-sm text-gray-600">
                          {formData.instructor || 'Instructor'} • {formData.category || 'Category'} • {formData.duration || 'Duration'}
                        </p>
                        <p className="text-sm text-gray-500">Video ID: {extractVideoId(formData.videoUrl)}</p>
                        {formData.pathwayId && (
                          <p className="text-sm text-blue-600">
                            Pathway: {availablePathways.find(p => p.id === formData.pathwayId)?.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddingSession(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Creating Stream Session...' : 'Create Stream Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Current Stream Sessions */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6">Current Stream Sessions</h3>
          
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-4 block">📺</span>
            <p className="text-lg mb-2">Enhanced Stream Session Management</p>
            <p className="text-sm mb-4">Sessions are now organized by learning pathways with advanced metadata</p>
            <div className="flex justify-center gap-4">
              <Link href="/learning-pathways" className="text-blue-600 hover:underline">
                View Live Pathways
              </Link>
              <span className="text-gray-400">•</span>
              <button 
                onClick={() => setIsAddingSession(true)}
                className="text-blue-600 hover:underline"
              >
                Create First Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
