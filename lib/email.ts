import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? 'Zehn.AI <noreply@zehn.ai>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zehn.ai';

export async function sendApprovalEmail(params: {
  studentEmail: string;
  studentName: string;
  instructorName: string;
}) {
  const loginUrl = `${APP_URL}/login`;

  await resend.emails.send({
    from: FROM,
    to: params.studentEmail,
    subject: 'Your Zehn.AI account has been approved',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">You're approved!</h2>
        <p style="color: #555; margin-bottom: 24px;">
          Hi ${params.studentName}, your Zehn.AI account has been approved by
          <strong>${params.instructorName}</strong>. You can now sign in and access your courses.
        </p>
        <a href="${loginUrl}"
           style="display: inline-block; padding: 12px 24px; background: #111; color: #fff;
                  text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
          Sign in to Zehn.AI
        </a>
        <p style="margin-top: 32px; font-size: 12px; color: #999;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendRejectionEmail(params: {
  studentEmail: string;
  studentName: string;
  reason?: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: params.studentEmail,
    subject: 'Update on your Zehn.AI application',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111;">
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Application update</h2>
        <p style="color: #555; margin-bottom: 16px;">
          Hi ${params.studentName}, unfortunately your Zehn.AI account application was not approved at this time.
        </p>
        ${params.reason ? `
        <div style="background: #f5f5f5; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; font-size: 14px; color: #333;">
          <strong>Reason:</strong> ${params.reason}
        </div>` : ''}
        <p style="font-size: 13px; color: #777;">
          If you believe this is an error, please contact your instructor directly.
        </p>
      </div>
    `,
  });
}
