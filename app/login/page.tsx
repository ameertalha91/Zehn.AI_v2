
'use client';
import { useRouter } from 'next/navigation';
export default function Login(){
  const r = useRouter();
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-semibold mb-2">Demo Login</h1>
      <p className="text-gray-600 mb-4">Pick a role to explore the MVP dashboards.</p>
      <div className="flex gap-3">
        <button className="btn-primary" onClick={()=>r.push('/dashboard?as=ADMIN')}>Center Admin</button>
        <button className="btn-ghost" onClick={()=>r.push('/dashboard?as=TUTOR')}>Tutor</button>
        <button className="btn-ghost" onClick={()=>r.push('/dashboard?as=STUDENT')}>Student</button>
      </div>
      <p className="mt-3 text-sm text-gray-500">In production, replace with real auth.</p>
    </div>
  );
}
