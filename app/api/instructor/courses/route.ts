import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, createAuthResponse } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!hasRole(user, ['instructor', 'tutor', 'educator'])) {
      return createAuthResponse('Unauthorized: Instructor access required');
    }

    // Get courses where user is an instructor
    const courses = await db.class.findMany({
      where: {
        OR: [
          // Courses in centers where user is a tutor
          {
            center: {
              tutors: {
                some: { id: user!.id }
              }
            }
          },
          // Courses where user is enrolled as tutor
          {
            students: {
              some: {
                userId: user!.id,
                role: 'tutor'
              }
            }
          }
        ]
      },
      include: {
        lectures: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { 
            students: {
              where: { role: 'student' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform for frontend
    const formattedCourses = courses.map(course => ({
      id: course.id,
      name: course.name,
      description: 'CSS preparation course',
      createdBy: user!.id,
      lectures: course.lectures.map(lecture => ({
        id: lecture.id,
        title: lecture.title,
        videoUrl: lecture.videoUrl,
        duration: 60,
        keywords: [],
        createdAt: lecture.createdAt
      })),
      _count: {
        students: course._count.students
      },
      createdAt: course.createdAt
    }));

    return Response.json({ 
      success: true,
      courses: formattedCourses
    });

  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
