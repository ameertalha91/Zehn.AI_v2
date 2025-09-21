import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, createAuthResponse } from '@/lib/api-auth';
import { z } from 'zod';

const enrollSchema = z.object({
  courseId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!hasRole(user, ['student'])) {
      return createAuthResponse('Unauthorized: Student access required');
    }

    const body = await request.json();
    const validation = enrollSchema.safeParse(body);
    
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { courseId } = validation.data;

    // Check if course exists
    const course = await db.class.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return createAuthResponse('Course not found', 404);
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: user!.id,
        classId: courseId
      }
    });

    if (existingEnrollment) {
      return Response.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId: user!.id,
        classId: courseId,
        role: 'student'
      },
      include: {
        klass: true
      }
    });

    return Response.json({
      success: true,
      enrollment,
      message: `Successfully enrolled in ${course.name}`
    });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
