import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define role-based route access
const roleRoutes = {
  student: [
    '/student',
    '/dashboard',
    '/api/student',
    '/api/assignments/submit',
    '/api/courses/enroll',
    '/api/study-plan',
    '/cognitive-assistant',
    '/chat'
  ],
  instructor: [
    '/instructor',
    '/educator-center',
    '/api/instructor',
    '/api/assignments/create',
    '/api/assignments/grade',
    '/api/courses/create',
    '/api/courses/manage',
    '/api/generate-quiz'
  ],
  admin: [
    '/admin',
    '/centers',
    '/api/admin',
    '/api/centers'
  ]
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Allow public routes
  const publicRoutes = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register'];
  if (publicRoutes.some(route => path === route)) {
    return NextResponse.next();
  }

  // Get user from cookie/header (in production, verify JWT token)
  const userCookie = request.cookies.get('zehn_user');
  if (!userCookie) {
    // Redirect to login if not authenticated
    if (!path.startsWith('/api')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  try {
    const user = JSON.parse(userCookie.value);
    // For admin users, check if they're viewing as another role
    const userRole = user.role === 'admin' && user.viewingAs 
      ? user.viewingAs.toLowerCase() 
      : user.role?.toLowerCase();

    // Check if user has access to the requested route
    const hasAccess = checkRouteAccess(path, userRole);
    
    if (!hasAccess) {
      // Redirect to appropriate dashboard if trying to access unauthorized page
      if (!path.startsWith('/api')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: Insufficient permissions' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }

    // Add user role to headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-role', userRole);
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-is-admin', user.role === 'admin' ? 'true' : 'false');
    response.headers.set('x-viewing-as', user.viewingAs || '');
    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

function checkRouteAccess(path: string, role: string): boolean {
  // Admin has access to everything
  if (role === 'admin') return true;

  // Check role-specific routes
  if (role === 'student') {
    // Block instructor and admin routes
    const blockedPrefixes = ['/instructor', '/educator', '/admin', '/centers'];
    const blockedAPIs = ['/api/instructor', '/api/admin', '/api/assignments/create', '/api/assignments/grade', '/api/courses/create'];
    
    if (blockedPrefixes.some(prefix => path.startsWith(prefix))) return false;
    if (blockedAPIs.some(api => path.startsWith(api))) return false;
    return true;
  }

  if (role === 'instructor' || role === 'tutor' || role === 'educator') {
    // Block admin-only routes
    const blockedPrefixes = ['/admin', '/centers'];
    const blockedAPIs = ['/api/admin', '/api/centers'];
    
    if (blockedPrefixes.some(prefix => path.startsWith(prefix))) return false;
    if (blockedAPIs.some(api => path.startsWith(api))) return false;
    return true;
  }

  // Default deny for unknown roles
  return false;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
