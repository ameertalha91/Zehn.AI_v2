'use client';

/**
 * COURSE CONTEXT - Global state management for course-related data
 * 
 * This is the central state management system for all course operations.
 * It provides a unified interface for course data, enrollment, and progress tracking.
 * 
 * ARCHITECTURE OVERVIEW:
 * - Uses React Context + useReducer for state management
 * - Integrates with localStorage for persistence
 * - Provides real-time updates via course-sync system
 * - Handles both database courses and JSON pathway courses
 * 
 * KEY RESPONSIBILITIES:
 * - Course data fetching and caching
 * - Student enrollment management
 * - Progress tracking and completion status
 * - Real-time synchronization across components
 * 
 * RELATED MODULES TO UNDERSTAND:
 * - /lib/auth-context.tsx - User authentication (dependency)
 * - /lib/course-sync.ts - Real-time synchronization system
 * - /app/api/courses/route.ts - Backend API for course operations
 * - /app/api/courses/[courseId]/enroll/route.ts - Enrollment API
 * - /prisma/schema.prisma - Database schema for courses and enrollments
 * 
 * USAGE PATTERN:
 * - Wrap your app with CourseProvider
 * - Use useCourse() hook in components that need course data
 * - All course operations go through this context
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import { courseSync, CourseUpdateEvent } from './course-sync';

// TYPE DEFINITIONS
// These interfaces define the data structures used throughout the course system
export interface Lecture {
  id: string;
  title: string;
  youtubeUrl: string;        // YouTube video URL for embedding
  duration: number;          // Duration in minutes
  keywords: string[];        // Searchable keywords
  description: string;       // Lecture description
  order: number;            // Display order within module
  isCompleted?: boolean;    // Student completion status
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;            // Display order within course
  lectures: Lecture[];      // Array of lectures in this module
}

export interface Course {
  id: string;
  name: string;
  description: string;
  instructor: string;       // Instructor name (from Center.name)
  instructorId: string;     // Center ID or user ID
  enrolledStudents: number; // Current enrollment count
  maxStudents: number;      // Maximum allowed students
  status: 'draft' | 'published' | 'archived';
  modules: Module[];        // Course content structure
  enrolledStudentsList: string[]; // Array of enrolled user IDs
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  isFeatured?: boolean;     // Featured course flag
  platformRecommendation?: boolean; // Platform recommendation flag
  revenueSharing?: number;  // Revenue sharing percentage
  source?: 'database' | 'json'; // Source of the course data
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  lastAccessed: string;
}

export interface StudentProgress {
  studentId: string;
  courseId: string;
  completedLectures: string[];
  lastAccessed: string;
  progressPercentage: number;
}

// State
interface CourseState {
  courses: Course[];
  enrollments: Enrollment[];
  studentProgress: StudentProgress[];
  loading: boolean;
  error: string | null;
}

// Actions
type CourseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'SET_ENROLLMENTS'; payload: Enrollment[] }
  | { type: 'ADD_ENROLLMENT'; payload: Enrollment }
  | { type: 'REMOVE_ENROLLMENT'; payload: { userId: string; courseId: string } }
  | { type: 'UPDATE_PROGRESS'; payload: StudentProgress }
  | { type: 'SYNC_COURSE_UPDATE'; payload: { courseId: string; updates: Partial<Course> } };

// Context
interface CourseContextType {
  state: CourseState;
  dispatch: React.Dispatch<CourseAction>;
  // Course Management
  createCourse: (courseData: Partial<Course>) => Promise<Course | null>;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<boolean>;
  deleteCourse: (courseId: string) => Promise<boolean>;
  publishCourse: (courseId: string) => Promise<boolean>;
  unpublishCourse: (courseId: string) => Promise<boolean>;
  // Enrollment Management
  enrollInCourse: (courseId: string) => Promise<boolean>;
  unenrollFromCourse: (courseId: string) => Promise<boolean>;
  // Progress Tracking
  markLectureComplete: (courseId: string, lectureId: string) => Promise<boolean>;
  getStudentProgress: (courseId: string) => StudentProgress | null;
  // Data Fetching
  fetchCourses: (role: 'student' | 'tutor' | 'admin') => Promise<void>;
  fetchEnrollments: () => Promise<void>;
  // Utility
  getCourseById: (courseId: string) => Course | null;
  getEnrolledCourses: () => Course[];
  getInstructorCourses: () => Course[];
  getAllCourses: () => Course[];
}

const CourseContext = createContext<CourseContextType | null>(null);

// Reducer
function courseReducer(state: CourseState, action: CourseAction): CourseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.id ? action.payload : course
        )
      };
    
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(course => course.id !== action.payload)
      };
    
    case 'SET_ENROLLMENTS':
      return { ...state, enrollments: action.payload };
    
    case 'ADD_ENROLLMENT':
      return { ...state, enrollments: [...state.enrollments, action.payload] };
    
    case 'REMOVE_ENROLLMENT':
      return {
        ...state,
        enrollments: state.enrollments.filter(
          enrollment => !(enrollment.userId === action.payload.userId && enrollment.courseId === action.payload.courseId)
        )
      };
    
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        studentProgress: state.studentProgress.map(progress =>
          progress.studentId === action.payload.studentId && progress.courseId === action.payload.courseId
            ? action.payload
            : progress
        ).concat(
          state.studentProgress.find(p => p.studentId === action.payload.studentId && p.courseId === action.payload.courseId)
            ? []
            : [action.payload]
        )
      };
    
    case 'SYNC_COURSE_UPDATE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.courseId
            ? { ...course, ...action.payload.updates }
            : course
        )
      };
    
    default:
      return state;
  }
}

// Provider
export function CourseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(courseReducer, {
    courses: [],
    enrollments: [],
    studentProgress: [],
    loading: false,
    error: null
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCourses = localStorage.getItem('courses');
    const savedEnrollments = localStorage.getItem('enrollments');
    const savedProgress = localStorage.getItem('studentProgress');

    if (savedCourses) {
      try {
        dispatch({ type: 'SET_COURSES', payload: JSON.parse(savedCourses) });
      } catch (error) {
        console.error('Error loading courses from localStorage:', error);
      }
    }

    if (savedEnrollments) {
      try {
        dispatch({ type: 'SET_ENROLLMENTS', payload: JSON.parse(savedEnrollments) });
      } catch (error) {
        console.error('Error loading enrollments from localStorage:', error);
      }
    }

    if (savedProgress) {
      try {
        dispatch({ type: 'UPDATE_PROGRESS', payload: JSON.parse(savedProgress) });
      } catch (error) {
        console.error('Error loading progress from localStorage:', error);
      }
    }
  }, []);

  // Subscribe to real-time course updates
  useEffect(() => {
    const handleCourseUpdate = (event: CourseUpdateEvent) => {
      switch (event.type) {
        case 'course_created':
          if (event.data) {
            dispatch({ type: 'ADD_COURSE', payload: event.data });
          }
          break;
        case 'course_updated':
          if (event.data) {
            dispatch({ type: 'UPDATE_COURSE', payload: event.data });
          }
          break;
        case 'course_deleted':
          dispatch({ type: 'DELETE_COURSE', payload: event.courseId });
          break;
        case 'enrollment_changed':
          if (event.data) {
            if (event.data.action === 'enrolled') {
              dispatch({ type: 'ADD_ENROLLMENT', payload: event.data });
            } else if (event.data.action === 'unenrolled') {
              dispatch({ type: 'REMOVE_ENROLLMENT', payload: { 
                userId: event.data.userId, 
                courseId: event.courseId 
              }});
            }
          }
          break;
        case 'progress_updated':
          if (event.data) {
            dispatch({ type: 'UPDATE_PROGRESS', payload: event.data.progressData });
          }
          break;
        case 'admin_override':
          // Handle admin override notifications
          console.log('Admin override detected:', event);
          break;
        case 'bulk_operation':
          // Handle bulk operation notifications
          console.log('Bulk operation completed:', event);
          break;
      }
    };

    // Subscribe to all course updates
    const unsubscribe = courseSync.subscribeToAll(handleCourseUpdate);

    return () => {
      unsubscribe();
    };
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(state.courses));
  }, [state.courses]);

  useEffect(() => {
    localStorage.setItem('enrollments', JSON.stringify(state.enrollments));
  }, [state.enrollments]);

  useEffect(() => {
    localStorage.setItem('studentProgress', JSON.stringify(state.studentProgress));
  }, [state.studentProgress]);

  // API Functions
  const createCourse = async (courseData: Partial<Course>): Promise<Course | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: courseData.name,
          description: courseData.description,
          maxStudents: courseData.maxStudents || 50,
          status: courseData.status || 'draft'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      const result = await response.json();
      if (result.success) {
        const newCourse: Course = {
          ...result.course,
          modules: courseData.modules || [],
          enrolledStudentsList: [],
          isFeatured: false,
          platformRecommendation: false,
          revenueSharing: 0
        };
        
        dispatch({ type: 'ADD_COURSE', payload: newCourse });
        return newCourse;
      }
      
      return null;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      const result = await response.json();
      if (result.success) {
        const updatedCourse = { ...result.course, ...updates };
        dispatch({ type: 'UPDATE_COURSE', payload: updatedCourse });
        return true;
      }
      
      return false;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteCourse = async (courseId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'DELETE_COURSE', payload: courseId });
        return true;
      }
      
      return false;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const publishCourse = async (courseId: string): Promise<boolean> => {
    return updateCourse(courseId, { status: 'published' });
  };

  const unpublishCourse = async (courseId: string): Promise<boolean> => {
    return updateCourse(courseId, { status: 'draft' });
  };

  const enrollInCourse = async (courseId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to enroll in course');
      }

      const result = await response.json();
      if (result.success) {
        const enrollment: Enrollment = {
          id: result.enrollment.id,
          userId: user?.id || '',
          courseId,
          enrolledAt: result.enrollment.enrolledAt,
          progress: 0,
          lastAccessed: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_ENROLLMENT', payload: enrollment });
        
        // Update course enrollment count
        const course = state.courses.find(c => c.id === courseId);
        if (course) {
          dispatch({ type: 'UPDATE_COURSE', payload: {
            ...course,
            enrolledStudents: course.enrolledStudents + 1,
            enrolledStudentsList: [...course.enrolledStudentsList, user?.id || '']
          }});
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const unenrollFromCourse = async (courseId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to unenroll from course');
      }

      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'REMOVE_ENROLLMENT', payload: { userId: user?.id || '', courseId } });
        
        // Update course enrollment count
        const course = state.courses.find(c => c.id === courseId);
        if (course) {
          dispatch({ type: 'UPDATE_COURSE', payload: {
            ...course,
            enrolledStudents: Math.max(0, course.enrolledStudents - 1),
            enrolledStudentsList: course.enrolledStudentsList.filter(id => id !== user?.id)
          }});
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const markLectureComplete = async (courseId: string, lectureId: string): Promise<boolean> => {
    try {
      const currentProgress = getStudentProgress(courseId);
      const completedLectures = currentProgress ? [...currentProgress.completedLectures, lectureId] : [lectureId];
      
      const course = getCourseById(courseId);
      if (!course) return false;
      
      const totalLectures = course.modules.reduce((total, module) => total + module.lectures.length, 0);
      const progressPercentage = Math.round((completedLectures.length / totalLectures) * 100);
      
      const updatedProgress: StudentProgress = {
        studentId: user?.id || '',
        courseId,
        completedLectures,
        lastAccessed: new Date().toISOString(),
        progressPercentage
      };
      
      dispatch({ type: 'UPDATE_PROGRESS', payload: updatedProgress });
      
      // Emit progress update for real-time sync
      const { emitProgressUpdated } = await import('./course-sync');
      emitProgressUpdated(courseId, user?.id || '', updatedProgress);
      
      return true;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    }
  };

  const getStudentProgress = (courseId: string): StudentProgress | null => {
    return state.studentProgress.find(
      progress => progress.studentId === user?.id && progress.courseId === courseId
    ) || null;
  };

  const fetchCourses = useCallback(async (role: 'student' | 'tutor' | 'admin'): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/courses?role=${role}`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const result = await response.json();
      if (result.success) {
        const courses: Course[] = result.courses.map((course: any) => ({
          ...course,
          modules: course.modules || [],
          enrolledStudentsList: course.enrolledStudentsList || [],
          isFeatured: course.isFeatured || false,
          platformRecommendation: course.platformRecommendation || false,
          revenueSharing: course.revenueSharing || 0
        }));
        
        dispatch({ type: 'SET_COURSES', payload: courses });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]); // FIXED: Memoize fetchCourses to prevent recreation on every render

  const fetchEnrollments = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch('/api/student/courses/enrolled');
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const result = await response.json();
      if (result.success) {
        const dbEnrollments: Enrollment[] = result.courses.map((course: any) => ({
          id: `${user?.id}-${course.id}`,
          userId: user?.id || '',
          courseId: course.id,
          enrolledAt: course.createdAt,
          progress: 0,
          lastAccessed: new Date().toISOString()
        }));
        
        // Get existing JSON course enrollments from localStorage
        const existingEnrollments = state.enrollments.filter(e => 
          e.id.startsWith('json-') && e.userId === user?.id
        );
        
        // Merge database enrollments with JSON course enrollments
        const allEnrollments = [...dbEnrollments, ...existingEnrollments];
        
        dispatch({ type: 'SET_ENROLLMENTS', payload: allEnrollments });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Utility functions
  const getCourseById = (courseId: string): Course | null => {
    // CRITICAL FUNCTION FOR COURSE DETAIL NAVIGATION
    // 
    // ARCHITECTURE CONTEXT FOR NEW DEVELOPERS:
    // This function is called when instructors click "Manage" on a course.
    // It looks for the course in the current state.courses array.
    // 
    // DATA FLOW:
    // 1. Instructor visits /instructor/courses (course list page)
    // 2. fetchCourses('tutor') loads courses into state.courses
    // 3. Instructor clicks "Manage" → navigates to /instructor/courses/[courseId]
    // 4. Course detail page calls getCourseById(courseId)
    // 5. If found in state: Returns course object with modules
    // 6. If NOT found: Returns null → triggers API call to /api/courses/[courseId]
    // 
    // RELATED FILES:
    // - /app/instructor/courses/[courseId]/page.tsx - Calls this function
    // - /app/api/courses/[courseId]/route.ts - Fallback API when course not in state
    // - /app/api/courses/route.ts - Populates state.courses initially
    return state.courses.find(course => course.id === courseId) || null;
  };

  const getEnrolledCourses = (): Course[] => {
    const enrolledCourseIds = state.enrollments
      .filter(enrollment => enrollment.userId === user?.id)
      .map(enrollment => enrollment.courseId);
    
    return state.courses.filter(course => enrolledCourseIds.includes(course.id));
  };

  const getInstructorCourses = (): Course[] => {
    // INSTRUCTOR COURSE FILTERING - Critical function for course visibility
    // 
    // PURPOSE: Returns only courses that the current instructor owns/manages
    // This fixes the issue where instructors couldn't see their own courses
    // 
    // ARCHITECTURE CONTEXT FOR NEW DEVELOPERS:
    // When instructors log in and visit /instructor/courses, this function determines
    // which courses appear in their dashboard. The main concept is "center-based ownership":
    // - Users belong to Centers (educational institutions)
    // - Courses belong to Centers  
    // - Instructors can manage courses from their assigned center
    // 
    // DATABASE RELATIONSHIPS:
    // - User.centerId → which center the instructor belongs to
    // - Course.instructorId → which center owns the course (confusing name!)
    // - Course ownership = User.centerId === Course.instructorId
    // 
    // RELATED MODULES TO UNDERSTAND:
    // - /app/api/courses/route.ts - Sets course.instructorId = user.centerId during creation
    // - /app/instructor/courses/page.tsx - Displays filtered results from this function
    // - /prisma/schema.prisma - User.centerId and Class.centerId relationships
    // - /app/api/courses/[courseId]/route.ts - Uses same ownership logic for permissions
    // 
    // FILTERING LOGIC:
    // Multiple ownership patterns are supported for flexibility:
    // 1. Direct match: course.instructorId === user.id (individual ownership)
    // 2. Center match: course.instructorId === user.centerId (center-based ownership)
    // 3. Role-based: tutor role with center access
    // This ensures courses show up regardless of how they were created
    
    if (!user) return [];
    
    return state.courses.filter(course => {
      if (course.source === 'json') return false; // JSON courses are read-only
      
      // Multiple ways to match instructor ownership:
      // 1. Direct instructor ID match
      // 2. Center ID match (when course.instructorId is a centerId)
      // 3. User center match (user belongs to the same center as course)
      return (
        course.instructorId === user.id ||
        course.instructorId === user.centerId ||
        (user.centerId && course.instructorId === user.centerId) ||
        // Fallback: if user is tutor role and has access to this center
        (user.role === 'tutor' && course.instructorId === user.centerId)
      );
    });
  };

  const getAllCourses = (): Course[] => {
    return state.courses;
  };

  const value: CourseContextType = {
    state,
    dispatch,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    unpublishCourse,
    enrollInCourse,
    unenrollFromCourse,
    markLectureComplete,
    getStudentProgress,
    fetchCourses,
    fetchEnrollments,
    getCourseById,
    getEnrolledCourses,
    getInstructorCourses,
    getAllCourses
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
}

// Hook
export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}
