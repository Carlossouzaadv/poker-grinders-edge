'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { HandParser } from '@/lib/hand-parser';
import { splitHandHistories } from '@/lib/poker/hand-splitter';
import { HandHistory } from '@/types/poker';
import PokerReplayer from '@/components/PokerReplayer';
import { addHandsToSession } from '@/lib/hand-history-api';

export default function HandAnalyzerInputPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [handHistoryText, setHandHistoryText] = useState('');
  const [allHands, setAllHands] = useState<HandHistory[]>([]);
  const [currentHandIndex, setCurrentHandIndex] = useState<number>(0);
  const [error, setError] = useState('');

  const parsedHandHistory = allHands[currentHandIndex] || null;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  /**
   * Salva as mãos no banco de dados agrupadas por torneio + data
   */
  const saveHandsToDatabase = async (parsedHands: HandHistory[]) => {
    if (parsedHands.length === 0) return;

    try {
      // Extrair nome do torneio e data da primeira mão
      // Assumindo que todas as mãos são do mesmo torneio/sessão
      const firstHand = parsedHands[0];

      // Extrair nome do torneio (pode estar em stakes ou tableName)
      let tournamentName = firstHand.stakes || firstHand.tableName || 'Unknown Tournament';

      // Se for cash game, usar formato diferente
      if (firstHand.gameContext?.isCashGame) {
        tournamentName = `Cash Game ${firstHand.stakes || 'Unknown Stakes'}`;
      }

      // Formatar data (usar timestamp da mão ou data atual)
      const handDate = firstHand.timestamp
        ? new Date(firstHand.timestamp).toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');

      console.log(`💾 Salvando ${parsedHands.length} mão(s) em: "${tournamentName} - ${handDate}"`);

      const result = await addHandsToSession(tournamentName, handDate, parsedHands);

      if (result.isNew) {
        console.log(`✅ Nova sessão criada: ${result.name} (${result.totalHands} mãos)`);
      } else {
        console.log(`✅ Mãos adicionadas à sessão existente: ${result.name} (total: ${result.totalHands} mãos)`);
      }
    } catch (error: unknown) {
      const err = error as any;
      console.error('❌ Erro ao salvar mãos:', err?.response?.data || err?.message);
      // Não mostrar erro para o usuário, apenas logar
      // O replayer continua funcionando normalmente mesmo se o salvamento falhar
    }
  };

  const handleAnalyze = () => {
    if (!handHistoryText.trim()) {
      alert('Por favor, cole o histórico da mão antes de analisar.');
      return;
    }

    try {
      console.log('🔍 Parsing hand history...');

      // Separar múltiplas mãos
      const splitResult = splitHandHistories(handHistoryText);
      console.log(`✅ Hands split: ${splitResult.totalHands} mãos encontradas`);

      if (splitResult.errors.length > 0) {
        console.warn('⚠️ Avisos ao separar mãos:', splitResult.errors);
      }

      if (splitResult.totalHands === 0) {
        throw new Error('Nenhuma hand history válida encontrada no texto fornecido');
      }

      // Parse cada mão individualmente
      const parsedHands: HandHistory[] = [];
      const parseErrors: string[] = [];

      for (let i = 0; i < splitResult.hands.length; i++) {
        const singleHandText = splitResult.hands[i];
        try {
          const result = HandParser.parse(singleHandText);

          if (result.success && result.handHistory) {
            parsedHands.push(result.handHistory);
            console.log(`✅ Mão ${i + 1} parseada com sucesso (ID: ${result.handHistory.handId})`);
          } else {
            parseErrors.push(`Mão ${i + 1}: ${result.error}`);
          }
        } catch (err: unknown) {
          const error = err as Error;
          parseErrors.push(`Mão ${i + 1}: ${error?.message}`);
        }
      }

      if (parsedHands.length === 0) {
        throw new Error(`Erro ao parsear mãos:\n${parseErrors.join('\n')}`);
      }

      console.log(`✅ ${parsedHands.length} de ${splitResult.totalHands} mãos parseadas com sucesso`);
      setAllHands(parsedHands);
      setCurrentHandIndex(0);
      setError('');

      // Salvar automaticamente no banco de dados
      saveHandsToDatabase(parsedHands);

      // Avisar sobre mãos que falharam
      if (parseErrors.length > 0) {
        console.warn(`⚠️ ${parseErrors.length} mão(s) falharam no parse:`, parseErrors);
      }

      // Scroll suave para a mesa
      setTimeout(() => {
        document.getElementById('poker-table-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

    } catch (err: unknown) {
      const error = err as Error;
      console.error('❌ Error parsing hand:', error);
      setError(error?.message || 'Erro ao processar o histórico da mão');
      setAllHands([]);
      setCurrentHandIndex(0);
    }
  };

  const handleNewHand = () => {
    setAllHands([]);
    setCurrentHandIndex(0);
    setHandHistoryText('');
    setError('');

    // Scroll suave de volta ao topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFirstHand = () => {
    setCurrentHandIndex(0);
  };

  const handleLastHand = () => {
    setCurrentHandIndex(allHands.length - 1);
  };

  const handlePreviousHand = () => {
    if (currentHandIndex > 0) {
      setCurrentHandIndex(currentHandIndex - 1);
    }
  };

  const handleNextHand = () => {
    if (currentHandIndex < allHands.length - 1) {
      setCurrentHandIndex(currentHandIndex + 1);
    }
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

  const handleUseExample = () => {
    setHandHistoryText(exampleHand);
  };

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
              value={handHistoryText}
              onChange={(e) => setHandHistoryText(e.target.value)}
              placeholder="Cole aqui o histórico do PokerStars, GGPoker ou PartyPoker..."
              className="w-full h-96 px-4 py-3 bg-[#0a0a0a] border border-[rgba(76,95,213,0.3)] rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#00FF8C] focus:border-transparent transition-all resize-none font-mono text-sm"
            />
            {error && (
              <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">⚠️</span>
                  <span className="font-open-sans font-semibold text-red-200">Erro ao processar</span>
                </div>
                <p className="font-open-sans text-sm text-red-200">{error}</p>
              </div>
            )}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAnalyze}
                disabled={!handHistoryText.trim()}
                className="flex-1 bg-[#00FF8C] hover:bg-[#00DD7A] text-[#121212] py-4 rounded-lg font-open-sans font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_8px_24px_rgba(0,255,140,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analisar Mãos
              </button>
              <button
                onClick={handleUseExample}
                className="px-6 py-4 bg-transparent border-2 border-[#00FF8C] text-[#00FF8C] hover:bg-[rgba(0,255,140,0.1)] rounded-lg font-open-sans font-semibold transition-all duration-300"
              >
                Exemplo
              </button>
            </div>
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
                  <li>• PartyPoker</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Poker Table Section - Shown after clicking Analyze */}
        {parsedHandHistory && (
          <div id="poker-table-section" className="mt-12">
            <PokerReplayer
              handHistory={parsedHandHistory}
              onNewHand={handleNewHand}
              allHandsCount={allHands.length}
              currentHandIndex={currentHandIndex}
              onPreviousHand={handlePreviousHand}
              onNextHand={handleNextHand}
              onFirstHand={handleFirstHand}
              onLastHand={handleLastHand}
            />
          </div>
        )}
      </div>
    </div>
  );
}
