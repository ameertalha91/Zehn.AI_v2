import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, createAuthResponse } from '@/lib/api-auth';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

const submitSchema = z.object({
  assignmentId: z.string(),
  content: z.string().min(1, 'Submission content is required')
});

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!hasRole(user, ['student'])) {
      return createAuthResponse('Unauthorized: Student access required');
    }

    const body = await request.json();
    const validation = submitSchema.safeParse(body);
    
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { assignmentId, content } = validation.data;

    // Check if assignment exists and student has access
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          include: {
            students: {
              where: { userId: user!.id }
            }
          }
        }
      }
    });

    if (!assignment) {
      return createAuthResponse('Assignment not found', 404);
    }

    if (assignment.class.students.length === 0) {
      return createAuthResponse('You are not enrolled in this class');
    }

    // Check for existing submission
    const existingSubmission = await db.assignmentSubmission.findFirst({
      where: {
        assignmentId,
        studentId: user!.id
      }
    });

    if (existingSubmission) {
      return Response.json(
        { error: 'You have already submitted this assignment' },
        { status: 400 }
      );
    }

    // Create submission
    const submission = await db.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: user!.id,
        extractedText: content,
        fileName: 'text_submission.txt',
        filePath: '',
        fileSize: content.length,
        status: new Date() > assignment.dueDate ? 'LATE' : 'SUBMITTED'
      }
    });

    return Response.json({
      success: true,
      submission
    });

  } catch (error) {
    console.error('Error submitting assignment:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
