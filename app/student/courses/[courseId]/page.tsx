'use client';

/**
 * COURSE LEARNING PAGE - Main video learning interface
 * 
 * This is the core learning experience where students watch course videos.
 * 
 * ARCHITECTURE OVERVIEW:
 * - This page handles both database courses (with lectures) and JSON pathway courses (with sessions)
 * - Uses course-context for state management and auth-context for user permissions
 * - Integrates with ProtectedRoute for role-based access control
 * 
 * KEY DEPENDENCIES:
 * - /lib/course-context.tsx - Course state management, enrollment, progress tracking
 * - /lib/auth-context.tsx - User authentication and role management
 * - /components/ProtectedRoute.tsx - Route protection based on user roles
 * - /api/courses/route.ts - Backend API for course data and enrollment
 * 
 * RELATED MODULES TO UNDERSTAND:
 * - /app/student/courses/page.tsx - Course listing page (entry point)
 * - /app/api/courses/[courseId]/enroll/route.ts - Enrollment management
 * - /prisma/schema.prisma - Database schema for courses, lectures, enrollments
 * - /data/learning-pathways.json - JSON-based course content
 */

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCourse } from '@/lib/course-context';
import { useAuth } from '@/lib/auth-context';
import { 
  ArrowLeft,
  Play,
  CheckCircle,
  Lock,
  Clock,
  BookOpen,
  Users,
  ChevronDown,
  ChevronRight,
  Star,
  Download,
  Share2
} from 'lucide-react';

interface CourseLearningPageProps {
  params: {
    courseId: string;
  };
}

