
export default function Centers(){
  return (
    <div className="container py-12 space-y-6">
      <h1 className="text-3xl font-semibold">For Tuition Centers & Tutors</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4"><h3 className="font-semibold mb-1">AI Video Editing</h3><p className="text-sm text-gray-600">Auto trim, chapters, captions (simulated in MVP).</p></div>
        <div className="card p-4"><h3 className="font-semibold mb-1">Prelim Diagnostic → Study Plan</h3><p className="text-sm text-gray-600">Generate tailored roadmaps; tutors can override.</p></div>
        <div className="card p-4"><h3 className="font-semibold mb-1">AI Quizzes & Auto-grading</h3><p className="text-sm text-gray-600">Objective items graded automatically.</p></div>
        <div className="card p-4"><h3 className="font-semibold mb-1">Mock Exam OCR + Feedback</h3><p className="text-sm text-gray-600">Upload scripts → OCR + draft feedback for tutor review.</p></div>
        <div className="card p-4"><h3 className="font-semibold mb-1">Student Tracker</h3><p className="text-sm text-gray-600">Performance metrics & readiness.</p></div>
        <div className="card p-4"><h3 className="font-semibold mb-1">Class Messaging</h3><p className="text-sm text-gray-600">Announcements & 1:1 channels.</p></div>
      </div>
    </div>
  );
}
