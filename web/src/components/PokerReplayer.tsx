import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HandHistory, Snapshot } from '@/types/poker';
import { SnapshotBuilder } from '@/lib/snapshot-builder';
import PokerTable from './poker/PokerTable';
import HandSummary from './poker/HandSummary';
import TableFooter from './hand-analyzer/TableFooter';

interface PokerReplayerProps {
  handHistory: HandHistory;
  onNewHand?: () => void;
  // Navegação entre mãos
  allHandsCount?: number;
  currentHandIndex?: number;
  onPreviousHand?: () => void;
  onNextHand?: () => void;
  onFirstHand?: () => void;
  onLastHand?: () => void;
}

const PokerReplayer: React.FC<PokerReplayerProps> = ({
  handHistory,
  onNewHand,
  allHandsCount = 1,
  currentHandIndex = 0,
  onPreviousHand,
  onNextHand,
  onFirstHand,
  onLastHand
}) => {
  const { t } = useTranslation();
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [displayMode, setDisplayMode] = useState<'chips' | 'bb'>('chips');

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
        setCurrentSnapshotIndex(0);
      } catch (error) {
        console.error('❌ Error building snapshots:', error);
        setSnapshots([]);
      }
    };

    buildSnapshots();
  }, [handHistory]);

  const currentSnapshot = snapshots[currentSnapshotIndex] || null;

  // Auto-play interval ref
  const playIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Memoize navigation state checks
  const canGoNext = useMemo(
    () => Array.isArray(snapshots) && currentSnapshotIndex < snapshots.length - 1,
    [snapshots, currentSnapshotIndex]
  );

  const canGoPrevious = useMemo(
    () => currentSnapshotIndex > 0,
    [currentSnapshotIndex]
  );

  // Memoize navigation handlers
  const handleNext = useCallback(() => {
    setCurrentSnapshotIndex(prev => prev + 1);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentSnapshotIndex(prev => prev - 1);
  }, []);

  // Memoize play/pause handler
  const handlePlay = useCallback(() => {
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
  }, [isPlaying, snapshots]);

  // Memoize street navigation handler
  const jumpToStreet = useCallback((street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown') => {
    if (!Array.isArray(snapshots) || snapshots.length === 0) return;

    let targetIndex = -1;

    if (street === 'preflop') {
      targetIndex = 0;
    } else {
      targetIndex = snapshots.findIndex(snapshot => snapshot.street === street);
    }

    if (targetIndex !== -1) {
      console.log(`🎯 Jumping to ${street} at snapshot ${targetIndex}`);
      setCurrentSnapshotIndex(targetIndex);
    }
  }, [snapshots]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  const currentDescription = currentSnapshot ? currentSnapshot.description : t('replayer.waitingStart', 'Aguardando início da mão');

  // Get final snapshot for HandSummary
  const finalSnapshot = snapshots[snapshots.length - 1] || currentSnapshot;

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 rounded-2xl">
      {/* Ação Atual - Banner superior */}
      {currentDescription && (
        <div className="mb-6 bg-gradient-to-r from-blue-900/60 to-purple-900/60 border border-blue-400/30 rounded-2xl p-4 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl">🎬</span>
            <p className="text-xl font-bold text-blue-100">
              {currentDescription}
            </p>
          </div>
        </div>
      )}

      {/* Layout: Mesa grande (75%) + Controles estreitos (25%) */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Seção Esquerda: Mesa + Equity/Notas */}
        <div className="w-full lg:flex-[4] space-y-6">
          {/* Mesa de Poker */}
          {currentSnapshot && (
            <PokerTable
              handHistory={handHistory}
              snapshot={currentSnapshot}
              showAllCards={false}
              displayMode={displayMode}
            />
          )}

          {/* Table Footer (Equity Calculator + Notas) */}
          <TableFooter handHistory={handHistory} />
        </div>

        {/* Seção Direita: Controles */}
        <div className="w-full lg:flex-1 lg:max-w-xs flex flex-col space-y-3 lg:sticky lg:top-4">

          {/* Display Mode Toggle */}
          <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl flex justify-between items-center">
            <span className="text-gray-300 text-sm font-medium">{t('displayMode', 'Display Mode')}</span>
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setDisplayMode('chips')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${displayMode === 'chips' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
              >
                {t('chips', 'Chips')}
              </button>
              <button
                onClick={() => setDisplayMode('bb')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${displayMode === 'bb' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
              >
                {t('bb', 'BB')}
              </button>
            </div>
          </div>

          {/* Controles de Reprodução */}
          <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
            <h3 className="text-white font-bold mb-2 text-center text-sm">{t('controls', 'Controls')}</h3>

            {/* Botões de controle */}
            <div className="flex items-center justify-center space-x-2 mb-3">
              <button
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className="w-10 h-10 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                title={t('previous', 'Previous')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                onClick={handlePlay}
                className={`w-12 h-12 rounded-full text-white font-bold transition-all shadow-lg flex items-center justify-center ${isPlaying
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                    : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'
                  }`}
                title={isPlaying ? t('pause', 'Pause') : t('play', 'Play')}
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
                disabled={!canGoNext}
                className="w-10 h-10 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                title={t('next', 'Next')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Informações do progresso */}
            <div className="text-center">
              <div className="text-white font-semibold text-xs mb-0.5">
                {t('snapshot', 'Snapshot')} {currentSnapshotIndex + 1} / {snapshots.length}
              </div>
              <div className="text-gray-400 text-[10px] capitalize">
                {t(`streets.${currentSnapshot?.street || 'preflop'}`)}
              </div>
            </div>
          </div>

          {/* Street Navigation */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
            <h3 className="text-white font-bold mb-2 text-center text-sm">{t('streetNavigation', 'Street Navigation')}</h3>
            <div className="flex flex-col space-y-1.5">
              {(['preflop', 'flop', 'turn', 'river', 'showdown'] as const).map((street) => {
                const isAvailable = street === 'preflop' ||
                  street === 'showdown' && handHistory?.showdown ||
                  (Array.isArray(snapshots) && snapshots.some(snapshot => snapshot.street === street));
                const isCurrentStreet = currentSnapshot?.street === street;

                return (
                  <button
                    key={street}
                    onClick={() => isAvailable && jumpToStreet(street)}
                    disabled={!isAvailable}
                    className={`px-2 py-1.5 rounded-lg font-medium transition-all w-full text-xs capitalize ${isCurrentStreet
                        ? 'bg-green-600 text-white shadow-lg'
                        : isAvailable
                          ? 'bg-gray-700/70 text-gray-200 hover:bg-gray-600/70 hover:text-white cursor-pointer'
                          : 'bg-gray-800/50 text-gray-500 cursor-not-allowed opacity-50'
                      }`}
                  >
                    {t(`streets.${street}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navegação entre Mãos (aparece apenas se há múltiplas mãos) */}
          {allHandsCount > 1 && (
            <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
              <h3 className="text-white font-bold mb-2 text-center text-sm">{t('handNavigation', 'Hand Navigation')}</h3>

              <div className="flex items-center justify-between space-x-1 mb-2">
                <button
                  onClick={onFirstHand}
                  disabled={currentHandIndex === 0}
                  className="p-2 rounded-lg bg-gray-700/80 hover:bg-gray-600 text-white disabled:opacity-50 text-xs"
                  title={t('firstHand', 'First Hand')}
                >
                  |&lt;
                </button>
                <button
                  onClick={onPreviousHand}
                  disabled={currentHandIndex === 0}
                  className="p-2 rounded-lg bg-gray-700/80 hover:bg-gray-600 text-white disabled:opacity-50 text-xs"
                  title={t('previousHand', 'Previous Hand')}
                >
                  &lt;
                </button>

                <div className="text-center flex-1">
                  <div className="text-white font-semibold text-xs">
                    {t('hand', 'Hand')} {currentHandIndex + 1}/{allHandsCount}
                  </div>
                  <div className="text-gray-400 text-[10px] truncate">
                    {handHistory?.handId}
                  </div>
                </div>

                <button
                  onClick={onNextHand}
                  disabled={currentHandIndex === allHandsCount - 1}
                  className="p-2 rounded-lg bg-gray-700/80 hover:bg-gray-600 text-white disabled:opacity-50 text-xs"
                  title={t('nextHand', 'Next Hand')}
                >
                  &gt;
                </button>
                <button
                  onClick={onLastHand}
                  disabled={currentHandIndex === allHandsCount - 1}
                  className="p-2 rounded-lg bg-gray-700/80 hover:bg-gray-600 text-white disabled:opacity-50 text-xs"
                  title={t('lastHand', 'Last Hand')}
                >
                  &gt;|
                </button>
              </div>
            </div>
          )}

          {/* Botão Nova Mão */}
          {onNewHand && (
            <button
              onClick={onNewHand}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>{t('newHand', 'New Hand')}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Hand Summary (Resultados) */}
      {finalSnapshot && (
        <div className="mt-8">
          <HandSummary
            handHistory={handHistory}
            finalSnapshot={finalSnapshot}
          />
        </div>
      )}
    </div>
  );
};

export default PokerReplayer;
