"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function EducatorCenter() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for educator dashboard
  const pathwayStats = {
    totalPathways: 3,
    totalSessions: 8,
    activeScholars: 4295,
    avgRating: 4.8
  };

  const recentActivity = [
    { type: 'enrollment', message: 'New scholar enrolled in CSS Excellence Pathway', time: '2 hours ago' },
    { type: 'completion', message: 'Scholar completed Constitutional Foundations session', time: '4 hours ago' },
    { type: 'feedback', message: 'New 5-star rating on Diplomatic Intelligence Track', time: '6 hours ago' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎓 Educator Command Center
          </h1>
          <p className="text-xl text-gray-600">
            Advanced Learning Pathway Management & Scholar Analytics
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="container">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
              { id: 'pathways', label: 'Pathway Architect', icon: '🎯' },
              { id: 'sessions', label: 'Stream Manager', icon: '📺' },
              { id: 'analytics', label: 'Scholar Analytics', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Dashboard Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Active Pathways</p>
                    <p className="text-3xl font-bold text-blue-700">{pathwayStats.totalPathways}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Stream Sessions</p>
                    <p className="text-3xl font-bold text-purple-700">{pathwayStats.totalSessions}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <span className="text-2xl">📺</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Active Scholars</p>
                    <p className="text-3xl font-bold text-green-700">{pathwayStats.activeScholars.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Avg. Rating</p>
                    <p className="text-3xl font-bold text-yellow-700">{pathwayStats.avgRating}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <span className="text-2xl">⭐</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🚀 Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('sessions')}
                    className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-blue-900">Add New Stream Session</div>
                    <div className="text-blue-700 text-sm">Create interactive learning content</div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('pathways')}
                    className="w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-purple-900">Design Learning Pathway</div>
                    <div className="text-purple-700 text-sm">Architect comprehensive course structure</div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-green-900">View Scholar Analytics</div>
                    <div className="text-green-700 text-sm">Monitor engagement and performance</div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'enrollment' ? 'bg-blue-500' :
                        activity.type === 'completion' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pathway Architect Tab */}
        {activeTab === 'pathways' && (
          <div className="bg-white rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">🎯 Pathway Architect</h2>
              <button className="btn-primary">+ Create New Pathway</button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Design comprehensive learning pathways with structured progression and adaptive intelligence.
            </p>
            
            <div className="text-center py-12 text-gray-500">
              <span className="text-6xl mb-4 block">🏗️</span>
              <h3 className="text-xl font-semibold mb-2">Advanced Pathway Creation</h3>
              <p className="mb-4">Coming soon: Visual pathway designer with drag-and-drop interface</p>
              <p className="text-sm">Current pathways can be viewed in the <Link href="/learning-pathways" className="text-blue-600 hover:underline">Learning Pathways section</Link></p>
            </div>
          </div>
        )}

        {/* Stream Manager Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">📺 Stream Session Manager</h2>
              <Link href="/educator-center/stream-manager" className="btn-primary">
                + Add Stream Session
              </Link>
            </div>
            
            <p className="text-gray-600 mb-6">
              Manage interactive stream sessions with AI-powered quiz integration and adaptive learning features.
            </p>

            {/* Current Sessions Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Stream Sessions</h3>
              
              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">CSS Excellence</span>
                        <span className="text-sm text-gray-500">45:30</span>
                      </div>
                      <h4 className="font-semibold">Constitutional Development Foundations</h4>
                      <p className="text-sm text-gray-600">Dr. Ahmed Khan • Pakistan Studies</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline text-sm">Edit</button>
                      <button className="text-blue-600 hover:underline text-sm">Analytics</button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Diplomatic Intelligence</span>
                        <span className="text-sm text-gray-500">38:45</span>
                      </div>
                      <h4 className="font-semibold">Strategic Foreign Policy Analysis</h4>
                      <p className="text-sm text-gray-600">Prof. Sara Ali • International Relations</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline text-sm">Edit</button>
                      <button className="text-blue-600 hover:underline text-sm">Analytics</button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Current Affairs</span>
                        <span className="text-sm text-gray-500">52:15</span>
                      </div>
                      <h4 className="font-semibold">Contemporary Economic Challenges</h4>
                      <p className="text-sm text-gray-600">Dr. Ahmed Khan • Current Affairs</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline text-sm">Edit</button>
                      <button className="text-blue-600 hover:underline text-sm">Analytics</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scholar Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">📈 Scholar Analytics Engine</h2>
            <p className="text-gray-600 mb-6">
              Advanced analytics and insights into scholar engagement, progress, and performance patterns.
            </p>
            
            <div className="text-center py-12 text-gray-500">
              <span className="text-6xl mb-4 block">📊</span>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics Dashboard</h3>
              <p className="mb-4">Real-time scholar engagement metrics, learning velocity analysis, and predictive insights</p>
              <p className="text-sm">Feature under development with machine learning integration</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
