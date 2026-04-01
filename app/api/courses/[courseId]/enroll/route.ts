/**
 * ENROLLMENT API - Handles course enrollment and unenrollment
 * 
 * This API manages student enrollment in courses, supporting both database courses
 * and JSON pathway courses with different enrollment strategies.
 * 
 * ARCHITECTURE OVERVIEW:
 * - POST: Enroll student in a course
 * - DELETE: Unenroll student from a course
 * - Supports both database courses (stored in Prisma) and JSON courses (localStorage)
 * - Integrates with course-sync for real-time updates
 * 
 * ENROLLMENT STRATEGIES:
 * - Database courses: Enrollment stored in Prisma database
 * - JSON pathway courses: Enrollment handled via localStorage on frontend
 * 
 * RELATED MODULES TO UNDERSTAND:
 * - /lib/db.ts - Database operations for enrollment storage
 * - /lib/api-auth.ts - User authentication and role verification
 * - /lib/course-sync.ts - Real-time synchronization
 * - /app/student/courses/[courseId]/page.tsx - Frontend enrollment UI
 * - /lib/course-context.tsx - Frontend enrollment state management
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/api-auth';
import { emitEnrollmentChanged } from '@/lib/course-sync';
export const dynamic = 'force-dynamic';

// POST: Enroll a student in a course
export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    // AUTHENTICATION & AUTHORIZATION
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // ROLE-BASED ENROLLMENT PERMISSIONS
    // Only students and admins can enroll in courses
    if (!hasRole(user, ['student', 'admin'])) {
      return NextResponse.json({ success: false, error: 'Only students can enroll in courses' }, { status: 403 });
    }

    // COURSE EXISTENCE CHECK
    // First check if it's a database course
    let course = await prisma.class.findUnique({
      where: { id: params.courseId },
      include: {
        students: true
      }
    });

    // DUAL ENROLLMENT STRATEGY
    // If not found in database, check if it's a JSON pathway course
    if (!course) {
      // For JSON pathway courses, we'll create a virtual enrollment
      // Check if this is a valid JSON pathway course ID
      const response = await fetch(`${req.nextUrl.origin}/api/courses?role=student`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const jsonCourse = result.courses.find((c: any) => c.id === params.courseId && c.source === 'json');
          if (jsonCourse) {
            // For JSON courses, we'll store enrollment in localStorage on the frontend
            // and return success here
            return NextResponse.json({
              success: true,
              enrollment: {
                id: `json-${params.courseId}-${user.id}`,
                userId: user.id,
                courseId: params.courseId,
                enrolledAt: new Date().toISOString(),
                source: 'json'
              }
            });
          }
        }
      }
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        classId: params.courseId
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ success: false, error: 'Already enrolled in this course' }, { status: 400 });
    }

    // Check enrollment capacity
    if (course.students.length >= (course.maxStudents || 50)) {
      return NextResponse.json({ success: false, error: 'Course is full' }, { status: 400 });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        classId: params.courseId,
        role: 'STUDENT'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        klass: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const enrollmentData = {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.classId,
      enrolledAt: enrollment.createdAt,
      user: enrollment.user,
      course: enrollment.klass
    };

    // Emit sync event
    emitEnrollmentChanged(params.courseId, enrollmentData);

    return NextResponse.json({
      success: true,
      enrollment: enrollmentData
    });

  } catch (error: any) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to enroll in course'
    }, { status: 500 });
  }
}

// DELETE: Unenroll a student from a course
export async function DELETE(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if enrollment exists (either in database or JSON pathways)
    let enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        classId: params.courseId
      }
    });

    // If not found in database, check if it's a JSON pathway course
    if (!enrollment) {
      // For JSON pathway courses, we'll handle unenrollment on the frontend
      // Check if this is a valid JSON pathway course ID
      const response = await fetch(`${req.nextUrl.origin}/api/courses?role=student`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const jsonCourse = result.courses.find((c: any) => c.id === params.courseId && c.source === 'json');
          if (jsonCourse) {
            // For JSON courses, return success (unenrollment handled on frontend)
            return NextResponse.json({
              success: true,
              message: 'Successfully unenrolled from course'
            });
          }
        }
      }
      return NextResponse.json({ success: false, error: 'Not enrolled in this course' }, { status: 404 });
    }

    // Check permissions (student can unenroll themselves, admin can unenroll anyone)
    const isOwner = enrollment.userId === user.id;
    const isAdmin = hasRole(user, ['admin']);
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    await prisma.enrollment.delete({
      where: { id: enrollment.id }
    });

    // Emit sync event
    emitEnrollmentChanged(params.courseId, { action: 'unenrolled', userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });

  } catch (error: any) {
    console.error('Error unenrolling from course:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to unenroll from course'
    }, { status: 500 });
  }
}
