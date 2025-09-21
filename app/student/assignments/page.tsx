'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FileText, Upload, Clock, CheckCircle, AlertCircle, Calendar, Download } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  classId: string;
  createdBy: string;
  createdAt: string;
  submission?: {
    id: string;
    status: 'SUBMITTED' | 'GRADED' | 'RETURNED' | 'LATE';
    grade?: number;
    feedback?: string;
    submittedAt: string;
    filePath?: string;
    fileName?: string;
  };
}

export default function StudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/student/assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (assignmentId: string) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/student/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          content: submissionText,
          studentId: user?.id
        })
      });

      if (response.ok) {
        await fetchAssignments();
        setSelectedAssignment(null);
        setSubmissionText('');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (!assignment.submission) {
      const dueDate = new Date(assignment.dueDate);
      const isOverdue = dueDate < new Date();
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isOverdue ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
        }`}>
          {isOverdue ? 'Overdue' : 'Pending'}
        </span>
      );
    }

    const statusColors = {
      SUBMITTED: 'bg-blue-100 text-blue-600',
      GRADED: 'bg-green-100 text-green-600',
      RETURNED: 'bg-purple-100 text-purple-600',
      LATE: 'bg-orange-100 text-orange-600'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[assignment.submission.status]}`}>
        {assignment.submission.status}
      </span>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600 mt-2">View and submit your course assignments</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600">Your assignments will appear here when your instructors create them.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                      {getStatusBadge(assignment)}
                    </div>
                    <p className="text-gray-600 mb-4">{assignment.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{assignment.maxPoints} points</span>
                      </div>
                    </div>

                    {assignment.submission?.status === 'GRADED' && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-green-800">Grade:</span>
                          <span className="text-2xl font-bold text-green-600">
                            {assignment.submission.grade}/{assignment.maxPoints}
                          </span>
                        </div>
                        {assignment.submission.feedback && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-700">Feedback:</span>
                            <p className="text-gray-600 mt-1">{assignment.submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-6">
                    {!assignment.submission ? (
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Submit
                      </button>
                    ) : assignment.submission.status === 'SUBMITTED' ? (
                      <div className="text-center">
                        <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Submitted</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(assignment.submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <button
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        View Submission
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submission Modal */}
        {selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Submit Assignment: {selectedAssignment.title}
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Submission
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your assignment response here..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Note: File upload functionality will be available soon. For now, please paste your work as text.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedAssignment(null);
                    setSubmissionText('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmit(selectedAssignment.id)}
                  disabled={!submissionText.trim() || submitting}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
