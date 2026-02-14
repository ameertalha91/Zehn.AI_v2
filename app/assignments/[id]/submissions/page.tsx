"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookIcon, UserIcon, ClockIcon, FileTextIcon, EditIcon, ChartIcon } from '@/components/Icons';

type Assignment = {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
  dueDate: string;
};

type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  studentId: string;
  fileName: string;
  fileSize: number;
  extractedText?: string;
  status: 'SUBMITTED' | 'GRADED' | 'RETURNED' | 'LATE';
  submittedAt: string;
  feedback?: {
    grade?: number;
    comments?: string;
    teacherId: string;
    createdAt: string;
  };
};

export default function AssignmentSubmissions() {
  const params = useParams();
  const assignmentId = params.id as string;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradingMode, setGradingMode] = useState(false);
  
  // Grading form state
  const [grade, setGrade] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchAssignment();
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await fetch('/api/assignments');
      const data = await response.json();
      if (data.success) {
        const found = data.assignments.find((a: Assignment) => a.id === assignmentId);
        setAssignment(found || null);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/assignment-submissions?assignmentId=${assignmentId}`);
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

  const submitFeedback = async (submissionId: string) => {
    try {
      const formData = new FormData();
      formData.append('action', 'feedback');
      formData.append('submissionId', submissionId);
      formData.append('teacherId', 'teacher-1'); // Mock teacher ID
      formData.append('grade', grade);
      formData.append('comments', comments);

      const response = await fetch('/api/assignment-submissions', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Update the submission in the list
        setSubmissions(submissions.map(sub => 
          sub.id === submissionId ? data.submission : sub
        ));
        setGradingMode(false);
        setGrade('');
        setComments('');
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'text-blue-600 bg-blue-100';
      case 'GRADED': return 'text-green-600 bg-green-100';
      case 'LATE': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p>Loading submissions...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Assignment Not Found</h1>
        <Link href="/assignments" className="btn-primary">
          Back to Assignments
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-sm text-gray-600 mb-2">
            <Link href="/assignments" className="hover:text-teal-600">Assignments</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Submissions</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
          <p className="text-gray-600 mt-1">Review and grade student submissions</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Due Date</div>
          <div className="font-semibold">
            {new Date(assignment.dueDate).toLocaleDateString()} at{' '}
            {new Date(assignment.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      </div>

      {/* Assignment Info */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-700 mb-4">{assignment.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <ChartIcon className="w-4 h-4" />
                Max Points: {assignment.maxPoints}
              </span>
              <span className="flex items-center gap-1">
                <FileTextIcon className="w-4 h-4" />
                {submissions.length} Submissions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="card p-8 text-center">
          <FileTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-600">Students haven&apos;t submitted their assignments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Student: {submission.studentId}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <FileTextIcon className="w-4 h-4" />
                      {submission.fileName}
                    </span>
                    <span>{formatFileSize(submission.fileSize)}</span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Extracted Text Preview */}
                  {submission.extractedText && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Document Preview</h4>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {submission.extractedText.substring(0, 300)}...
                      </p>
                    </div>
                  )}

                  {/* Existing Feedback */}
                  {submission.feedback && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-green-900">Feedback</h4>
                        <span className="text-lg font-bold text-green-700">
                          {submission.feedback.grade}/{assignment.maxPoints}
                        </span>
                      </div>
                      {submission.feedback.comments && (
                        <p className="text-sm text-green-800">{submission.feedback.comments}</p>
                      )}
                      <p className="text-xs text-green-600 mt-2">
                        Graded on {new Date(submission.feedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setGradingMode(true);
                    setGrade(submission.feedback?.grade?.toString() || '');
                    setComments(submission.feedback?.comments || '');
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <EditIcon className="w-4 h-4" />
                  {submission.feedback ? 'Update Grade' : 'Grade Assignment'}
                </button>
                <button className="btn-ghost">
                  Download PDF
                </button>
              </div>

              {/* Grading Form */}
              {gradingMode && selectedSubmission?.id === submission.id && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">Grade Assignment</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade (out of {assignment.maxPoints})
                      </label>
                      <input
                        type="number"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="0"
                        max={assignment.maxPoints}
                        placeholder="Enter grade"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comments
                      </label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={3}
                        placeholder="Add feedback for the student..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => submitFeedback(submission.id)}
                      className="btn-primary"
                    >
                      Submit Grade
                    </button>
                    <button
                      onClick={() => {
                        setGradingMode(false);
                        setSelectedSubmission(null);
                        setGrade('');
                        setComments('');
                      }}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
