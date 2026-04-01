import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';

// GET: Fetch enrolled courses for a student
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Allow students and admins to access enrolled courses
    if (!hasRole(user, ['student', 'admin'])) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Fetch enrolled courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id
      },
      include: {
        klass: {
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
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const courses = enrollments.map(enrollment => ({
      id: enrollment.klass.id,
      name: enrollment.klass.name,
      description: enrollment.klass.description || '',
      instructor: enrollment.klass.center?.name || 'Unknown',
      instructorId: enrollment.klass.centerId,
      enrolledStudents: enrollment.klass._count.students,
      maxStudents: enrollment.klass.maxStudents || 50,
      status: 'published', // Default for enrolled courses
      createdAt: enrollment.klass.createdAt,
      updatedAt: enrollment.klass.updatedAt,
      enrolledAt: enrollment.createdAt
    }));

    return NextResponse.json({
      success: true,
      courses
    });

  } catch (error: any) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch enrolled courses'
    }, { status: 500 });
  }
}