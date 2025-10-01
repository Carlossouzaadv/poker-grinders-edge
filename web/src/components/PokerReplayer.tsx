import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HandHistory, Snapshot } from '@/types/poker';
import { SnapshotBuilder } from '@/lib/snapshot-builder';
import PokerTable from './poker/PokerTable';

interface PokerReplayerProps {
  handHistory: HandHistory;
  onNewHand?: () => void;
}

const PokerReplayer: React.FC<PokerReplayerProps> = ({ handHistory, onNewHand }) => {
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

  const canGoNext = () => Array.isArray(snapshots) && currentSnapshotIndex < snapshots.length - 1;
  const canGoPrevious = () => currentSnapshotIndex > 0;

  const handleNext = () => {
    if (!canGoNext()) return;
    setCurrentSnapshotIndex(currentSnapshotIndex + 1);
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

  // Street navigation
  const jumpToStreet = (street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown') => {
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
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  const currentDescription = currentSnapshot ? currentSnapshot.description : 'Aguardando início da mão';

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 rounded-2xl">
      {/* Mesa e Controles */}
      <div className="flex gap-8 items-start">

        {/* Mesa de poker */}
        <div className="flex-grow">
          {currentSnapshot && (
            <PokerTable
              handHistory={handHistory}
              snapshot={currentSnapshot}
              showAllCards={false}
            />
          )}
        </div>

        {/* Painel lateral de controles */}
        <div className="w-56 flex flex-col space-y-3 sticky top-4">

          {/* Controles de Reprodução */}
          <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
            <h3 className="text-white font-bold mb-2 text-center text-sm">Controles</h3>

            {/* Botões de controle */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <button
                onClick={handlePrevious}
                disabled={!canGoPrevious()}
                className="w-12 h-12 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                title="Anterior"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                onClick={handlePlay}
                className={`w-14 h-14 rounded-full text-white font-bold transition-all shadow-lg flex items-center justify-center ${
                  isPlaying
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                    : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'
                }`}
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="w-12 h-12 rounded-full bg-gray-700/80 hover:bg-gray-600 text-white disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                title="Próximo"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Informações do progresso */}
            <div className="text-center">
              <div className="text-white font-semibold text-sm mb-1">
                Snapshot {currentSnapshotIndex + 1} / {snapshots.length}
              </div>
              <div className="text-gray-400 text-xs capitalize">
                {currentSnapshot?.street || 'preflop'}
              </div>
            </div>
          </div>

          {/* Street Navigation */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-gray-600/50 shadow-xl">
            <h3 className="text-white font-bold mb-2 text-center text-sm">Navegação por Street</h3>
            <div className="flex flex-col space-y-2">
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
                    className={`px-3 py-2 rounded-lg font-medium transition-all w-full text-sm capitalize ${
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

          {/* Chat de Ações */}
          {currentDescription && (
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-l-4 border-blue-400 p-4 rounded-r-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🎬</span>
                <p className="text-lg font-bold text-blue-200">
                  {currentDescription}
                </p>
              </div>
            </div>
          )}

          {/* Botão Nova Mão */}
          {onNewHand && (
            <button
              onClick={onNewHand}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Nova Mão</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokerReplayer;
