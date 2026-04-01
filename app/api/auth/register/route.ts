import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

// Only STUDENT and INSTRUCTOR can self-register.
// ZEHNAI_ADMIN accounts are created by platform operators directly.
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'INSTRUCTOR']).default('STUDENT'),
  centerId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, password, role, centerId } = validation.data;

    // Reject duplicate emails
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Resolve center — instructors need one; students don't require it
    let resolvedCenterId = centerId ?? null;
    if (!resolvedCenterId) {
      let center = await db.center.findFirst();
      if (!center) {
        center = await db.center.create({ data: { name: 'Zehn.AI Academy' } });
      }
      resolvedCenterId = center.id;
    }

    // Students start as PENDING_APPROVAL; instructors are immediately APPROVED
    const status = role === 'STUDENT' ? 'PENDING_APPROVAL' : 'APPROVED';

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status,
        centerId: resolvedCenterId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        centerId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: 'Account created successfully', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
