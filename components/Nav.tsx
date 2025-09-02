
'use client';
import Link from 'next/link';
export default function Nav(){
  return (
    <nav className="border-b bg-white">
      <div className="container h-14 flex items-center justify-between">
        <Link href="/" className="font-bold">Zehn.AI</Link>
        <div className="flex gap-3">
          <Link href="/centers" className="hover:underline">For Centers</Link>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/login" className="btn-ghost">Demo Login</Link>
        </div>
      </div>
    </nav>
  );
}
