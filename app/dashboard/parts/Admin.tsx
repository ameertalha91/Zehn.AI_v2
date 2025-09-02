
'use client';
import { useEffect, useState } from 'react';
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
