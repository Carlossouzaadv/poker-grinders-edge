'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { getHandByIndex } from '@/lib/hand-history-api';
import PokerReplayer from '@/components/PokerReplayer';
import type { HandHistory } from '@/types/poker';

export default function SessionViewPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const sessionId = params?.id as string;

  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [currentHand, setCurrentHand] = useState<HandHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalHands, setTotalHands] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!sessionId) {
      setError('ID da sessão não fornecido');
      return;
    }

    loadHand(currentHandIndex);
  }, [isAuthenticated, sessionId, currentHandIndex, router]);

  const loadHand = async (handIndex: number) => {
    try {
      setLoading(true);
      const data = await getHandByIndex(sessionId, handIndex);
      setCurrentHand(data.parsedData);
      setError('');

      // TODO: Get total hands from session metadata
      // For now, we'll try to load hands until we get an error
    } catch (err: any) {
      console.error('Error loading hand:', err);
      if (err.response?.status === 404) {
        setError('Mão não encontrada');
      } else {
        setError('Erro ao carregar mão');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousHand = () => {
    if (currentHandIndex > 0) {
      setCurrentHandIndex(currentHandIndex - 1);
    }
  };

  const handleNextHand = () => {
    setCurrentHandIndex(currentHandIndex + 1);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading && !currentHand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando mão...</div>
      </div>
    );
  }

  if (error && !currentHand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <Link
            href="/hand-analyzer/history"
            className="text-purple-400 hover:text-purple-300"
          >
            ← Voltar para Histórico
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/hand-analyzer/history"
              className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-block"
            >
              ← Voltar para Histórico
            </Link>
            <h1 className="text-3xl font-bold text-white">
              Mão {currentHandIndex + 1}
            </h1>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={handlePreviousHand}
              disabled={currentHandIndex === 0}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all"
            >
              ← Anterior
            </button>
            <button
              onClick={handleNextHand}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all"
            >
              Próxima →
            </button>
          </div>
        </div>

        {/* Replayer */}
        {currentHand && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <PokerReplayer handHistory={currentHand} />
          </div>
        )}

        {error && currentHand && (
          <div className="mt-4 bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
