import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendRejectionEmail } from '@/lib/email';
import { z } from 'zod';

const schema = z.object({
  reason: z.string().max(300).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  const instructorId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');

  if (!instructorId || (role !== 'INSTRUCTOR' && role !== 'TUTOR' && role !== 'ZEHNAI_ADMIN' && role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { reason } = schema.parse(body);

  const student = await db.user.findUnique({ where: { id: params.studentId } });
  if (!student || student.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  await db.user.update({
    where: { id: student.id },
    data: { status: 'REJECTED' },
  });

  try {
    await sendRejectionEmail({
      studentEmail: student.email,
      studentName: student.name,
      reason,
    });
  } catch (err) {
    console.error('Rejection email failed:', err);
  }

  return NextResponse.json({ message: 'Student rejected', studentId: student.id });
}
