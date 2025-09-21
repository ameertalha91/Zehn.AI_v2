'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Settings, 
  Users, 
  Eye, 
  EyeOff, 
  BarChart3, 
  Shield, 
  ChevronDown,
  X,
  Activity,
  Database,
  AlertTriangle
} from 'lucide-react';

export default function AdminToolbar() {
  const { user, switchView, getEffectiveRole } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showViewSelector, setShowViewSelector] = useState(false);

  // Only show for admin users
  if (!user || user.role !== 'admin') {
    return null;
  }

  const effectiveRole = getEffectiveRole();
  const isViewingAs = user.viewingAs && user.viewingAs !== 'admin';

  const getViewColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-500';
      case 'tutor': return 'bg-green-500';
      case 'admin': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getViewLabel = (role: string) => {
    switch (role) {
      case 'student': return 'Student';
      case 'tutor': return 'Instructor';
      case 'admin': return 'Admin';
      default: return 'Unknown';
    }
  };

  return (
    <>
      {/* View Mode Banner */}
      {isViewingAs && (
        <div className={`${getViewColor(effectiveRole)} text-white py-2 px-4 text-center text-sm font-medium`}>
          <div className="container flex items-center justify-between">
            <span>Viewing as: {getViewLabel(effectiveRole).toUpperCase()}</span>
            <button
              onClick={() => switchView('admin')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-xs font-bold transition-colors"
            >
              Return to Admin View
            </button>
          </div>
        </div>
      )}

      {/* Floating Admin Toolbar */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`bg-white shadow-lg border border-gray-200 rounded-lg transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-12'
        }`}>
          {/* Toolbar Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            {isExpanded && (
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span className="font-bold text-gray-900">Admin Tools</span>
              </div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {isExpanded ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            </button>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="p-3 space-y-3">
              {/* View Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  View Mode
                </label>
                <div className="flex gap-1">
                  {(['admin', 'tutor', 'student'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => switchView(role)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        effectiveRole === role
                          ? `${getViewColor(role)} text-white`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getViewLabel(role)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Quick Actions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center gap-2 p-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors">
                    <Users className="w-3 h-3" />
                    Users
                  </button>
                  <button className="flex items-center gap-2 p-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded transition-colors">
                    <BarChart3 className="w-3 h-3" />
                    Analytics
                  </button>
                  <button className="flex items-center gap-2 p-2 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded transition-colors">
                    <Database className="w-3 h-3" />
                    System
                  </button>
                  <button className="flex items-center gap-2 p-2 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 rounded transition-colors">
                    <Activity className="w-3 h-3" />
                    Logs
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  System Status
                </label>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Database</span>
                    <span className="text-green-600 font-medium">Online</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">API</span>
                    <span className="text-green-600 font-medium">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Users</span>
                    <span className="text-gray-600 font-medium">Active</span>
                  </div>
                </div>
              </div>

              {/* Emergency Actions */}
              <div className="pt-2 border-t border-gray-200">
                <button className="w-full flex items-center gap-2 p-2 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded transition-colors">
                  <AlertTriangle className="w-3 h-3" />
                  Emergency Override
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
