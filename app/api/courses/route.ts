/**
 * COURSES API - Database-powered course management system
 * 
 * PURPOSE:
 * This API handles all course-related operations using only the Prisma database.
 * No more dual data sources - everything is now consistently stored in the database.
 * 
 * WHAT THIS MODULE DOES:
 * - GET: Fetches courses based on user role and permissions
 * - POST: Creates new courses in the database
 * - Role-based access control (admin, tutor, student)
 * - Course enrollment tracking and management
 * 
 * ARCHITECTURE OVERVIEW:
 * - Pure database-driven approach using Prisma ORM
 * - Role-based course visibility and access control
 * - Integrated enrollment and lecture management
 * - Real-time course synchronization events
 * 
 * RELATED MODULES TO UNDERSTAND:
 * - /prisma/schema.prisma - Class, Center, Enrollment, Lecture models
 * - /lib/db.ts - Prisma database connection
 * - /lib/api-auth.ts - Authentication and role verification
 * - /lib/course-sync.ts - Real-time event synchronization
 * - /app/admin/courses/page.tsx - Admin course management UI
 * - /app/student/courses/page.tsx - Student course browsing
 * - /app/api/courses/[courseId]/enroll/route.ts - Course enrollment API
 * 
 * DATABASE RELATIONSHIPS:
 * - Class belongs to Center (centerId foreign key)
 * - Class has many Enrollments (student relationships)
 * - Class has many Lectures (course content)
 * - Class has many Assignments (coursework)
 * 
 * ARCHITECTURE NOTE:
 * This API was cleaned up to remove JSON file dependencies, ensuring
 * all course data flows through the database for consistency and integrity.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/api-auth';
import { emitCourseCreated } from '@/lib/course-sync';

/**
 * DATABASE UTILITY FUNCTIONS
 * Helper functions for course data processing and transformation
 */

// Transform database course to frontend-expected format
const transformCourseData = (course: any) => ({
  id: course.id,
  name: course.name,
  description: course.description || '',
  instructor: course.center?.name || 'Unknown',
  instructorId: course.centerId,
  enrolledStudents: course._count?.students || 0,
  maxStudents: course.maxStudents || 50,
  status: 'published', // Default status for all courses
  createdAt: course.createdAt,
  updatedAt: course.updatedAt,
  source: 'database',
  enrolledStudentsList: course.students?.map((enrollment: any) => enrollment.userId) || [],
  modules: [{
    id: 'default-module',
    title: 'Course Content',
    lectures: (course.lectures || []).map(lecture => ({
      id: lecture.id,
      title: lecture.title,
      youtubeUrl: lecture.videoUrl,
      duration: 30, // Default duration - could be enhanced with video metadata
      description: lecture.transcript || '',
      order: 0 // Default order - could be enhanced with proper sequencing
    }))
  }]
});

// GET: Fetch courses based on user role
// This endpoint provides different course data based on user permissions
export async function GET(req: NextRequest) {
  try {
    // AUTHENTICATION CHECK
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ROLE-BASED DATA FILTERING
    const url = new URL(req.url);
    const role = url.searchParams.get('role') || user.role;
    const instructorId = url.searchParams.get('instructorId');

    let courses;

    // ROLE-BASED COURSE QUERYING
    if (hasRole(user, ['admin'])) {
      // ADMIN: Can see all courses in the system
      courses = await prisma.class.findMany({
        include: {
          center: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              students: true
            }
          },
          students: {
            select: {
              userId: true
            }
          },
          lectures: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (hasRole(user, ['tutor']) || role === 'tutor') {
      // TUTOR: Can only see courses from their assigned center
      const userCenter = await prisma.center.findFirst({
        where: {
          id: user.centerId
        }
      });

      if (!userCenter) {
        // If user doesn't have a center, find the default center
        const defaultCenter = await prisma.center.findFirst();
        if (!defaultCenter) {
          return NextResponse.json({ success: true, courses: [] });
        }
        courses = await prisma.class.findMany({
          where: {
            centerId: defaultCenter.id
          },
          include: {
            center: {
              select: {
                name: true
              }
            },
            _count: {
              select: {
                students: true
              }
            },
            students: {
              select: {
                userId: true
              }
            },
            lectures: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      } else {
        courses = await prisma.class.findMany({
          where: {
            centerId: user.centerId
          },
          include: {
            center: {
              select: {
                name: true
              }
            },
            _count: {
              select: {
                students: true
              }
            },
            students: {
              select: {
                userId: true
              }
            },
            lectures: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      }
    } else {
      // STUDENT: Can see all published courses (no restrictions for now)
      courses = await prisma.class.findMany({
        where: {
          // Add published status when we implement it
        },
        include: {
          center: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              students: true
            }
          },
          students: {
            select: {
              userId: true
            }
          },
          lectures: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    // DATA TRANSFORMATION
    // Convert database courses to frontend-expected format
    const transformedCourses = courses.map(transformCourseData);

    return NextResponse.json({
      success: true,
      courses: transformedCourses,
      total: transformedCourses.length
    });

  } catch (error: any) {
    console.error('Error fetching courses:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch courses',
      details: error.message
    }, { status: 500 });
  }
}

// POST: Create a new course
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || !hasRole(user, ['tutor', 'admin'])) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, maxStudents, status = 'draft' } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Course name is required' }, { status: 400 });
    }

    // CENTER ASSIGNMENT LOGIC - Critical for course ownership
    // 
    // PURPOSE: Ensures every instructor has a center association for course ownership
    // This fixes the issue where instructors couldn't see their own courses
    // 
    // ARCHITECTURE NOTE:
    // - Courses belong to Centers (educational institutions)
    // - Users (instructors) belong to Centers via centerId foreign key
    // - Course ownership is determined by matching user.centerId with course.centerId
    // 
    // RELATED MODULES TO UNDERSTAND:
    // - /prisma/schema.prisma - User.centerId and Class.centerId relationships
    // - /lib/course-context.tsx - getInstructorCourses() filtering logic
    // - /app/instructor/courses/page.tsx - Displays courses for current user's center
    // 
    // CENTER ASSIGNMENT FLOW:
    // 1. Check if user already has a centerId (existing association)
    // 2. If not, find the default center or create one (single-tenant setup)
    // 3. Update user.centerId to establish the relationship
    // 4. Use this centerId when creating the course
    // This ensures immediate course visibility for the instructor
    
    let centerId = user.centerId;
    if (!centerId) {
      // Find the default center or create one
      let center = await prisma.center.findFirst();
      if (!center) {
        center = await prisma.center.create({
          data: { name: "Zehn.AI CSS Academy" }
        });
      }
      centerId = center.id;
      
      // Update the user with the centerId so they can access their courses
      await prisma.user.update({
        where: { id: user.id },
        data: { centerId: center.id }
      });
    }

    const course = await prisma.class.create({
      data: {
        name,
        description: description || '',
        maxStudents: maxStudents || 50,
        centerId: centerId,
        // Add more fields as needed
      },
      include: {
        center: {
          select: {
            name: true
          }
        }
      }
    });

    const courseData = {
      id: course.id,
      name: course.name,
      description: course.description,
      instructor: course.center?.name || 'Unknown',
      instructorId: course.centerId,
      enrolledStudents: 0,
      maxStudents: course.maxStudents,
      status,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };

    // Emit sync event
    emitCourseCreated(course.id, courseData);

    return NextResponse.json({
      success: true,
      course: courseData
    });

  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create course'
    }, { status: 500 });
  }
}
