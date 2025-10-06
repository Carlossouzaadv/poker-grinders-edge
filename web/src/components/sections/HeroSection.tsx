import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HandHistory, Snapshot } from '@/types/poker';
import { ReplayState } from '@/types/replay';
import { HandParser } from '@/lib/hand-parser';
import { ReplayBuilder } from '@/lib/replay-builder';
import { SnapshotBuilder } from '@/lib/snapshot-builder';
import { splitHandHistories } from '@/lib/poker/hand-splitter';
import PokerTable from '../poker/PokerTable';
import TableFooter from '../hand-analyzer/TableFooter';
import LanguageSwitcher from '../LanguageSwitcher';
import '@/styles/replayer.css';


interface HeroSectionProps {
  onShowLeadCapture: () => void;
  initialHandHistory?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onShowLeadCapture, initialHandHistory }) => {
  const { t } = useTranslation();
  const [handText, setHandText] = useState(initialHandHistory || '');

  // Múltiplas mãos
  const [allHands, setAllHands] = useState<HandHistory[]>([]);
  const [currentHandIndex, setCurrentHandIndex] = useState<number>(0);
  const handHistory = allHands[currentHandIndex] || null;

  const [error, setError] = useState<string>('');
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  // Auto-parse if initialHandHistory is provided
  useEffect(() => {
    if (initialHandHistory && allHands.length === 0) {
      try {
        console.log('🔍 Parsing initial hand history...');

        // Tentar separar múltiplas mãos
        const splitResult = splitHandHistories(initialHandHistory);
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
          const handText = splitResult.hands[i];
          try {
            const result = HandParser.parse(handText);

            if (result.success && result.handHistory) {
              parsedHands.push(result.handHistory);
            } else {
              parseErrors.push(`Mão ${i + 1}: ${result.error}`);
            }
          } catch (err: any) {
            parseErrors.push(`Mão ${i + 1}: ${err?.message}`);
          }
        }

        if (parsedHands.length === 0) {
          throw new Error(`Erro ao parsear mãos:\n${parseErrors.join('\n')}`);
        }

        console.log(`✅ ${parsedHands.length} mãos parseadas com sucesso`);
        setAllHands(parsedHands);
        setCurrentHandIndex(0);
        setError('');

        // Avisar sobre mãos que falharam
        if (parseErrors.length > 0) {
          console.warn(`⚠️ ${parseErrors.length} mão(s) falharam no parse:`, parseErrors);
        }
      } catch (err: any) {
        console.error('❌ Error auto-parsing initial hand:', err);
        setError(err?.message || 'Erro ao processar o histórico da mão');
      }
    }
  }, [initialHandHistory, allHands.length]);

  // Generate snapshots when handHistory changes
  useEffect(() => {
    const buildSnapshots = async () => {
      if (!handHistory) {
        setSnapshots([]);
        return;
      }
      try {
        console.log('🔧 Building snapshots from handHistory:', handHistory);
        const result = await SnapshotBuilder.buildSnapshots(handHistory);
        console.log('✅ Snapshots built:', result);
        setSnapshots(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error('❌ Error building snapshots:', error);
        setError('Erro ao construir snapshots da mão');
        setSnapshots([]);
      }
    };

    buildSnapshots();
  }, [handHistory]);

  const currentSnapshot = snapshots[currentSnapshotIndex] || null;

  // Exemplo de hand history completa para demonstração (Hero ganha com Top Pair)
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

  const handleParse = () => {
    if (!handText.trim()) {
      setError(t('errors.enterHandHistory'));
      return;
    }

    try {
      console.log('🔍 DEPURAÇÃO PASSO 1: Iniciando parse das mãos');
      console.log('📝 Texto:', handText.substring(0, 100) + '...');

      // Separar múltiplas mãos
      const splitResult = splitHandHistories(handText);
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
        } catch (err: any) {
          parseErrors.push(`Mão ${i + 1}: ${err?.message}`);
        }
      }

      if (parsedHands.length === 0) {
        throw new Error(`Erro ao parsear mãos:\n${parseErrors.join('\n')}`);
      }

      console.log(`✅ ${parsedHands.length} de ${splitResult.totalHands} mãos parseadas com sucesso`);
      setAllHands(parsedHands);
      setCurrentHandIndex(0);
      setCurrentSnapshotIndex(0);
      setError('');

      // Avisar sobre mãos que falharam
      if (parseErrors.length > 0) {
        console.warn(`⚠️ ${parseErrors.length} mão(s) falharam no parse:`, parseErrors);
        const warningMsg = `${parsedHands.length} mãos carregadas com sucesso. ${parseErrors.length} mão(s) ignoradas por erros.`;
        setError(warningMsg);
      }
    } catch (error) {
      console.error('❌ ERRO CRÍTICO no parse:', error);
      setError(String(error));
      setAllHands([]);
      setCurrentHandIndex(0);
      setCurrentSnapshotIndex(0);
    }
  };

  // Auto-play interval ref
  const playIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const canGoNext = () => Array.isArray(snapshots) && currentSnapshotIndex < snapshots.length - 1;
  const canGoPrevious = () => currentSnapshotIndex > 0;

  const handleNext = () => {
    if (!canGoNext()) {
      console.log('⚠️ PASSO 2: Não é possível avançar. Snapshot atual:', currentSnapshotIndex, 'Total:', Array.isArray(snapshots) ? snapshots.length : 0);
      return;
    }

    const nextIndex = currentSnapshotIndex + 1;
    console.log('➡️ PASSO 2: Avançando do snapshot', currentSnapshotIndex, 'para o snapshot', nextIndex);
    setCurrentSnapshotIndex(nextIndex);
  };

  const handlePrevious = () => {
    if (!canGoPrevious()) return;

    setCurrentSnapshotIndex(currentSnapshotIndex - 1);
  };

  const handlePlay = () => {
    if (isPlaying) {
      // Stop playing
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start playing
      setIsPlaying(true);

      playIntervalRef.current = setInterval(() => {
        setCurrentSnapshotIndex(currentIndex => {
          if (!Array.isArray(snapshots) || currentIndex >= snapshots.length - 1) {
            if (playIntervalRef.current) {
              clearInterval(playIntervalRef.current);
              playIntervalRef.current = null;
            }
            setIsPlaying(false);
            return currentIndex;
          }

          return currentIndex + 1;
        });
      }, 1500); // 1.5 seconds per step
    }
  };

  // Street navigation with instant jumps
  const jumpToStreet = (street: 'preflop'|'flop'|'turn'|'river'|'showdown') => {
    if (!Array.isArray(snapshots) || snapshots.length === 0) return;

    let targetIndex = -1;

    if (street === 'preflop') {
      targetIndex = 0; // First snapshot
    } else {
      // Find first snapshot of the target street
      targetIndex = snapshots.findIndex(snapshot => snapshot.street === street);
    }

    if (targetIndex !== -1) {
      console.log(`🎯 Saltando para ${street} no snapshot ${targetIndex}`);
      setCurrentSnapshotIndex(targetIndex);
    } else {
      console.warn(`⚠️ Street '${street}' não encontrada nos snapshots`);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  const currentDescription = currentSnapshot ? currentSnapshot.description : t('replayer.waitingHandStart', { default: 'Aguardando início da mão' });

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-yellow-400 to-green-500 bg-clip-text text-transparent">
            {t('hero.title')}
            <br />
            <span className="text-white">{t('hero.titleFree')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
            <br />
            <span className="text-green-400 font-semibold">{t('hero.subtitleHighlight')}</span>
          </p>

          <div className="inline-flex items-center space-x-2 bg-green-900/30 border border-green-500/30 rounded-full px-6 py-3 mb-8">
            <span className="text-2xl">✨</span>
            <span className="text-green-400 font-semibold">{t('hero.badge')}</span>
            <span className="text-gray-300">{t('hero.badgeDetails')}</span>
          </div>
        </div>

        {!handHistory || !Array.isArray(snapshots) || snapshots.length === 0 ? (
          /* Input Section */
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 mb-8">
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-200 mb-3">
                  {t('hero.inputLabel')}
                </label>
                <div className="mb-4 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-300">
                    <span className="text-xl">📝</span>
                    <span className="font-medium">{t('hero.instructionTitle')}</span>
                  </div>
                  <p className="text-blue-200 mt-1" dangerouslySetInnerHTML={{
                    __html: t('hero.instructionText')
                  }} />
                </div>
                <textarea
                  value={handText}
                  onChange={(e) => setHandText(e.target.value)}
                  placeholder={t('hero.placeholder')}
                  className="w-full h-48 px-4 py-3 bg-gray-900/70 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm resize-none"
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 text-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">⚠️</span>
                    <span className="font-semibold">{t('hero.errorTitle')}</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleParse}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
                >
                  {t('hero.analyzeButton')}
                </button>

                <button
                  onClick={() => setHandText(exampleHand)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
                >
                  {t('hero.exampleButton')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Replayer Interface - REDESIGNED: Mesa dominante, controles compactos */
          <div className="w-full">
            {/* Ação Atual - Banner superior */}
            {currentDescription && (
              <div className="max-w-5xl mx-auto mb-6 bg-gradient-to-r from-blue-900/60 to-purple-900/60 border border-blue-400/30 rounded-2xl p-4 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">🎬</span>
                  <p className="text-xl font-bold text-blue-100">
                    {currentDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Layout RESPONSIVO: Mesa centralizada + Controles compactos */}
            <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">

              {/* Mesa de poker - ELEMENTO DOMINANTE (prioridade visual) */}
              <div className="w-full lg:flex-[3] order-2 lg:order-1">
                {currentSnapshot && (
                  <>
                    <PokerTable
                      handHistory={handHistory!}
                      snapshot={currentSnapshot}
                      showAllCards={false}
                    />

                    {/* Table Footer - Equity Calculator & Notes */}
                    <TableFooter handHistory={handHistory} />
                  </>
                )}
              </div>

              {/* Painel COMPACTO - controles essenciais (fixo no desktop, topo no mobile) */}
              <div className="w-full lg:flex-1 lg:max-w-xs flex flex-col space-y-3 lg:sticky lg:top-4 order-1 lg:order-2">

                {/* Controles de Reprodução - COMPACTO */}
                <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
                  <h3 className="text-white font-bold mb-2 text-center text-sm">{t('replayer.controls')}</h3>

                  {/* Botões de controle - tamanhos otimizados */}
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <button
                      onClick={handlePrevious}
                      disabled={!canGoPrevious()}
                      className="w-10 h-10 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                      title={t('replayer.previousSnapshot')}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    <button
                      onClick={handlePlay}
                      className={`w-12 h-12 rounded-full text-white font-bold transition-all shadow-lg flex items-center justify-center ${
                        isPlaying
                          ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                          : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'
                      }`}
                      title={isPlaying ? t('replayer.pause') : t('replayer.play')}
                    >
                      {isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={!canGoNext()}
                      className="w-10 h-10 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                      title={t('replayer.nextSnapshot')}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Informações do progresso */}
                  <div className="text-center">
                    <div className="text-white font-semibold text-xs mb-0.5">
                      {t('replayer.snapshotProgress', {
                        current: currentSnapshotIndex + 1,
                        total: Array.isArray(snapshots) ? snapshots.length : 0
                      })}
                    </div>
                    <div className="text-gray-400 text-[10px]">
                      {t('replayer.street', { street: t(`streets.${currentSnapshot?.street || 'preflop'}`) })}
                    </div>
                  </div>
                </div>

                {/* Street Navigation - COMPACTO */}
                <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
                  <h3 className="text-white font-bold mb-2 text-center text-sm">{t('replayer.streetNavigation')}</h3>
                  <div className="flex flex-col space-y-1.5">
                    {(['preflop', 'flop', 'turn', 'river', 'showdown'] as const).map((street) => {
                      const isAvailable = street === 'preflop' ||
                                       street === 'showdown' && handHistory?.showdown ||
                                       (Array.isArray(snapshots) && snapshots.some(snapshot => snapshot.street === street));
                      const isCurrentStreet = currentSnapshot?.street === street;

                      return (
                        <button
                          key={street}
                          onClick={() => {
                            if (isAvailable) {
                              console.log(`🎯 Saltando para ${street}`);
                              jumpToStreet(street);
                            }
                          }}
                          disabled={!isAvailable}
                          className={`px-2 py-1.5 rounded-lg font-medium transition-all w-full text-xs ${
                            isCurrentStreet
                              ? 'bg-green-600 text-white shadow-lg'
                              : isAvailable
                                ? 'bg-gray-700/70 text-gray-200 hover:bg-gray-600/70 hover:text-white cursor-pointer'
                                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed opacity-50'
                          }`}
                          title={!isAvailable ? t('errors.streetNotAvailable', { street: t(`streets.${street}`) }) : t('errors.goToStreet', { street: t(`streets.${street}`) })}
                        >
                          <span className="capitalize">
                            {t(`streets.${street}`)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navegação entre Mãos - COMPACTO (aparece apenas se há múltiplas mãos) */}
                {allHands.length > 1 && (
                  <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
                    <h3 className="text-white font-bold mb-2 text-center text-sm">Navegação de Mãos</h3>

                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <button
                        onClick={() => {
                          if (currentHandIndex > 0) {
                            setCurrentHandIndex(currentHandIndex - 1);
                            setCurrentSnapshotIndex(0);
                          }
                        }}
                        disabled={currentHandIndex === 0}
                        className="w-9 h-9 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                        title="Mão Anterior"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                        </svg>
                      </button>

                      <div className="text-center flex-1">
                        <div className="text-white font-semibold text-xs">
                          Mão {currentHandIndex + 1}/{allHands.length}
                        </div>
                        <div className="text-gray-400 text-[10px] truncate">
                          {handHistory?.handId}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (currentHandIndex < allHands.length - 1) {
                            setCurrentHandIndex(currentHandIndex + 1);
                            setCurrentSnapshotIndex(0);
                          }
                        }}
                        disabled={currentHandIndex === allHands.length - 1}
                        className="w-9 h-9 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                        title="Próxima Mão"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Botão Nova Mão - COMPACTO */}
                <button
                  onClick={() => {
                    setAllHands([]);
                    setCurrentHandIndex(0);
                    setCurrentSnapshotIndex(0);
                    setHandText('');
                    setError('');
                    setIsPlaying(false);
                    if (playIntervalRef.current) {
                      clearInterval(playIntervalRef.current);
                      playIntervalRef.current = null;
                    }
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-2.5 px-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">{t('hero.newHandButton')}</span>
                </button>
              </div>

            </div>


            {/* Teaser GTO após finalizar */}
            {!canGoNext() && (
              <div className="relative bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-2xl p-8 mb-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 backdrop-blur-sm"></div>

                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🔒</div>
                    <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                      {t('hero.gtoAnalysis.title')}
                    </h3>
                    <p className="text-gray-300">
                      {t('hero.gtoAnalysis.subtitle')}
                    </p>
                  </div>

                  <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 mb-6">
                    <div className="filter blur-sm pointer-events-none">
                      <div className="text-green-400 mb-2">✓ Hero (Preflop): 94% ótimo</div>
                      <div className="text-yellow-400 mb-2">⚠️ PlayerFive (Raise): 67% ótimo - Considerary call</div>
                      <div className="text-red-400">✗ PlayerOne (Call): 23% ótimo - Deveria fold</div>
                    </div>
                  </div>

                  <button
                    onClick={onShowLeadCapture}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-xl px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-2xl"
                  >
                    {t('hero.gtoAnalysis.unlock')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;