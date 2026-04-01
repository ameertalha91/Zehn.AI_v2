import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, createAuthResponse } from '@/lib/api-auth';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

const gradeSchema = z.object({
  submissionId: z.string(),
  grade: z.number().min(0),
  feedback: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!hasRole(user, ['instructor', 'tutor', 'educator'])) {
      return createAuthResponse('Unauthorized: Instructor access required');
    }

    const body = await request.json();
    const validation = gradeSchema.safeParse(body);
    
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { submissionId, grade, feedback } = validation.data;

    // Verify submission exists and instructor has access
    const submission = await db.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            class: true
          }
        }
      }
    });

    if (!submission) {
      return createAuthResponse('Submission not found', 404);
    }

    // Verify instructor created this assignment
    if (submission.assignment.createdBy !== user!.id) {
      return createAuthResponse('You can only grade your own assignments');
    }

    // Check if grade is within max points
    if (grade > submission.assignment.maxPoints) {
      return Response.json(
        { error: `Grade cannot exceed ${submission.assignment.maxPoints} points` },
        { status: 400 }
      );
    }

    // Create or update feedback
    const feedbackData = await db.assignmentFeedback.upsert({
      where: { submissionId },
      create: {
        submissionId,
        teacherId: user!.id,
        grade,
        comments: feedback
      },
      update: {
        grade,
        comments: feedback,
        teacherId: user!.id
      }
    });

    // Update submission status
    await db.assignmentSubmission.update({
      where: { id: submissionId },
      data: { status: 'GRADED' }
    });

    return Response.json({
      success: true,
      feedback: feedbackData
    });

  } catch (error) {
    console.error('Error grading assignment:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
