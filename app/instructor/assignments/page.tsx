'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Edit, Trash2, Users, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  classId: string;
  createdBy: string;
  createdAt: string;
  class?: {
    id: string;
    name: string;
  };
  _count?: {
    submissions: number;
  };
  submissions?: Array<{
    id: string;
    studentId: string;
    status: string;
    grade?: number;
    student: {
      name: string;
      email: string;
    };
  }>;
}

export default function InstructorAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100,
    classId: ''
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/instructor/assignments');
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

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/instructor/assignments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: user?.id
        })
      });

      if (response.ok) {
        await fetchAssignments();
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          maxPoints: 100,
          classId: ''
        });
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      const response = await fetch(`/api/instructor/assignments/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchAssignments();
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const viewSubmissions = async (assignment: Assignment) => {
    try {
      const response = await fetch(`/api/instructor/assignments/${assignment.id}/submissions`);
      if (response.ok) {
        const data = await response.json();
        setSelectedAssignment({ ...assignment, submissions: data.submissions });
        setShowSubmissions(true);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleGrade = async (submissionId: string, grade: number, feedback: string) => {
    try {
      const response = await fetch('/api/instructor/assignments/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          grade,
          feedback,
          teacherId: user?.id
        })
      });

      if (response.ok && selectedAssignment) {
        await viewSubmissions(selectedAssignment);
      }
    } catch (error) {
      console.error('Error grading assignment:', error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['tutor']}>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
            <p className="text-gray-600 mt-2">Create and manage assignments for your students</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Assignment
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600">Create your first assignment to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                    <p className="text-gray-600 mb-4">{assignment.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{assignment.class?.name || 'All Classes'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{assignment.maxPoints} points</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{assignment._count?.submissions || 0} submissions</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <button
                      onClick={() => viewSubmissions(assignment)}
                      className="text-teal-600 hover:text-teal-700 p-2 hover:bg-teal-50 rounded-lg transition-colors"
                      title="View Submissions"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {/* TODO: Implement edit */}}
                      className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Assignment</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Assignment title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent h-32"
                    placeholder="Assignment description and instructions"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Points</label>
                    <input
                      type="number"
                      value={formData.maxPoints}
                      onChange={(e) => setFormData({ ...formData, maxPoints: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!formData.title || !formData.description || !formData.dueDate}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Assignment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submissions Modal */}
        {showSubmissions && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Submissions: {selectedAssignment.title}
              </h2>
              
              <div className="space-y-4">
                {selectedAssignment.submissions?.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No submissions yet</p>
                ) : (
                  selectedAssignment.submissions?.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{submission.student.name}</h4>
                          <p className="text-sm text-gray-600">{submission.student.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {submission.status === 'GRADED' ? (
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                              Graded: {submission.grade}/{selectedAssignment.maxPoints}
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                              Pending Review
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {submission.status !== 'GRADED' && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              placeholder="Grade"
                              min="0"
                              max={selectedAssignment.maxPoints}
                              className="w-24 px-3 py-1 border border-gray-300 rounded-lg"
                              id={`grade-${submission.id}`}
                            />
                            <span className="text-sm text-gray-600">/ {selectedAssignment.maxPoints}</span>
                          </div>
                          <textarea
                            placeholder="Feedback (optional)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={2}
                            id={`feedback-${submission.id}`}
                          />
                          <button
                            onClick={() => {
                              const gradeInput = document.getElementById(`grade-${submission.id}`) as HTMLInputElement;
                              const feedbackInput = document.getElementById(`feedback-${submission.id}`) as HTMLTextAreaElement;
                              const grade = parseInt(gradeInput.value);
                              if (!isNaN(grade)) {
                                handleGrade(submission.id, grade, feedbackInput.value);
                              }
                            }}
                            className="bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 transition-colors text-sm"
                          >
                            Submit Grade
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowSubmissions(false);
                    setSelectedAssignment(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
