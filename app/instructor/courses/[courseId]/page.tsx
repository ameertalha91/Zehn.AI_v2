'use client';

/**
 * INSTRUCTOR COURSE DETAIL PAGE - Course management interface for tutors/instructors
 * 
 * PURPOSE:
 * This page allows instructors to manage individual courses they own, including:
 * - Viewing course overview and statistics
 * - Adding/editing course content (lectures)
 * - Managing enrolled students
 * - Viewing course analytics
 * 
 * ARCHITECTURE OVERVIEW:
 * This is a dynamic route that uses [courseId] to load specific course data.
 * It integrates with the course context for state management and provides
 * a tabbed interface for different course management functions.
 * 
 * NAVIGATION FLOW:
 * 1. Instructor visits /instructor/courses (course list)
 * 2. Clicks "Manage" button on a course
 * 3. Navigates to /instructor/courses/[courseId] (this page)
 * 4. Can manage course content, students, and settings
 * 
 * KEY DEPENDENCIES TO UNDERSTAND:
 * - /lib/course-context.tsx - Provides course data and management functions
 * - /lib/auth-context.tsx - User authentication and role verification
 * - /components/ProtectedRoute.tsx - Ensures only tutors can access
 * - /app/api/courses/[courseId]/route.ts - Backend API for course updates
 * - /app/instructor/courses/page.tsx - Parent course list page
 * 
 * RELATED MODULES TO EXPLORE:
 * - /app/student/courses/[courseId]/page.tsx - Student view of courses
 * - /app/admin/courses/page.tsx - Admin course management
 * - /app/api/courses/route.ts - Course creation and listing API
 * - /prisma/schema.prisma - Database models for Class, Lecture, Center
 * 
 * COURSE CONTENT STRUCTURE:
 * - Course contains Modules (content groupings)
 * - Modules contain Lectures (individual video lessons)
 * - Lectures have YouTube URLs, descriptions, and metadata
 * - This follows the same structure as the student learning interface
 * 
 * ROLE-BASED ACCESS:
 * - Only users with 'tutor' role can access this page
 * - Instructors can only manage courses they own (same centerId)
 * - Course ownership is determined by user.centerId matching course.instructorId
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCourse } from '@/lib/course-context';
import { useAuth } from '@/lib/auth-context';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  BookOpen,
  Clock,
  Globe,
  Lock,
  Settings,
  Upload,
  Video,
  FileText,
  BarChart3,
  Calendar,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface InstructorCourseDetailProps {
  params: {
    courseId: string;
  };
}

export default function InstructorCourseDetail({ params }: InstructorCourseDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { getCourseById, updateCourse, state } = useCourse();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddLectureModal, setShowAddLectureModal] = useState(false);
  const [newLecture, setNewLecture] = useState({
    title: '',
    youtubeUrl: '',
    description: ''
  });

  const course = getCourseById(params.courseId);

  useEffect(() => {
    if (!course) {
      router.push('/instructor/courses');
    }
  }, [course, router]);

  if (!course) {
    return (
      <ProtectedRoute allowedRoles={['tutor']}>
        <div className="container py-10">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Course Not Found</h3>
            <p className="text-gray-600 mb-6">
              The course you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <button
              onClick={() => router.push('/instructor/courses')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLecture.title || !newLecture.youtubeUrl) {
      alert('Please fill in title and YouTube URL');
      return;
    }

    // Extract YouTube video ID
    const youtubeMatch = newLecture.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const videoId = youtubeMatch ? youtubeMatch[1] : null;
    
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    const lecture = {
      id: `lecture-${Date.now()}`,
      title: newLecture.title,
      youtubeUrl: newLecture.youtubeUrl,
      duration: 30, // Default duration
      keywords: [],
      description: newLecture.description,
      order: (course.modules[0]?.lectures.length || 0) + 1,
      isCompleted: false
    };

    // Update course with new lecture
    const updatedModules = [...course.modules];
    if (updatedModules.length === 0) {
      updatedModules.push({
        id: 'default-module',
        title: 'Course Content',
        description: 'Main course content',
        order: 0,
        lectures: []
      });
    }
    
    updatedModules[0].lectures.push(lecture);

    const success = await updateCourse(course.id, { modules: updatedModules });
    if (success) {
      setShowAddLectureModal(false);
      setNewLecture({ title: '', youtubeUrl: '', description: '' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <Globe className="w-4 h-4" />;
      case 'draft': return <Lock className="w-4 h-4" />;
      case 'archived': return <Trash2 className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const totalLectures = course.modules.reduce((total, module) => total + module.lectures.length, 0);

  return (
    <ProtectedRoute allowedRoles={['tutor']}>
      <div className="container py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/instructor/courses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                {getStatusIcon(course.status)}
                {course.status}
              </div>
              <span className="text-gray-600">
                {course.enrolledStudents} / {course.maxStudents} students
              </span>
              <span className="text-gray-600">
                {totalLectures} lectures
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`/student/courses/${course.id}`, '_blank')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Course Settings
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'content', label: 'Content', icon: BookOpen },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Course Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{course.enrolledStudents}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Lectures</p>
                    <p className="text-2xl font-bold text-gray-900">{totalLectures}</p>
                  </div>
                  <Video className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Course Status</p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">{course.status}</p>
                  </div>
                  {getStatusIcon(course.status)}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Course Description</h3>
              <p className="text-gray-600">
                {course.description || 'No description available'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Add Lecture Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Course Content</h3>
              <button
                onClick={() => setShowAddLectureModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Lecture
              </button>
            </div>

            {/* Content List */}
            {course.modules.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start building your course by adding your first lecture.
                </p>
                <button
                  onClick={() => setShowAddLectureModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Add First Lecture
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <h4 className="text-lg font-medium mb-4">{module.title}</h4>
                    <div className="space-y-3">
                      {module.lectures.map((lecture, index) => (
                        <div key={lecture.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{lecture.title}</h5>
                            <p className="text-sm text-gray-600">{lecture.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {lecture.duration} min
                          </div>
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Enrolled Students</h3>
            {course.enrolledStudents === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h4>
                <p className="text-gray-600">
                  Students will appear here once they enroll in your course.
                </p>
              </div>
            ) : (
              <p className="text-gray-600">
                {course.enrolledStudents} students enrolled. Student management features coming soon.
              </p>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Course Analytics</h3>
            <p className="text-gray-600">
              Analytics and insights will be available here soon.
            </p>
          </div>
        )}

        {/* Add Lecture Modal */}
        {showAddLectureModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Lecture</h2>
              <form onSubmit={handleAddLecture}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="lecture-title" className="block text-sm font-medium text-gray-700 mb-2">
                      Lecture Title *
                    </label>
                    <input
                      type="text"
                      id="lecture-title"
                      value={newLecture.title}
                      onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lecture-url" className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube URL *
                    </label>
                    <input
                      type="url"
                      id="lecture-url"
                      value={newLecture.youtubeUrl}
                      onChange={(e) => setNewLecture({ ...newLecture, youtubeUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lecture-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="lecture-description"
                      value={newLecture.description}
                      onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddLectureModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={state.loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.loading ? 'Adding...' : 'Add Lecture'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {state.error}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}