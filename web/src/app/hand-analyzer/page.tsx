'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import HandReplayer from '@/components/HandReplayer';

export default function HandAnalyzerPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [initialHandHistory, setInitialHandHistory] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Verifica se há histórico no sessionStorage
    const storedHistory = sessionStorage.getItem('handHistoryToAnalyze');
    if (storedHistory) {
      setInitialHandHistory(storedHistory);
      // Limpa o sessionStorage após usar
      sessionStorage.removeItem('handHistoryToAnalyze');
    } else {
      // Se não há histórico, redireciona para a página de input
      router.push('/hand-analyzer/new');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !initialHandHistory) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="bg-[#0a0a0a] border-b border-[#4C5FD5]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/hand-analyzer/new">
              <button className="flex items-center gap-2 text-[#E0E0E0] hover:text-[#00FF8C] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-open-sans">Nova Análise</span>
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="flex items-center gap-2 text-[#E0E0E0] hover:text-[#00FF8C] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-open-sans">Dashboard</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hand Replayer Component with initial history */}
      <HandReplayer initialHandHistory={initialHandHistory} />
    </div>
  );
}
