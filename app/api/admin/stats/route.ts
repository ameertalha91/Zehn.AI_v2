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

    // Fetch real platform statistics
    const [
      totalUsers,
      totalCourses,
      totalAssignments,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.class.count(),
      // For assignments, we'd need to count from the JSON files or create a proper table
      // For now, we'll use a placeholder
      Promise.resolve(0),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      })
    ]);

    // Calculate active users (users who have logged in recently - using createdAt as proxy)
    const activeUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    const stats = {
      totalUsers,
      activeUsers,
      totalCourses,
      totalAssignments,
      totalSubmissions: 0, // Would need to count from submissions
      systemHealth: 'healthy' as const
    };

    return NextResponse.json({
      success: true,
      stats,
      recentUsers
    });

  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch platform statistics'
    }, { status: 500 });
  }
}
