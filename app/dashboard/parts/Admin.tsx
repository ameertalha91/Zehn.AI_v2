
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
type Klass = { id:string, name:string };
export default function Admin(){
  const [classes, setClasses] = useState<Klass[]>([]);
  const [name, setName] = useState('New CSS Cohort');
  useEffect(()=>{ fetch('/api/classes').then(r=>r.json()).then(d=>setClasses(d.items)); },[]);
  async function create(){
    const r = await fetch('/api/classes',{method:'POST', body: JSON.stringify({name})});
    const d = await r.json(); setClasses([d, ...classes]);
  }
  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Center Admin</h1>
      
      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/assignments" className="card p-4 hover:shadow-lg transition-shadow">
          <h3 className="font-semibold mb-2 text-blue-600">📝 Assignment Management</h3>
          <p className="text-sm text-gray-600">Create and manage assignments, review submissions</p>
        </Link>
        <div className="card p-4">
          <h3 className="font-semibold mb-2 text-green-600">👥 Class Management</h3>
          <p className="text-sm text-gray-600">Manage student enrollment and class settings</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-2 text-purple-600">📊 Analytics</h3>
          <p className="text-sm text-gray-600">View performance metrics and reports</p>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-2">Create a Class</h3>
        <div className="flex gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} className="border px-3 py-2 rounded-xl w-full" />
          <button onClick={create} className="btn-primary">Create</button>
        </div>
        <small className="note">Creates a class and default quiz stub.</small>
      </div>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Classes</h3>
        <ul className="list-disc pl-5">{classes.map(c=> <li key={c.id}>{c.name}</li>)}</ul>
      </div>
    </div>
  );
}
