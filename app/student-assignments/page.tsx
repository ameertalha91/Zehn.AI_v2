"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookIcon, ClockIcon, FileTextIcon, TargetIcon, EditIcon } from '@/components/Icons';

type Assignment = {
  id: string;
  title: string;
  description: string;
  classId: string;
  createdBy: string;
  dueDate: string;
  maxPoints: number;
  createdAt: string;
  submissionStatus?: string | null;
  submittedAt?: string | null;
  feedback?: {
    grade?: number;
    comments?: string;
  } | null;
};

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  const studentId = 'student-1'; // Mock student ID for MVP

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/assignments?studentId=${studentId}`);
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, assignmentId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file only.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB.');
        return;
      }
      setSelectedFile(file);
      setSelectedAssignment(assignmentId);
    }
  };

  const submitAssignment = async (assignmentId: string) => {
    if (!selectedFile) return;

    setUploadingFile(assignmentId);

    try {
      const formData = new FormData();
      formData.append('action', 'submit');
      formData.append('file', selectedFile);
      formData.append('assignmentId', assignmentId);
      formData.append('studentId', studentId);

      const response = await fetch('/api/assignment-submissions', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Update the assignment status
        setAssignments(assignments.map(assignment => 
          assignment.id === assignmentId 
            ? { 
                ...assignment, 
                submissionStatus: data.submission.status,
                submittedAt: data.submission.submittedAt
              }
            : assignment
        ));
        setSelectedFile(null);
        setSelectedAssignment(null);
        alert('Assignment submitted successfully!');
      } else {
        alert('Failed to submit assignment: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setUploadingFile(null);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'SUBMITTED': return 'text-blue-600 bg-blue-100';
      case 'GRADED': return 'text-green-600 bg-green-100';
      case 'LATE': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date() > new Date(dueDate);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-600 mt-1">Submit your assignments and track your progress</p>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="card p-8 text-center">
          <BookIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments available</h3>
          <p className="text-gray-600">Your teacher hasn't assigned any work yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignments.map((assignment) => {
            const overdue = isOverdue(assignment.dueDate);
            const canSubmit = !assignment.submissionStatus || assignment.submissionStatus === 'LATE';
            
            return (
              <div key={assignment.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {assignment.title}
                      </h3>
                      {assignment.submissionStatus && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.submissionStatus)}`}>
                          {assignment.submissionStatus}
                        </span>
                      )}
                      {overdue && !assignment.submissionStatus && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{assignment.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()} at{' '}
                        {new Date(assignment.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span className="flex items-center gap-1">
                        <TargetIcon className="w-4 h-4" />
                        {assignment.maxPoints} points
                      </span>
                      {assignment.submittedAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <EditIcon className="w-4 h-4" />
                          Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Feedback Display */}
                    {assignment.feedback && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-green-900">Teacher Feedback</h4>
                          <span className="text-lg font-bold text-green-700">
                            {assignment.feedback.grade}/{assignment.maxPoints}
                          </span>
                        </div>
                        {assignment.feedback.comments && (
                          <p className="text-sm text-green-800">{assignment.feedback.comments}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Area */}
                <div className="border-t pt-4">
                  {canSubmit ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select PDF file to submit
                          </label>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileSelect(e, assignment.id)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum file size: 10MB. Only PDF files are accepted.
                          </p>
                        </div>
                      </div>

                      {selectedFile && selectedAssignment === assignment.id && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                Ready to submit: {selectedFile.name}
                              </p>
                              <p className="text-xs text-blue-700">
                                File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={() => submitAssignment(assignment.id)}
                              disabled={uploadingFile === assignment.id}
                              className="btn-primary flex items-center gap-2"
                            >
                              {uploadingFile === assignment.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <FileTextIcon className="w-4 h-4" />
                                  Submit Assignment
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {overdue && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">
                            ⚠️ This assignment is past due. Late submissions may be penalized.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <EditIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-700">Assignment submitted successfully</p>
                      {assignment.submissionStatus === 'GRADED' ? (
                        <p className="text-xs text-green-600 mt-1">Graded and feedback available above</p>
                      ) : (
                        <p className="text-xs text-blue-600 mt-1">Waiting for teacher review</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
