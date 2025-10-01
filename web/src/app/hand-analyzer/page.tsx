'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import HandReplayer from '@/components/HandReplayer';

export default function HandAnalyzerPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="bg-[#0a0a0a] border-b border-[#4C5FD5]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 text-[#E0E0E0] hover:text-[#00FF8C] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-open-sans">Voltar ao Dashboard</span>
              </button>
            </Link>
            <h1 className="font-montserrat text-2xl font-bold text-white">
              Hand Replayer
            </h1>
          </div>
        </div>
      </header>

      {/* Hand Replayer Component */}
      <HandReplayer />
    </div>
  );
}
