'use client';

/**
 * INSTRUCTOR COURSES LIST PAGE - Main course management dashboard for tutors/instructors
 * 
 * PURPOSE:
 * This is the primary interface where instructors manage their course portfolio:
 * - View all courses they own/manage
 * - Create new courses
 * - Access individual course management (via "Manage" button)
 * - Perform bulk operations (publish, unpublish, delete)
 * 
 * ARCHITECTURE OVERVIEW:
 * This page integrates with the course context to display filtered courses
 * and provides navigation to detailed course management pages.
 * 
 * NAVIGATION FLOW:
 * 1. User logs in as tutor/instructor role
 * 2. Accesses /instructor/courses (this page)
 * 3. Can create courses or click "Manage" to go to /instructor/courses/[courseId]
 * 4. Course detail page allows content management and analytics
 * 
 * KEY DEPENDENCIES TO UNDERSTAND:
 * - /lib/course-context.tsx - Provides getInstructorCourses() filtering
 * - /lib/auth-context.tsx - User authentication and role verification
 * - /components/ProtectedRoute.tsx - Ensures only tutors can access
 * - /app/api/courses/route.ts - Backend API for course creation
 * - /app/instructor/courses/[courseId]/page.tsx - Individual course management
 * 
 * RELATED MODULES TO EXPLORE:
 * - /app/dashboard/parts/Tutor.tsx - Basic tutor dashboard (legacy)
 * - /app/admin/courses/page.tsx - Admin view of all courses
 * - /app/student/courses/page.tsx - Student course browsing
 * - /prisma/schema.prisma - Database models for User, Class, Center
 * 
 * COURSE OWNERSHIP MODEL:
 * - Courses are filtered by user.centerId matching course.instructorId
 * - This ensures instructors only see courses from their assigned center
 * - When creating courses, the API assigns the user's centerId to the course
 * - This creates the ownership relationship that enables course visibility
 * 
 * FILTERING & SEARCH:
 * - Built-in search by course name and description
 * - Status filtering (draft, published, archived)
 * - Real-time filtering updates as user types
 * - Shows course count with applied filters
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCourse } from '@/lib/course-context';
import { useAuth } from '@/lib/auth-context';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  BarChart3, 
  Globe, 
  Lock,
  Search,
  Filter,
  MoreVertical,
  BookOpen,
  Clock,
  UserCheck,
  Settings
} from 'lucide-react';

interface CourseFormData {
  name: string;
  description: string;
  maxStudents: number;
  status: 'draft' | 'published' | 'archived';
}

export default function InstructorCoursesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    state, 
    createCourse, 
    updateCourse, 
    deleteCourse, 
    publishCourse, 
    unpublishCourse,
    fetchCourses,
    getInstructorCourses 
  } = useCourse();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseForm, setCourseForm] = useState<CourseFormData>({
    name: '',
    description: '',
    maxStudents: 50,
    status: 'draft'
  });

  useEffect(() => {
    if (user) {
      fetchCourses('tutor');
    }
  }, [user, fetchCourses]); // FIXED: fetchCourses is now memoized, safe to include in dependencies

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createCourse(courseForm);
    if (success) {
      setShowCreateModal(false);
      setCourseForm({ name: '', description: '', maxStudents: 50, status: 'draft' });
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      const success = await updateCourse(editingCourse.id, courseForm);
      if (success) {
        setShowEditModal(false);
        setEditingCourse(null);
        setCourseForm({ name: '', description: '', maxStudents: 50, status: 'draft' });
      }
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      await deleteCourse(courseId);
    }
  };

  const handlePublishToggle = async (course: any) => {
    if (course.status === 'published') {
      await unpublishCourse(course.id);
    } else {
      await publishCourse(course.id);
    }
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      description: course.description,
      maxStudents: course.maxStudents,
      status: course.status
    });
    setShowEditModal(true);
  };

  const instructorCourses = getInstructorCourses();
  const filteredCourses = instructorCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <ProtectedRoute allowedRoles={['tutor']}>
      <div className="container py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-2">Create and manage your courses</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Course
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              {filteredCourses.length} of {instructorCourses.length} courses
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {state.loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {instructorCourses.length === 0 
                ? "You haven't created any courses yet. Create your first course to get started."
                : "No courses match your current filters. Try adjusting your search or filter criteria."
              }
            </p>
            {instructorCourses.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Course
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                    </div>
                    <div className="ml-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                        {getStatusIcon(course.status)}
                        {course.status}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolledStudents} / {course.maxStudents} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.modules?.length || 0} modules</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/instructor/courses/${course.id}`)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Manage
                    </button>
                    <button
                      onClick={() => openEditModal(course)}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePublishToggle(course)}
                      className={`px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-1 ${
                        course.status === 'published'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {course.status === 'published' ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Course</h2>
              <form onSubmit={handleCreateCourse}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Limit
                    </label>
                    <input
                      type="number"
                      id="maxStudents"
                      value={courseForm.maxStudents}
                      onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) })}
                      min="1"
                      max="1000"
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={state.loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.loading ? 'Creating...' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {showEditModal && editingCourse && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Course</h2>
              <form onSubmit={handleEditCourse}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-maxStudents" className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Limit
                    </label>
                    <input
                      type="number"
                      id="edit-maxStudents"
                      value={courseForm.maxStudents}
                      onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) })}
                      min="1"
                      max="1000"
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="edit-status"
                      value={courseForm.status}
                      onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={state.loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.loading ? 'Saving...' : 'Save Changes'}
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