export default function CourseLearningPage({ params }: CourseLearningPageProps) {
  // AUTHENTICATION & AUTHORIZATION
  // Get current user and their role for access control
  const { user } = useAuth();
  
  // COURSE STATE MANAGEMENT
  // These functions come from course-context and handle:
  // - Course data fetching and caching
  // - Student progress tracking
  // - Enrollment management
  const { 
    getCourseById, 
    getStudentProgress, 
    markLectureComplete,
    enrollInCourse,
    unenrollFromCourse
  } = useCourse();

  // COMPONENT STATE
  // Local state for this page's UI and data
  const [course, setCourse] = useState<any>(null);           // Current course data
  const [currentLecture, setCurrentLecture] = useState<any>(null); // Currently playing video
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set()); // UI state for sidebar
  const [isEnrolled, setIsEnrolled] = useState(false);       // Enrollment status
  const [loading, setLoading] = useState(true);              // Loading state

  // DATA FETCHING & INITIALIZATION
  // This effect runs when the component mounts or courseId changes
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        
        // COURSE DATA FETCHING STRATEGY
        // We fetch from API first to get the most up-to-date course structure
        // This includes both database courses and JSON pathway courses
        const response = await fetch(`/api/courses?role=student`);
        let courseData = null;
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            courseData = result.courses.find((c: any) => c.id === params.courseId);
          }
        }
        
        // FALLBACK STRATEGY
        // If API doesn't have the course, try the course context (local cache)
        if (!courseData) {
          courseData = getCourseById(params.courseId);
        }
        
        if (courseData) {
          setCourse(courseData);
          
          // ENROLLMENT STATUS DETECTION
          // Check if user is enrolled using the enrolledStudentsList from API response
          const isEnrolledInList = courseData.enrolledStudentsList?.includes(user?.id || '');
          const isEnrolledInContext = false; // Will be checked via API
          setIsEnrolled(isEnrolledInList || isEnrolledInContext);
          
          // COURSE TYPE HANDLING
          // The system supports two types of courses:
          // 1. JSON pathway courses (from /data/learning-pathways.json) - have 'sessions'
          // 2. Database courses (from Prisma) - have 'modules' with 'lectures'
          if (courseData.source === 'json' && courseData.sessions && courseData.sessions.length > 0) {
            // JSON PATHWAY COURSES: Sessions are treated as lectures
            setCurrentLecture(courseData.sessions[0]);
            setExpandedModules(new Set(['sessions']));
          } else if (courseData.modules && courseData.modules.length > 0) {
            // DATABASE COURSES: Modules contain lectures
            setExpandedModules(new Set([courseData.modules[0].id]));
            setCurrentLecture(courseData.modules[0].lectures?.[0] || null);
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.courseId, user]);

  const progress = getStudentProgress(params.courseId);
  const completedLectures = progress?.completedLectures || [];
  const progressPercentage = progress?.progressPercentage || 0;

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleLectureClick = (lecture: any) => {
    setCurrentLecture(lecture);
  };

  const handleMarkComplete = async (lectureId: string) => {
    const success = await markLectureComplete(params.courseId, lectureId);
    if (success) {
      // Refresh the page to update progress
      window.location.reload();
    }
  };

  const handleEnroll = async () => {
    const success = await enrollInCourse(params.courseId);
    if (success) {
      setIsEnrolled(true);
      window.location.reload();
    }
  };

  const handleUnenroll = async () => {
    if (confirm('Are you sure you want to unenroll from this course?')) {
      const success = await unenrollFromCourse(params.courseId);
      if (success) {
        setIsEnrolled(false);
        window.location.href = '/student/courses';
      }
    }
  };

  const getLectureStatus = (lectureId: string) => {
    if (completedLectures.includes(lectureId)) return 'completed';
    if (currentLecture?.id === lectureId) return 'current';
    return 'locked';
  };

  const getNextLecture = () => {
    if (!course?.modules) return null;
    
    for (const mod of course.modules) {
      for (const lecture of mod.lectures) {
        if (!completedLectures.includes(lecture.id)) {
          return lecture;
        }
      }
    }
    return null;
  };

  const getPreviousLecture = () => {
    if (!course?.modules || !currentLecture) return null;
    
    const allLectures = course.modules.flatMap((mod: { lectures: { id: string }[] }) => mod.lectures);
    const currentIndex = allLectures.findIndex((lecture: { id: string }) => lecture.id === currentLecture.id);
    
    if (currentIndex > 0) {
      return allLectures[currentIndex - 1];
    }
    return null;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student', 'admin']}>
        <div className="container py-10">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute allowedRoles={['student', 'admin']}>
        <div className="container py-10">
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
            <p className="text-gray-600 mb-6">The course you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <button
              onClick={() => window.location.href = '/student/courses'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isEnrolled) {
    return (
      <ProtectedRoute allowedRoles={['student', 'admin']}>
        <div className="container py-10">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => window.location.href = '/student/courses'}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </button>

            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.name}</h1>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{course.description}</p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{course.modules?.length || 0}</div>
                    <div className="text-sm text-gray-600">Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {course.modules?.reduce((total: number, module: any) => total + (module.lectures?.length || 0), 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Lectures</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{course.enrolledStudents}</div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={course.enrolledStudents >= course.maxStudents}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {course.enrolledStudents >= course.maxStudents ? 'Course Full' : 'Enroll Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student', 'admin']}>
      <div className="container py-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => window.location.href = '/student/courses'}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleUnenroll}
                className="text-gray-600 hover:text-gray-800"
              >
                Unenroll
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Course Content Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Users className="w-4 h-4" />
                    <span>{course.instructor}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Modules List */}
                <div className="space-y-2">
                  {/* Handle JSON pathway sessions */}
                  {course.source === 'json' && course.sessions ? (
                    <div className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleModule('sessions')}
                        className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium text-gray-900">Course Sessions</div>
                          <div className="text-sm text-gray-600">
                            {course.sessions.length} sessions
                          </div>
                        </div>
                        {expandedModules.has('sessions') ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedModules.has('sessions') && (
                        <div className="border-t border-gray-200">
                          {course.sessions.map((session: any, index: number) => {
                            const isCurrent = currentLecture?.id === session.id;
                            return (
                              <button
                                key={session.id}
                                onClick={() => setCurrentLecture(session)}
                                className={`w-full p-3 text-left flex items-center gap-3 hover:bg-gray-50 ${
                                  isCurrent ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                }`}
                              >
                                <div className="flex-shrink-0">
                                  <Play className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {session.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {session.duration} min • {session.instructor}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                  {index + 1}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Handle database course modules */
                    course.modules?.map((module: any) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{module.title}</div>
                          <div className="text-sm text-gray-600">
                            {module.lectures?.length || 0} lectures
                          </div>
                        </div>
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedModules.has(module.id) && (
                        <div className="border-t border-gray-200">
                          {module.lectures?.map((lecture: any) => {
                            const status = getLectureStatus(lecture.id);
                            return (
                              <button
                                key={lecture.id}
                                onClick={() => handleLectureClick(lecture)}
                                className={`w-full p-3 text-left flex items-center gap-3 hover:bg-gray-50 ${
                                  status === 'current' ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                }`}
                              >
                                <div className="flex-shrink-0">
                                  {status === 'completed' ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : status === 'current' ? (
                                    <Play className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {lecture.title}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{lecture.duration} min</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {currentLecture ? (
                <div className="bg-white rounded-lg shadow-sm border">
                  {/* Video Player */}
                  <div className="aspect-video bg-gray-900 rounded-t-lg">
                    {(currentLecture.youtubeUrl || currentLecture.videoUrl) ? (
                      <iframe
                        src={(() => {
                          const videoUrl = currentLecture.youtubeUrl || currentLecture.videoUrl;
                          if (videoUrl.includes('youtube.com/watch')) {
                            return `https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0]}`;
                          } else if (videoUrl.includes('youtu.be/')) {
                            return `https://www.youtube.com/embed/${videoUrl.split('youtu.be/')[1]?.split('?')[0]}`;
                          } else if (videoUrl.includes('youtube.com/embed/')) {
                            return videoUrl;
                          }
                          return videoUrl;
                        })()}
                        className="w-full h-full rounded-t-lg"
                        allowFullScreen
                        title={currentLecture.title}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white">
                        <div className="text-center">
                          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>No video available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lecture Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentLecture.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{currentLecture.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>Lecture {course.modules?.findIndex((m: any) => m.lectures?.some((l: any) => l.id === currentLecture.id)) + 1}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {completedLectures.includes(currentLecture.id) ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkComplete(currentLecture.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {currentLecture.description && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-600">{currentLecture.description}</p>
                      </div>
                    )}

                    {/* Keywords */}
                    {currentLecture.keywords && currentLecture.keywords.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentLecture.keywords.map((keyword: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <button
                        onClick={() => {
                          const prev = getPreviousLecture();
                          if (prev) setCurrentLecture(prev);
                        }}
                        disabled={!getPreviousLecture()}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <button
                        onClick={() => {
                          const next = getNextLecture();
                          if (next) setCurrentLecture(next);
                        }}
                        disabled={!getNextLecture()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No lecture selected</h3>
                  <p className="text-gray-600">Choose a lecture from the sidebar to start learning.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
