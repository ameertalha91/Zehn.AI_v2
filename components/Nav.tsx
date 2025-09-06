
'use client';
import Link from 'next/link';
export default function Nav(){
  return (
    <nav className="border-b bg-white">
      <div className="container h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-blue-600">Zehn.AI</Link>
        <div className="flex gap-4">
          <Link href="/learning-pathways" className="hover:text-blue-600 transition-colors">Learning Pathways</Link>
          <Link href="/cognitive-assistant" className="hover:text-blue-600 transition-colors">Cognitive Assistant</Link>
          <Link href="/scholar-dashboard" className="hover:text-blue-600 transition-colors">Scholar Dashboard</Link>
          <Link href="/educator-center" className="hover:text-blue-600 transition-colors">Educator Center</Link>
          <Link href="/centers" className="hover:underline text-gray-600">For Institutions</Link>
        </div>
      </div>
    </nav>
  );
}
