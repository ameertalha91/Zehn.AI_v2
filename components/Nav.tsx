
'use client';
import Link from 'next/link';
import ZehnLogo from './ZehnLogo';
import { useAuth } from '@/lib/auth-context';
import { BookOpen, Brain, FileText, LayoutDashboard, GraduationCap, Settings, Users } from 'lucide-react';

export default function Nav(){
  const { user, logout, isAuthenticated, getEffectiveRole } = useAuth();
  const userRole = getEffectiveRole()?.toLowerCase();

  // Define navigation items based on role
  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { href: '/', label: 'Home', icon: null },
        { href: '/login', label: 'Login', icon: null },
        { href: '/register', label: 'Register', icon: null }
      ];
    }

    switch (userRole) {
      case 'student':
        return [
          { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { href: '/student/courses', label: 'My Courses', icon: <BookOpen className="w-4 h-4" /> },
          { href: '/student/assignments', label: 'Assignments', icon: <FileText className="w-4 h-4" /> },
          { href: '/cognitive-assistant', label: 'Ilmi thotbot', icon: <Brain className="w-4 h-4" /> },
          { href: '/study-plan', label: 'Study Plan', icon: <GraduationCap className="w-4 h-4" /> }
        ];
      
      case 'instructor':
      case 'tutor':
      case 'educator':
        return [
          { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { href: '/instructor/courses', label: 'Course Management', icon: <BookOpen className="w-4 h-4" /> },
          { href: '/instructor/assignments', label: 'Assignments', icon: <FileText className="w-4 h-4" /> },
          { href: '/educator-center', label: 'Content Tools', icon: <Settings className="w-4 h-4" /> },
          { href: '/instructor/students', label: 'Students', icon: <Users className="w-4 h-4" /> }
        ];
      
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { href: '/admin/users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
          { href: '/admin/courses', label: 'Course Management', icon: <BookOpen className="w-4 h-4" /> },
          { href: '/admin/assignments', label: 'Assignment Management', icon: <FileText className="w-4 h-4" /> },
          { href: '/admin/analytics', label: 'Analytics', icon: <Settings className="w-4 h-4" /> }
        ];
      
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container h-16 flex items-center justify-between">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 font-bold text-gray-900 hover:text-teal-600 transition-colors">
          <ZehnLogo size="md" />
          <span className="text-xl">Zehn.AI</span>
        </Link>
        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition-colors font-medium"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          
          {/* User Authentication Section */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
              </div>
              <button 
                onClick={logout}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="text-sm bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
