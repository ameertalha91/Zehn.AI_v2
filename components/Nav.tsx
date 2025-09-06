
'use client';
import Link from 'next/link';
import ZehnLogo from './ZehnLogo';

export default function Nav(){
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold text-gray-900 hover:text-teal-600 transition-colors">
          <ZehnLogo size="md" />
          <span className="text-xl">Zehn.AI</span>
        </Link>
        <div className="flex gap-6">
          <Link href="/learning-pathways" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">Course Catalog</Link>
          <Link href="/cognitive-assistant" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">Cognitive Assistant</Link>
          <Link href="/dashboard" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">Dashboard</Link>
          <Link href="/educator-center" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">Educator Center</Link>
          <Link href="/centers" className="text-gray-500 hover:text-gray-700 transition-colors">For Institutions</Link>
        </div>
      </div>
    </nav>
  );
}
