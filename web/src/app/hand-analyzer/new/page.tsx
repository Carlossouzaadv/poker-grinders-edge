'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';

export default function HandAnalyzerInputPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [handHistory, setHandHistory] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleAnalyze = () => {
    if (!handHistory.trim()) {
      alert('Por favor, cole o histórico da mão antes de analisar.');
      return;
    }

    // Armazena o histórico no sessionStorage para passar para a próxima página
    sessionStorage.setItem('handHistoryToAnalyze', handHistory);

    // Redireciona para a página do replayer
    router.push('/hand-analyzer');
  };

  const exampleHand = `PokerStars Hand #2310810117: Tournament #10210210, $10+$1 USD Hold'em No Limit - Level V (100/200) - 2025/09/24 17:30:00 ET
Table '102102102 10' 6-max Seat #1 is the button
Seat 1: Player 1 (3500 in chips)
Seat 2: Player 2 (6200 in chips)
Seat 3: Hero (5000 in chips)
Seat 4: Player 4 (4800 in chips)
Seat 5: Player 5 (8000 in chips)
Seat 6: Player 6 (2500 in chips)
Player 2: posts small blind 100
Hero: posts big blind 200
*** HOLE CARDS ***
Dealt to Hero [Ac Jd]
Player 4: folds
Player 5: raises 400 to 600
Player 6: folds
Player 1: folds
Player 2: folds
Hero: calls 400
*** FLOP *** [Ah 7s 2d]
Hero: checks
Player 5: bets 800
Hero: calls 800
*** TURN *** [Ah 7s 2d] [3c]
Hero: checks
Player 5: bets 1600
Hero: calls 1600
*** RIVER *** [Ah 7s 2d 3c] [8s]
Hero: checks
Player 5: checks
*** SHOW DOWN ***
Hero: shows [Ac Jd] (a pair of Aces)
Player 5: mucks hand
Hero collected 6100 from pot
*** SUMMARY ***
Total pot 6100 | Rake 0
Board [Ah 7s 2d 3c 8s]
Seat 1: Player 1 (button) folded before Flop (didn't bet)
Seat 2: Player 2 (small blind) folded before Flop
Seat 3: Hero (big blind) showed [Ac Jd] and won (6100) with a pair of Aces
Seat 4: Player 4 folded before Flop (didn't bet)
Seat 5: Player 5 mucked [Ks Qs]
Seat 6: Player 6 folded before Flop (didn't bet)`;

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="font-montserrat text-4xl font-bold text-white mb-4">
            Analise Suas Mãos
          </h2>
          <p className="font-open-sans text-lg text-[#E0E0E0] max-w-2xl mx-auto">
            Cole o histórico do seu torneio e reveja cada decisão de forma visual e interativa.
          </p>
        </div>

        {/* Main Analyzer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="rounded-2xl p-8 border border-[rgba(76,95,213,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
            <h3 className="font-montserrat text-2xl font-semibold text-white mb-6">
              Histórico de Mãos
            </h3>
            <textarea
              value={handHistory}
              onChange={(e) => setHandHistory(e.target.value)}
              placeholder="Cole aqui o histórico do PokerStars, GGPoker, Winamax, etc..."
              className="w-full h-96 px-4 py-3 bg-[#0a0a0a] border border-[rgba(76,95,213,0.3)] rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all resize-none font-mono text-sm"
            />
            <button
              onClick={handleAnalyze}
              disabled={!handHistory.trim()}
              className="w-full mt-6 bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] py-4 rounded-lg font-open-sans font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analisar Mãos
            </button>
          </div>

          {/* Preview/Info Section */}
          <div className="rounded-2xl p-8 border border-[rgba(76,95,213,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
            <h3 className="font-montserrat text-2xl font-semibold text-white mb-6">
              Como Funciona
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#00FF8C]/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-montserrat text-[#00FF8C] font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-open-sans font-semibold text-white mb-1">
                    Copie o Histórico
                  </h4>
                  <p className="font-open-sans text-sm text-[#E0E0E0]">
                    Abra sua sala de poker e copie o histórico completo do torneio ou mão.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#00FF8C]/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-montserrat text-[#00FF8C] font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-open-sans font-semibold text-white mb-1">
                    Cole no Campo
                  </h4>
                  <p className="font-open-sans text-sm text-[#E0E0E0]">
                    Cole o texto no campo ao lado. O sistema detecta automaticamente o formato.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#00FF8C]/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-montserrat text-[#00FF8C] font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-open-sans font-semibold text-white mb-1">
                    Analise Visualmente
                  </h4>
                  <p className="font-open-sans text-sm text-[#E0E0E0]">
                    Reveja cada street, cada decisão, com visualização clara e interativa.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-[#00FF8C]/10 border border-[#00FF8C]/30 rounded-lg">
                <h4 className="font-montserrat font-bold text-[#00FF8C] mb-2">
                  Formatos Suportados
                </h4>
                <ul className="font-open-sans text-sm text-[#E0E0E0] space-y-1">
                  <li>• PokerStars</li>
                  <li>• GGPoker</li>
                  <li>• Winamax</li>
                  <li>• 888poker</li>
                  <li>• PartyPoker</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Example Section */}
        <div className="mt-12 rounded-2xl p-8 border border-[rgba(76,95,213,0.2)]" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)' }}>
          <h3 className="font-montserrat text-2xl font-semibold text-white mb-4">
            Exemplo de Histórico
          </h3>
          <p className="font-open-sans text-[#E0E0E0] mb-6">
            Não tem um histórico à mão? Use este exemplo para testar:
          </p>
          <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[rgba(76,95,213,0.3)]">
            <pre className="font-mono text-xs text-[#9E9E9E] overflow-x-auto whitespace-pre-wrap">
{exampleHand}
            </pre>
          </div>
          <button
            onClick={() => setHandHistory(exampleHand)}
            className="mt-4 px-6 py-2 bg-transparent border border-[#00FF8C] text-[#00FF8C] hover:bg-[rgba(0,255,140,0.1)] rounded-lg font-open-sans text-sm font-semibold transition-all duration-300"
          >
            Usar Este Exemplo
          </button>
        </div>
      </div>
    </div>
  );
}
