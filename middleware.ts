import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessible without authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register', '/api/ai', '/api/process-document'];
const PUBLIC_PREFIXES = ['/cognitive-assistant', '/learning-pathways'];

// Routes that require APPROVED status for students
const STUDENT_ROUTES = ['/student', '/dashboard', '/api/student', '/api/assignments/submit', '/api/courses/enroll', '/api/study-plan', '/chat'];
const INSTRUCTOR_ROUTES = ['/instructor', '/educator-center', '/api/instructor', '/api/assignments/create', '/api/assignments/grade', '/api/courses/create', '/api/courses/manage', '/api/generate-quiz'];
const ZEHNAI_ROUTES = ['/zehnai', '/admin', '/api/zehnai', '/api/admin'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public routes
  if (
    PUBLIC_ROUTES.some(r => path === r) ||
    PUBLIC_PREFIXES.some(p => path === p || path.startsWith(p + '/'))
  ) {
    return NextResponse.next();
  }

  // Allow status pages without full auth check
  if (path === '/pending-approval' || path === '/account-rejected') {
    return NextResponse.next();
  }

  const userCookie = request.cookies.get('zehn_user');
  if (!userCookie) {
    if (path.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const user = JSON.parse(userCookie.value);
    const role: string = (user.role ?? '').toUpperCase();
    const status: string = user.status ?? 'PENDING_APPROVAL';

    // Students who are not yet approved get redirected to their status page
    if (role === 'STUDENT') {
      if (status === 'PENDING_APPROVAL') {
        if (path.startsWith('/api')) {
          return NextResponse.json({ error: 'Account pending approval' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
      if (status === 'REJECTED') {
        if (path.startsWith('/api')) {
          return NextResponse.json({ error: 'Account access denied' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/account-rejected', request.url));
      }
    }

    // Role-based route access
    const hasAccess = checkRouteAccess(path, role);
    if (!hasAccess) {
      if (path.startsWith('/api')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL(getHomePath(role), request.url));
    }

    // Inject user context headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id ?? '');
    response.headers.set('x-user-role', role);
    response.headers.set('x-user-status', status);
    response.headers.set('x-institute-id', user.centerId ?? '');
    return response;

  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

function checkRouteAccess(path: string, role: string): boolean {
  if (role === 'ZEHNAI_ADMIN' || role === 'ADMIN') return true;

  if (role === 'STUDENT') {
    if (INSTRUCTOR_ROUTES.some(r => path.startsWith(r))) return false;
    if (ZEHNAI_ROUTES.some(r => path.startsWith(r))) return false;
    return true;
  }

  if (role === 'INSTRUCTOR' || role === 'TUTOR') {
    if (ZEHNAI_ROUTES.some(r => path.startsWith(r))) return false;
    if (STUDENT_ROUTES.some(r => path.startsWith(r))) return false;
    return true;
  }

  return false;
}

function getHomePath(role: string): string {
  if (role === 'INSTRUCTOR' || role === 'TUTOR') return '/instructor';
  if (role === 'ZEHNAI_ADMIN' || role === 'ADMIN') return '/admin';
  return '/dashboard';
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
