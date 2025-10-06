'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import {
  listHandHistorySessions,
  deleteSession,
  type HandHistorySession,
} from '@/lib/hand-history-api';

export default function HandHistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [sessions, setSessions] = useState<HandHistorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadSessions();
  }, [isAuthenticated, router]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await listHandHistorySessions();
      setSessions(data);
      setError('');
    } catch (err: any) {
      console.error('Error loading sessions:', err);
      setError('Erro ao carregar histórico. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string, sessionName: string) => {
    if (!confirm(`Tem certeza que deseja deletar "${sessionName}"?`)) {
      return;
    }

    try {
      await deleteSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (err) {
      alert('Erro ao deletar sessão');
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando histórico...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              📊 Histórico de Sessões
            </h1>
            <p className="text-gray-300">
              Suas análises anteriores agrupadas por torneio e data
            </p>
          </div>
          <Link
            href="/hand-analyzer/new"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            + Nova Análise
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Nenhuma sessão ainda
            </h2>
            <p className="text-gray-400 mb-6">
              Analise suas primeiras mãos para começar seu histórico!
            </p>
            <Link
              href="/hand-analyzer/new"
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Analisar Primeira Mão
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {session.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        🎲 {session.siteFormat}
                      </span>
                      <span className="flex items-center gap-1">
                        🃏 {session.totalHands} mão(s)
                      </span>
                      <span className="flex items-center gap-1">
                        📅{' '}
                        {new Date(session.createdAt).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/hand-analyzer/session/${session.id}`}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                    >
                      Ver Mãos
                    </Link>
                    <button
                      onClick={() => handleDelete(session.id, session.name)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-all"
                      title="Deletar sessão"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Voltar para Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
