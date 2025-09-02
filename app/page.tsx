
import Link from 'next/link';
export default function Home(){
  return (
    <div>
      <header className="bg-gradient-to-br from-white to-subtle">
        <div className="container py-16">
          <h1 className="text-4xl font-bold mb-2">Agentic AI Platform for CSS Exam Prep</h1>
          <p className="text-gray-600 max-w-2xl">Affordable subscription · Exam-ready answers · Always current</p>
          <div className="mt-6 flex gap-3">
            <Link className="btn-primary" href="/login">Try demo</Link>
            <Link className="btn-ghost" href="/centers">For Centers</Link>
          </div>
        </div>
      </header>
      <div className="container py-12 grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold">Syllabus-grounded answers</h3>
          <p className="text-sm text-gray-600">Aligned with FPSC recommended books & sources; intro-body-conclusion format.</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Study plan & tracker</h3>
          <p className="text-sm text-gray-600">Diagnostic → proposed plan; weekly targets, reminders, and analytics.</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Center toolkit</h3>
          <p className="text-sm text-gray-600">Video uploads + AI edits, quizzes, OCR mock feedback, class messaging.</p>
        </div>
      </div>
    </div>
  );
}
