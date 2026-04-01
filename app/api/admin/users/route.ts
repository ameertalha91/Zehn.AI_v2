import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, hasRole } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Verify authentication and admin role
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user, ['admin'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all users from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        classes: {
          select: {
            id: true,
            klass: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      status: 'active', // All users in DB are considered active
      lastLogin: user.createdAt.toISOString(), // Use createdAt as proxy for last login
      createdAt: user.createdAt.toISOString(),
      coursesEnrolled: user.classes.length,
      assignmentsSubmitted: 0 // Would need to query assignments table for this
    }));

    return NextResponse.json({
      success: true,
      users: transformedUsers
    });

  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
}
