'use client';

import React, { useState } from 'react';
import HandAnalysisReport from './HandAnalysisReport';
import HandNotes from './HandNotes';
import { HandHistory } from '@/types/poker';

interface TableFooterProps {
  handHistory?: HandHistory | null;
}

const TableFooter: React.FC<TableFooterProps> = ({ handHistory }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'notes'>('analysis');

  return (
    <div className="mt-6 mb-8">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'analysis'
              ? 'bg-[#00FF8C] text-black'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
        >
          🤖 Análise
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'notes'
              ? 'bg-[#00FF8C] text-black'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
        >
          📝 Notas
        </button>
      </div>

      {/* Desktop: Side by Side | Mobile: Tabbed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hand Analysis Report */}
        <div className={`${activeTab === 'analysis' ? 'block' : 'hidden'} lg:block`}>
          <HandAnalysisReport handHistory={handHistory || null} />
        </div>

        {/* Hand Notes */}
        <div className={`${activeTab === 'notes' ? 'block' : 'hidden'} lg:block`}>
          <HandNotes
            handId={handHistory?.handId || 'unknown'}
          />
        </div>
      </div>
    </div>
  );
};

export default TableFooter;
