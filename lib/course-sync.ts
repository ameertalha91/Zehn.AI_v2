// Course synchronization utilities for real-time updates across roles

export interface CourseUpdateEvent {
  type: 'course_created' | 'course_updated' | 'course_deleted' | 'enrollment_changed' | 'progress_updated' | 'admin_override' | 'bulk_operation';
  courseId: string;
  data?: any;
  timestamp: number;
  modifiedBy?: string;
  adminId?: string;
  operatorId?: string;
}

class CourseSyncManager {
  private listeners: Map<string, Set<(event: CourseUpdateEvent) => void>> = new Map();

  // Subscribe to course updates
  subscribe(courseId: string, callback: (event: CourseUpdateEvent) => void) {
    if (!this.listeners.has(courseId)) {
      this.listeners.set(courseId, new Set());
    }
    this.listeners.get(courseId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const courseListeners = this.listeners.get(courseId);
      if (courseListeners) {
        courseListeners.delete(callback);
        if (courseListeners.size === 0) {
          this.listeners.delete(courseId);
        }
      }
    };
  }

  // Emit course update event
  emit(event: CourseUpdateEvent) {
    const courseListeners = this.listeners.get(event.courseId);
    if (courseListeners) {
      courseListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in course sync callback:', error);
        }
      });
    }

    // Also emit to global listeners (for admin views)
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in global course sync callback:', error);
        }
      });
    }
  }

  // Subscribe to all course updates (for admin)
  subscribeToAll(callback: (event: CourseUpdateEvent) => void) {
    return this.subscribe('*', callback);
  }
}

// Global instance
export const courseSync = new CourseSyncManager();

// Helper functions for common operations
export const emitCourseCreated = (courseId: string, courseData: any) => {
  courseSync.emit({
    type: 'course_created',
    courseId,
    data: courseData,
    timestamp: Date.now()
  });
};

export const emitCourseUpdated = (courseId: string, courseData: any) => {
  courseSync.emit({
    type: 'course_updated',
    courseId,
    data: courseData,
    timestamp: Date.now()
  });
};

export const emitCourseDeleted = (courseId: string) => {
  courseSync.emit({
    type: 'course_deleted',
    courseId,
    timestamp: Date.now()
  });
};

export const emitEnrollmentChanged = (courseId: string, enrollmentData: any) => {
  courseSync.emit({
    type: 'enrollment_changed',
    courseId,
    data: enrollmentData,
    timestamp: Date.now()
  });
};

export const emitProgressUpdated = (courseId: string, studentId: string, progressData: any) => {
  courseSync.emit({
    type: 'progress_updated',
    courseId,
    data: { studentId, progressData },
    timestamp: Date.now()
  });
};

export const emitAdminOverride = (courseId: string, action: string, adminId: string, changes: any) => {
  courseSync.emit({
    type: 'admin_override',
    courseId,
    data: { action, changes },
    adminId,
    timestamp: Date.now()
  });
};

export const emitBulkOperation = (operation: string, courseIds: string[], operatorId: string, results: any) => {
  courseSync.emit({
    type: 'bulk_operation',
    courseId: courseIds[0] || 'bulk', // Use first course ID or 'bulk' for multiple
    data: { operation, courseIds, results },
    operatorId,
    timestamp: Date.now()
  });
};
