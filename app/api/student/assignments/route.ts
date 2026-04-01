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

    // Get assignments for the student's enrolled classes
    const enrollments = await db.enrollment.findMany({
      where: { 
        userId: user!.id,
        role: 'student'
      },
      include: {
        klass: {
          include: {
            assignments: {
              include: {
                submissions: {
                  where: { studentId: user!.id },
                  include: {
                    feedback: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Flatten assignments from all enrolled classes
    const assignments = enrollments.flatMap(enrollment => 
      enrollment.klass.assignments.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        maxPoints: assignment.maxPoints,
        classId: assignment.classId,
        className: enrollment.klass.name,
        createdAt: assignment.createdAt,
        submission: assignment.submissions[0] ? {
          id: assignment.submissions[0].id,
          status: assignment.submissions[0].status,
          submittedAt: assignment.submissions[0].submittedAt,
          grade: assignment.submissions[0].feedback?.grade,
          feedback: assignment.submissions[0].feedback?.comments,
          filePath: assignment.submissions[0].filePath,
          fileName: assignment.submissions[0].fileName
        } : undefined
      }))
    );

    // Sort by due date
    assignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return Response.json({ 
      success: true,
      assignments 
    });

  } catch (error) {
    console.error('Error fetching student assignments:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
