
'use client';
import { useEffect, useState } from 'react';
type Quiz = { id:string, title:string };
export default function Tutor(){
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  useEffect(()=>{ fetch('/api/quizzes').then(r=>r.json()).then(d=>setQuizzes(d.items)); },[]);
  async function gen(){
    const r = await fetch('/api/quizzes',{method:'POST', body: JSON.stringify({title:'Auto quiz from lecture transcript'})});
    const d = await r.json(); setQuizzes([d, ...quizzes]);
  }
  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Tutor Workspace</h1>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Upload Lecture (stub)</h3>
        <p className="text-sm text-gray-600 mb-2">Attach video; MVP auto-generates transcript + chapter markers (simulated).</p>
        <input type="file" className="border rounded-xl px-3 py-2" />
      </div>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Quiz Generator</h3>
        <button onClick={gen} className="btn-primary">Generate Quiz</button>
        <ul className="mt-3 list-disc pl-5">{quizzes.map(q=><li key={q.id}>{q.title}</li>)}</ul>
      </div>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Mock Exam Feedback</h3>
        <p className="text-sm text-gray-600">Students upload scripts → see AI draft feedback you can refine.</p>
      </div>
    </div>
  );
}
