import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, createAuthResponse } from '@/lib/api-auth';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string(),
  maxPoints: z.number().min(0),
  classId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!hasRole(user, ['instructor', 'tutor', 'educator'])) {
      return createAuthResponse('Unauthorized: Instructor access required');
    }

    const body = await request.json();
    const validation = createSchema.safeParse(body);
    
    if (!validation.success) {
      return Response.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { title, description, dueDate, maxPoints, classId } = validation.data;

    // If classId provided, verify instructor has access to the class
    if (classId) {
      const classExists = await db.class.findFirst({
        where: {
          id: classId,
          OR: [
            { 
              center: {
                tutors: {
                  some: { id: user!.id }
                }
              }
            },
            {
              students: {
                some: {
                  userId: user!.id,
                  role: 'tutor'
                }
              }
            }
          ]
        }
      });

      if (!classExists) {
        return createAuthResponse('You do not have access to this class');
      }
    }

    // Create assignment
    const assignment = await db.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        maxPoints,
        classId: classId || (await db.class.findFirst())!.id, // Default to first class if not specified
        createdBy: user!.id
      },
      include: {
        class: true
      }
    });

    return Response.json({
      success: true,
      assignment
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
