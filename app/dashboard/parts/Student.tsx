
'use client';
import { useEffect, useState } from 'react';
type Plan = { weeks:number, targets: Record<string,string[]> };
export default function Student(){
  const [plan, setPlan] = useState<Plan|null>(null);
  useEffect(()=>{ fetch('/api/study-plan').then(r=>r.json()).then(d=>setPlan(d.plan)); },[]);
  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Student Dashboard</h1>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Study Plan</h3>
        {!plan ? <p>Loading…</p> :
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(plan.targets).map(([w,t])=> (
              <div key={w} className="border rounded-xl p-3">
                <div className="font-semibold">Week {w}</div>
                <ul className="list-disc pl-5 text-sm text-gray-600">{t.map((x,i)=><li key={i}>{x}</li>)}</ul>
              </div>
            ))}
          </div>}
      </div>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Research Chat (stub)</h3>
        <p className="text-sm text-gray-600">Ask syllabus questions; returns exam-style examples with citations (to be plugged into RAG).</p>
      </div>
    </div>
  );
}
