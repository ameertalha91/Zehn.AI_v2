import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendApprovalEmail } from '@/lib/email';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  const instructorId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');

  if (!instructorId || (role !== 'INSTRUCTOR' && role !== 'TUTOR' && role !== 'ZEHNAI_ADMIN' && role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const student = await db.user.findUnique({ where: { id: params.studentId } });
  if (!student || student.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }
  if (student.status === 'APPROVED') {
    return NextResponse.json({ error: 'Student is already approved' }, { status: 400 });
  }

  const instructor = await db.user.findUnique({ where: { id: instructorId } });

  await db.user.update({
    where: { id: student.id },
    data: { status: 'APPROVED' },
  });

  try {
    await sendApprovalEmail({
      studentEmail: student.email,
      studentName: student.name,
      instructorName: instructor?.name ?? 'your instructor',
    });
  } catch (err) {
    console.error('Approval email failed:', err);
    // Don't fail the request if email fails
  }

  return NextResponse.json({ message: 'Student approved', studentId: student.id });
}
