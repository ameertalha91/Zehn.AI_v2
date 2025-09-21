import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, hasRole } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

// GET - Fetch specific user details
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await verifyAuth(req);
    if (!user || !hasRole(user, ['admin'])) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: params.userId },
      include: {
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
      }
    });

    if (!userData) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt,
        enrolledClasses: userData.classes.map(enrollment => enrollment.klass)
      }
    });

  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user'
    }, { status: 500 });
  }
}

// PUT - Update user (role, status, etc.)
export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await verifyAuth(req);
    if (!user || !hasRole(user, ['admin'])) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { role, name, email } = body;

    // Prevent admin from modifying their own role
    if (user.id === params.userId && role && role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Cannot modify your own admin role'
      }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        ...(role && { role: role.toUpperCase() }),
        ...(name && { name }),
        ...(email && { email })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await verifyAuth(req);
    if (!user || !hasRole(user, ['admin'])) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent admin from deleting themselves
    if (user.id === params.userId) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete your own account'
      }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: params.userId }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
}
