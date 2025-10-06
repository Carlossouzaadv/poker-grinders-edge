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
}

const PokerReplayer: React.FC<PokerReplayerProps> = ({
  handHistory,
  onNewHand,
  allHandsCount = 1,
  currentHandIndex = 0,
  onPreviousHand,
  onNextHand
}) => {
  const { t } = useTranslation();
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

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

  const currentDescription = currentSnapshot ? currentSnapshot.description : 'Aguardando início da mão';

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
        <div className="w-full lg:flex-[3] space-y-6">
          {/* Mesa de Poker */}
          {currentSnapshot && (
            <PokerTable
              handHistory={handHistory}
              snapshot={currentSnapshot}
              showAllCards={false}
            />
          )}

          {/* Table Footer (Equity Calculator + Notas) */}
          <TableFooter handHistory={handHistory} />
        </div>

        {/* Seção Direita: Controles */}
        <div className="w-full lg:flex-1 lg:max-w-xs flex flex-col space-y-3 lg:sticky lg:top-4">

          {/* Controles de Reprodução */}
          <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
            <h3 className="text-white font-bold mb-2 text-center text-sm">Controles</h3>

            {/* Botões de controle */}
            <div className="flex items-center justify-center space-x-2 mb-3">
              <button
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className="w-10 h-10 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                title="Anterior"
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
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
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
                title="Próximo"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Informações do progresso */}
            <div className="text-center">
              <div className="text-white font-semibold text-xs mb-0.5">
                Snapshot {currentSnapshotIndex + 1} / {snapshots.length}
              </div>
              <div className="text-gray-400 text-[10px] capitalize">
                {currentSnapshot?.street || 'preflop'}
              </div>
            </div>
          </div>

          {/* Street Navigation */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
            <h3 className="text-white font-bold mb-2 text-center text-sm">Navegação por Street</h3>
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
                    className={`px-2 py-1.5 rounded-lg font-medium transition-all w-full text-xs capitalize ${
                      isCurrentStreet
                        ? 'bg-green-600 text-white shadow-lg'
                        : isAvailable
                          ? 'bg-gray-700/70 text-gray-200 hover:bg-gray-600/70 hover:text-white cursor-pointer'
                          : 'bg-gray-800/50 text-gray-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {street}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navegação entre Mãos (aparece apenas se há múltiplas mãos) */}
          {allHandsCount > 1 && (
            <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
              <h3 className="text-white font-bold mb-2 text-center text-sm">Navegação de Mãos</h3>

              <div className="flex items-center justify-center space-x-2 mb-2">
                <button
                  onClick={onPreviousHand}
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
                    Mão {currentHandIndex + 1}/{allHandsCount}
                  </div>
                  <div className="text-gray-400 text-[10px] truncate">
                    {handHistory?.handId}
                  </div>
                </div>

                <button
                  onClick={onNextHand}
                  disabled={currentHandIndex === allHandsCount - 1}
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

          {/* Hand Summary */}
          {finalSnapshot && (
            <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
              <HandSummary
                handHistory={handHistory}
                finalSnapshot={finalSnapshot}
              />
            </div>
          )}

          {/* Botão Nova Mão */}
          {onNewHand && (
            <button
              onClick={onNewHand}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-2.5 px-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Nova Mão</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default PokerReplayer;
