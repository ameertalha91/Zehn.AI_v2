'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCourse } from '@/lib/course-context';
import { useAuth } from '@/lib/auth-context';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  Clock, 
  Edit, 
  Trash2, 
  Copy,
  Globe,
  Lock,
  Archive,
  Star,
  TrendingUp,
  User,
  Calendar,
  MoreVertical,
  Eye,
  Settings,
  AlertTriangle
} from 'lucide-react';

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const { 
    state, 
    updateCourse, 
    deleteCourse,
    fetchCourses,
    getAllCourses
  } = useCourse();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCourses('admin');
    }
  }, [user, fetchCourses]);

  const allCourses = getAllCourses();
  const instructors = [...new Set(allCourses.map(course => course.instructor))];

  // Filter and sort courses
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesInstructor = instructorFilter === 'all' || course.instructor === instructorFilter;
    return matchesSearch && matchesStatus && matchesInstructor;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return b.enrolledStudents - a.enrolledStudents;
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      case 'instructor':
        return a.instructor.localeCompare(b.instructor);
      default:
        return 0;
    }
  });

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === sortedCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(sortedCourses.map(course => course.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCourses.length === 0) return;

    // Filter out JSON pathway courses for delete operations
    let coursesToProcess = selectedCourses;
    if (action === 'delete') {
      coursesToProcess = selectedCourses.filter(courseId => {
        const course = allCourses.find(c => c.id === courseId);
        return course && course.source !== 'json';
      });
      
      const jsonCoursesCount = selectedCourses.length - coursesToProcess.length;
      if (jsonCoursesCount > 0) {
        alert(`Cannot delete ${jsonCoursesCount} JSON pathway course(s). They are read-only.`);
      }
      
      if (coursesToProcess.length === 0) {
        setSelectedCourses([]);
        return;
      }
    }

    const confirmMessage = `Are you sure you want to ${action} ${coursesToProcess.length} course(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const courseId of coursesToProcess) {
        try {
          switch (action) {
            case 'publish':
              await updateCourse(courseId, { status: 'published' });
              break;
            case 'unpublish':
              await updateCourse(courseId, { status: 'draft' });
              break;
            case 'archive':
              await updateCourse(courseId, { status: 'archived' });
              break;
            case 'delete':
              await deleteCourse(courseId);
              break;
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to ${action} course ${courseId}:`, error);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        alert(`${successCount} courses ${action}ed successfully, ${errorCount} failed. Check console for details.`);
      } else {
        alert(`Successfully ${action}ed ${successCount} course(s).`);
      }
      
      setSelectedCourses([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Bulk action failed. Check console for details.');
    }
  };

  const handleEditCourse = (course: any) => {
    if (course.source === 'json') {
      alert('Cannot edit JSON pathway courses. They are read-only.');
      return;
    }
    setEditingCourse(course);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      const formData = new FormData(e.target as HTMLFormElement);
      const updates = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        maxStudents: parseInt(formData.get('maxStudents') as string),
        status: formData.get('status') as 'draft' | 'published' | 'archived',
        isFeatured: formData.get('isFeatured') === 'on',
        platformRecommendation: formData.get('platformRecommendation') === 'on',
        revenueSharing: parseFloat(formData.get('revenueSharing') as string) || 0
      };

      const success = await updateCourse(editingCourse.id, updates);
      if (success) {
        setShowEditModal(false);
        setEditingCourse(null);
      }
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
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const totalRevenue = allCourses.reduce((sum, course) => sum + (course.revenueSharing || 0), 0);
  const totalEnrollments = allCourses.reduce((sum, course) => sum + course.enrolledStudents, 0);
  const publishedCourses = allCourses.filter(course => course.status === 'published').length;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="container py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-2">Manage all platform courses and instructors</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{allCourses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{publishedCourses}</p>
              </div>
              <Globe className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid md:grid-cols-5 gap-4">
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Instructors</option>
              {instructors.map(instructor => (
                <option key={instructor} value={instructor}>{instructor}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="instructor">By Instructor</option>
            </select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              {filteredCourses.length} of {allCourses.length} courses
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCourses.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900">
                  {selectedCourses.length} course(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('unpublish')}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  Unpublish
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Archive
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedCourses([])}
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Courses Table */}
        {state.loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No courses match your search criteria.' : 'No courses available.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCourses.length === sortedCourses.length && sortedCourses.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => handleSelectCourse(course.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{course.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{course.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {course.source === 'json' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <BookOpen className="w-3 h-3" />
                                JSON Pathway
                              </span>
                            )}
                            {course.isFeatured && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3" />
                                Featured
                              </span>
                            )}
                            {course.platformRecommendation && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <TrendingUp className="w-3 h-3" />
                                Recommended
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{course.instructor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                          {getStatusIcon(course.status)}
                          {course.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {course.enrolledStudents} / {course.maxStudents}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ width: `${(course.enrolledStudents / course.maxStudents) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          ${(course.revenueSharing || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(course.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCourse(course)}
                            className={course.source === 'json' 
                              ? "text-gray-400 cursor-not-allowed" 
                              : "text-blue-600 hover:text-blue-800"
                            }
                            title={course.source === 'json' 
                              ? "Cannot edit JSON pathway courses" 
                              : "Edit Course"
                            }
                            disabled={course.source === 'json'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(`/student/courses/${course.id}`, '_blank')}
                            className="text-green-600 hover:text-green-800"
                            title="View Course"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => course.source === 'json' ? null : handleBulkAction('delete')}
                            className={course.source === 'json' 
                              ? "text-gray-400 cursor-not-allowed" 
                              : "text-red-600 hover:text-red-800"
                            }
                            title={course.source === 'json' 
                              ? "Cannot delete JSON pathway courses" 
                              : "Delete Course"
                            }
                            disabled={course.source === 'json'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {showEditModal && editingCourse && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h2 className="text-2xl font-bold text-gray-900">Edit Course (Admin Override)</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                You are editing this course as an administrator. Changes will be visible to the instructor.
              </p>
              
              <form onSubmit={handleSaveEdit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingCourse.name}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={editingCourse.description}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-2">
                        Enrollment Limit
                      </label>
                      <input
                        type="number"
                        name="maxStudents"
                        defaultValue={editingCourse.maxStudents}
                        min="1"
                        max="1000"
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="revenueSharing" className="block text-sm font-medium text-gray-700 mb-2">
                        Revenue Sharing (%)
                      </label>
                      <input
                        type="number"
                        name="revenueSharing"
                        defaultValue={editingCourse.revenueSharing || 0}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={editingCourse.status}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        defaultChecked={editingCourse.isFeatured}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">Featured Course</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="platformRecommendation"
                        defaultChecked={editingCourse.platformRecommendation}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">Platform Recommendation</label>
                    </div>
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