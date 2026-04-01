import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, createAuthResponse } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!hasRole(user, ['student'])) {
      return createAuthResponse('Unauthorized: Student access required');
    }

    // Get all available courses
    const courses = await db.class.findMany({
      include: {
        center: true,
        lectures: true,
        students: {
          where: { userId: user!.id }
        },
        _count: {
          select: { students: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data for frontend
    const formattedCourses = courses.map(course => ({
      id: course.id,
      name: course.name,
      description: `CSS preparation course at ${course.center.name}`,
      instructor: {
        name: 'Course Instructor',
        email: 'instructor@zehn.ai'
      },
      lectures: course.lectures.map(lecture => ({
        id: lecture.id,
        title: lecture.title,
        duration: 60, // Default duration
        completed: false
      })),
      enrolled: course.students.length > 0,
      progress: 0, // Calculate based on completed lectures
      enrollmentCount: course._count.students
    }));

    return Response.json({ 
      success: true,
      courses: formattedCourses
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
