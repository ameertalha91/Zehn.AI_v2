import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/api-auth';
import { emitCourseUpdated, emitCourseDeleted } from '@/lib/course-sync';
export const dynamic = 'force-dynamic';

/**
 * INDIVIDUAL COURSE API - Detailed course data for management interfaces
 * 
 * ARCHITECTURE CONTEXT FOR NEW DEVELOPERS:
 * This endpoint serves individual course data when instructors click "Manage" on a course.
 * It's different from the course list API (/api/courses/route.ts) because it returns
 * MORE detailed data including students and course content structure.
 * 
 * KEY RELATIONSHIPS TO UNDERSTAND:
 * - User.centerId links users to educational centers
 * - Class.centerId links courses to centers (course ownership)
 * - Enrollment links students to courses
 * - Lecture contains the actual course content (videos)
 * 
 * DATA FLOW:
 * 1. Frontend: Instructor clicks "Manage" on course list
 * 2. Navigation: Goes to /instructor/courses/[courseId]
 * 3. Frontend: useCourse().getCourseById() looks for course in state
 * 4. If not found: Frontend calls this API to fetch detailed course data
 * 5. This API: Returns course with modules structure for content management
 * 
 * RELATED FILES TO UNDERSTAND:
 * - /app/api/courses/route.ts - Course list API (different data structure)
 * - /app/instructor/courses/[courseId]/page.tsx - Frontend that consumes this data
 * - /lib/course-context.tsx - Frontend state management and getCourseById()
 * - /prisma/schema.prisma - Database relationships (User, Class, Center, Lecture)
 */

// GET: Fetch a single course with detailed data for management interfaces
export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // CRITICAL: Include lectures in the database query
    // The frontend expects courses to have a modules structure with lectures
    // This was missing before, causing "Course Not Found" errors
    const course = await prisma.class.findUnique({
      where: { id: params.courseId },
      include: {
        center: {
          select: {
            name: true
          }
        },
        students: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        lectures: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    // PERMISSION CHECK FIX
    // 
    // OLD BUG: course.centerId === user.id (comparing center to user ID)
    // NEW FIX: course.centerId === user.centerId (comparing center to center)
    // 
    // CONTEXT: Instructors belong to centers via User.centerId
    // Courses belong to centers via Class.centerId
    // Ownership = same center
    const isOwner = course.centerId === user.centerId; // ✅ FIXED
    const isAdmin = hasRole(user, ['admin']);
    
    if (!isOwner && !isAdmin) {
      // Check if student is enrolled
      const isEnrolled = course.students.some(enrollment => enrollment.userId === user.id);
      if (!isEnrolled) {
        return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
      }
    }

    // DATA STRUCTURE CONSISTENCY FIX
    // 
    // PROBLEM: Course list API returns courses with modules[], but this API didn't
    // SOLUTION: Transform database data to match frontend expectations
    // 
    // FRONTEND EXPECTATION: Course has modules[] array with lectures inside
    // DATABASE REALITY: Course has lectures[] directly attached
    // TRANSFORMATION: Wrap lectures in a default module structure
    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        name: course.name,
        description: course.description,
        instructor: course.center?.name || 'Unknown',
        instructorId: course.centerId,
        enrolledStudents: course.students.length,
        maxStudents: course.maxStudents,
        status: 'published', // Default for now
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        // CRITICAL: Include modules structure for frontend consistency
        // This matches the structure returned by /api/courses/route.ts
        modules: [{
          id: 'default-module',
          title: 'Course Content',
          description: 'Main course content',
          order: 0,
          lectures: (course.lectures || []).map((lecture, index) => ({
            id: lecture.id,
            title: lecture.title,
            youtubeUrl: lecture.videoUrl,
            duration: 30, // Default duration - could be enhanced with video metadata
            keywords: [],
            description: lecture.transcript || '',
            order: index + 1,
            isCompleted: false
          }))
        }],
        // Include detailed student data for the Students tab
        students: course.students.map(enrollment => ({
          id: enrollment.user.id,
          name: enrollment.user.name,
          email: enrollment.user.email,
          enrolledAt: enrollment.createdAt
        })),
        // Include source field for consistency with course list API
        source: 'database'
      }
    });

  } catch (error: any) {
    console.error('Error fetching course:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch course'
    }, { status: 500 });
  }
}

// PUT: Update a course
export async function PUT(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, maxStudents, status } = body;

    // Check if course exists
    const existingCourse = await prisma.class.findUnique({
      where: { id: params.courseId }
    });

    if (!existingCourse) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    // Check permissions
    const isOwner = existingCourse.centerId === user.centerId; // ✅ FIXED
    const isAdmin = hasRole(user, ['admin']);
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const updatedCourse = await prisma.class.update({
      where: { id: params.courseId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(maxStudents && { maxStudents }),
        // Add status field when we implement it
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
      id: updatedCourse.id,
      name: updatedCourse.name,
      description: updatedCourse.description,
      instructor: updatedCourse.center?.name || 'Unknown',
      instructorId: updatedCourse.centerId,
      maxStudents: updatedCourse.maxStudents,
      status: status || 'published',
      createdAt: updatedCourse.createdAt,
      updatedAt: updatedCourse.updatedAt
    };

    // Emit sync event
    emitCourseUpdated(params.courseId, courseData);

    return NextResponse.json({
      success: true,
      course: courseData
    });

  } catch (error: any) {
    console.error('Error updating course:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update course'
    }, { status: 500 });
  }
}

// DELETE: Delete a course
export async function DELETE(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if course exists (either in database or JSON pathways)
    let existingCourse = await prisma.class.findUnique({
      where: { id: params.courseId }
    });

    // If not found in database, check if it's a JSON pathway course
    if (!existingCourse) {
      // Check if this is a JSON pathway course
      const response = await fetch(`${req.nextUrl.origin}/api/courses?role=admin`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const jsonCourse = result.courses.find((c: any) => c.id === params.courseId && c.source === 'json');
          if (jsonCourse) {
            // JSON pathway courses cannot be deleted from the database
            // They are read-only from the JSON file
            return NextResponse.json({ 
              success: false, 
              error: 'Cannot delete JSON pathway courses. They are read-only.' 
            }, { status: 400 });
          }
        }
      }
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    // Check permissions
    const isOwner = existingCourse.centerId === user.centerId; // ✅ FIXED
    const isAdmin = hasRole(user, ['admin']);
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Delete related records first to avoid foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete enrollments
      await tx.enrollment.deleteMany({
        where: { classId: params.courseId }
      });

      // Delete lectures
      await tx.lecture.deleteMany({
        where: { classId: params.courseId }
      });

      // Delete quizzes
      await tx.quiz.deleteMany({
        where: { classId: params.courseId }
      });

      // Delete messages
      await tx.message.deleteMany({
        where: { classId: params.courseId }
      });

      // Delete assignments
      await tx.assignment.deleteMany({
        where: { classId: params.courseId }
      });

      // Finally delete the course
      await tx.class.delete({
        where: { id: params.courseId }
      });
    });

    // Emit sync event
    emitCourseDeleted(params.courseId);

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting course:', error);
    return NextResponse.json({
      success: false,
      error: `Failed to delete course: ${error.message}`
    }, { status: 500 });
  }
}
