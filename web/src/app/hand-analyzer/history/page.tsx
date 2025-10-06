'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';
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
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white text-xl font-open-sans">Carregando histórico...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/assets/images/nova id visual/background1.jpg"
          alt="Background"
          fill
          className="object-cover opacity-10"
        />
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-montserrat text-4xl sm:text-5xl font-bold text-white mb-3">
                  Histórico de Sessões
                </h1>
                <p className="font-open-sans text-lg text-[#E0E0E0]">
                  Suas análises anteriores agrupadas por torneio e data
                </p>
              </div>
              <Link
                href="/hand-analyzer/new"
                className="font-open-sans bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)] hover:scale-105 transform"
              >
                + Nova Análise
              </Link>
            </div>

            {/* Icon */}
            <div className="relative w-16 h-16 mb-4">
              <Image
                src="/assets/images/nova id visual/icon-session-history.png"
                alt="Histórico de Sessões"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 rounded-lg border border-red-500 bg-red-500/10">
              <p className="font-open-sans text-red-200">{error}</p>
            </div>
          )}

          {/* Sessions List */}
          {sessions.length === 0 ? (
            <div className="p-12 rounded-2xl border border-[rgba(76,95,213,0.2)] text-center" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
              <div className="relative w-32 h-32 mx-auto mb-6 opacity-50">
                <Image
                  src="/assets/images/nova id visual/icon-session-history.png"
                  alt="Nenhuma sessão"
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="font-montserrat text-3xl font-bold text-white mb-3">
                Nenhuma sessão ainda
              </h2>
              <p className="font-open-sans text-[#E0E0E0] mb-8 max-w-md mx-auto">
                Analise suas primeiras mãos para começar seu histórico!
              </p>
              <Link
                href="/hand-analyzer/new"
                className="inline-block font-open-sans bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-10 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)] hover:scale-105 transform"
              >
                Analisar Primeira Mão
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="group p-6 rounded-xl border border-[rgba(76,95,213,0.2)] transition-all duration-300 hover:border-[rgba(0,255,140,0.5)] hover:shadow-[0_8px_30px_rgba(0,255,140,0.1)] hover:-translate-y-1"
                  style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="font-montserrat text-2xl font-bold text-white mb-3 group-hover:text-[#00FF8C] transition-colors duration-300">
                        {session.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 font-open-sans text-sm text-[#E0E0E0]">
                        <div className="flex items-center gap-2">
                          <span className="text-[#00FF8C]">◆</span>
                          <span>{session.siteFormat}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#00FF8C]">◆</span>
                          <span>{session.totalHands} mão{session.totalHands !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#00FF8C]">◆</span>
                          <span>
                            {new Date(session.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/hand-analyzer/session/${session.id}`}
                        className="font-open-sans bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)] hover:scale-105 transform"
                      >
                        Ver Mãos
                      </Link>
                      <button
                        onClick={() => handleDelete(session.id, session.name)}
                        className="font-open-sans bg-transparent border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-400 hover:text-red-300 px-4 py-3 rounded-lg transition-all duration-300"
                        title="Deletar sessão"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Back Link */}
          <div className="mt-12 text-center">
            <Link
              href="/dashboard"
              className="font-open-sans text-[#E0E0E0] hover:text-[#00FF8C] transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
