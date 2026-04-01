import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, createAuthResponse } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!hasRole(user, ['instructor', 'tutor', 'educator'])) {
      return createAuthResponse('Unauthorized: Instructor access required');
    }

    // Get assignments created by this instructor
    const assignments = await db.assignment.findMany({
      where: { createdBy: user!.id },
      include: {
        class: true,
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return Response.json({ 
      success: true,
      assignments 
    });

  } catch (error) {
    console.error('Error fetching instructor assignments:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
