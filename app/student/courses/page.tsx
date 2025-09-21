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
  Play, 
  CheckCircle, 
  Lock,
  Star,
  Grid,
  List,
  ArrowRight,
  User,
  Calendar
} from 'lucide-react';

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const { 
    state, 
    enrollInCourse, 
    unenrollFromCourse,
    fetchCourses,
    fetchEnrollments,
    getEnrolledCourses,
    getStudentProgress
  } = useCourse();

  const [activeTab, setActiveTab] = useState<'catalog' | 'enrolled'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (user) {
      fetchCourses('student');
      fetchEnrollments();
    }
  }, [user]);

  const enrolledCourses = getEnrolledCourses();
  const enrolledCourseIds = enrolledCourses.map(course => course.id);

  // Filter and sort courses
  const allCourses = state.courses.filter(course => course.status === 'published');
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return b.enrolledStudents - a.enrolledStudents;
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleEnroll = async (courseId: string) => {
    const success = await enrollInCourse(courseId);
    if (success) {
      // Refresh the page to update the UI
      window.location.reload();
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (confirm('Are you sure you want to unenroll from this course?')) {
      const success = await unenrollFromCourse(courseId);
      if (success) {
        // Refresh the page to update the UI
        window.location.reload();
      }
    }
  };

  const getProgressPercentage = (courseId: string) => {
    const progress = getStudentProgress(courseId);
    return progress ? progress.progressPercentage : 0;
  };

  const getCourseStatus = (courseId: string) => {
    const progress = getStudentProgress(courseId);
    if (!progress) return 'not-started';
    if (progress.progressPercentage === 100) return 'completed';
    if (progress.progressPercentage > 0) return 'in-progress';
    return 'not-started';
  };

  const CourseCard = ({ course, isEnrolled = false }: { course: any; isEnrolled?: boolean }) => {
    const progress = getProgressPercentage(course.id);
    const status = getCourseStatus(course.id);

    return (
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {course.source === 'json' 
                      ? `${course.sessions?.length || 0} sessions`
                      : `${course.modules?.length || 0} modules`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolledStudents} students</span>
                </div>
              </div>
            </div>
            {isEnrolled && (
              <div className="ml-4">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  status === 'completed' ? 'bg-green-100 text-green-800' :
                  status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {status === 'completed' ? <CheckCircle className="w-3 h-3" /> :
                   status === 'in-progress' ? <Play className="w-3 h-3" /> :
                   <Lock className="w-3 h-3" />}
                  {status === 'completed' ? 'Completed' :
                   status === 'in-progress' ? 'In Progress' :
                   'Not Started'}
                </div>
              </div>
            )}
          </div>

          {isEnrolled && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {isEnrolled ? (
              <>
                <button
                  onClick={() => window.location.href = `/student/courses/${course.id}`}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {status === 'completed' ? 'Review Course' : 'Continue Learning'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUnenroll(course.id)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Unenroll
                </button>
              </>
            ) : (
              <button
                onClick={() => handleEnroll(course.id)}
                disabled={course.enrolledStudents >= course.maxStudents}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {course.enrolledStudents >= course.maxStudents ? 'Course Full' : 'Enroll Now'}
                {course.enrolledStudents < course.maxStudents && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="container py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
            <p className="text-gray-600 mt-2">Discover and enroll in courses</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Browse All Courses
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'enrolled'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            My Courses ({enrolledCourses.length})
          </button>
        </div>

        {activeTab === 'catalog' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="grid md:grid-cols-4 gap-4">
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
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="css">CSS Preparation</option>
                  <option value="general">General Knowledge</option>
                  <option value="pakistan">Pakistan Affairs</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Courses Grid/List */}
            {state.loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : sortedCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No courses match your search criteria.' : 'No published courses available at the moment.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} isEnrolled={enrolledCourseIds.includes(course.id)} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'enrolled' && (
          <div>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses</h3>
                <p className="text-gray-600 mb-6">You haven't enrolled in any courses yet.</p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <CourseCard key={course.id} course={course} isEnrolled={true} />
                ))}
              </div>
            )}
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