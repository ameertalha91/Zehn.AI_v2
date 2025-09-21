"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EditIcon, BookIcon, ClockIcon, UsersIcon, GraduationCapIcon, TargetIcon } from '@/components/Icons';

type Assignment = {
  id: string;
  title: string;
  description: string;
  classId: string;
  createdBy: string;
  dueDate: string;
  maxPoints: number;
  createdAt: string;
};

type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  studentId: string;
  fileName: string;
  status: 'SUBMITTED' | 'GRADED' | 'RETURNED' | 'LATE';
  submittedAt: string;
  feedback?: {
    grade?: number;
    comments?: string;
  };
};

export default function AssignmentsManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  // Form state
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    classId: 'css-cohort-a', // Default class for MVP
    dueDate: '',
    maxPoints: 100
  });

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments');
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/assignment-submissions');
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAssignment,
          createdBy: 'teacher-1' // Mock teacher ID for MVP
        })
      });

      const data = await response.json();
      if (data.success) {
        setAssignments([...assignments, data.assignment]);
        setNewAssignment({
          title: '',
          description: '',
          classId: 'css-cohort-a',
          dueDate: '',
          maxPoints: 100
        });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const getSubmissionsForAssignment = (assignmentId: string) => {
    return submissions.filter(s => s.assignmentId === assignmentId);
  };

  const getSubmissionStats = (assignmentId: string) => {
    const assignmentSubmissions = getSubmissionsForAssignment(assignmentId);
    const graded = assignmentSubmissions.filter(s => s.status === 'GRADED').length;
    const submitted = assignmentSubmissions.filter(s => s.status === 'SUBMITTED').length;
    const late = assignmentSubmissions.filter(s => s.status === 'LATE').length;
    
    return { total: assignmentSubmissions.length, graded, submitted, late };
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-600 mt-1">Create and manage student assignments</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <EditIcon className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      {/* Create Assignment Form */}
      {showCreateForm && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
          <form onSubmit={createAssignment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Title
              </label>
              <input
                type="text"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., Constitutional Essay Assignment"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                rows={3}
                placeholder="Describe the assignment requirements..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Points
                </label>
                <input
                  type="number"
                  value={newAssignment.maxPoints}
                  onChange={(e) => setNewAssignment({...newAssignment, maxPoints: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  min="1"
                  max="1000"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Create Assignment
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="card p-8 text-center">
            <BookIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600 mb-4">Create your first assignment to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Assignment
            </button>
          </div>
        ) : (
          assignments.map((assignment) => {
            const stats = getSubmissionStats(assignment.id);
            const isOverdue = new Date() > new Date(assignment.dueDate);
            
            return (
              <div key={assignment.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {assignment.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{assignment.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()} at{' '}
                        {new Date(assignment.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookIcon className="w-4 h-4" />
                        {assignment.maxPoints} points
                      </span>
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-red-600">
                          <TargetIcon className="w-4 h-4" />
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission Stats */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                      <div className="text-sm text-gray-600">Total Submissions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
                      <div className="text-sm text-gray-600">Pending Review</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
                      <div className="text-sm text-gray-600">Graded</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{stats.late}</div>
                      <div className="text-sm text-gray-600">Late Submissions</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link 
                    href={`/assignments/${assignment.id}/submissions`}
                    className="btn-primary flex items-center gap-2"
                  >
                    <UsersIcon className="w-4 h-4" />
                    Review Submissions ({stats.total})
                  </Link>
                  <button className="btn-ghost">
                    Edit Assignment
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
