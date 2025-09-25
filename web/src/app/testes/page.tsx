'use client';

import React, { useState } from 'react';
import TesteLayoutMesa from '@/components/test/TesteLayoutMesa';
import TesteCarta from '@/components/test/TesteCarta';
import TesteAposta from '@/components/test/TesteAposta';

const TestesPage = () => {
  const [currentTest, setCurrentTest] = useState<'layout' | 'cartas' | 'apostas'>('layout');

  const tests = [
    { id: 'layout' as const, name: 'Layout da Mesa', icon: '🎯' },
    { id: 'cartas' as const, name: 'Componente Carta', icon: '🃏' },
    { id: 'apostas' as const, name: 'Componente Aposta', icon: '🪙' }
  ];

  const renderCurrentTest = () => {
    switch (currentTest) {
      case 'layout':
        return <TesteLayoutMesa />;
      case 'cartas':
        return <TesteCarta />;
      case 'apostas':
        return <TesteAposta />;
      default:
        return <TesteLayoutMesa />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-400">🧪 Componentes de Teste</h1>
              <p className="text-gray-400 text-sm">Isolamento e validação dos componentes críticos</p>
            </div>

            <nav className="flex space-x-2">
              {tests.map((test) => (
                <button
                  key={test.id}
                  onClick={() => setCurrentTest(test.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentTest === test.id
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{test.icon}</span>
                  {test.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {renderCurrentTest()}
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-gray-700 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">🎉 Status dos Componentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                <div className="text-green-400 font-bold mb-1">✅ Layout da Mesa</div>
                <div className="text-green-200">6 players posicionados perfeitamente</div>
              </div>
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                <div className="text-blue-400 font-bold mb-1">✅ Componente Carta</div>
                <div className="text-blue-200">Sprites e tamanhos validados</div>
              </div>
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                <div className="text-purple-400 font-bold mb-1">✅ Componente Aposta</div>
                <div className="text-purple-200">Fichas e labels funcionais</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-4 text-gray-400 text-sm">
            <div className="mb-2">
              <strong>🚀 Funcionalidades Implementadas:</strong>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>✅ Navegação por Streets</div>
              <div>✅ Player Action Highlighting</div>
              <div>✅ Transições Suaves</div>
              <div>✅ Sprites Otimizados</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <div className="text-yellow-400 font-bold mb-2">📝 Como Testar</div>
            <div className="text-yellow-200 text-sm space-y-1">
              <div><strong>Layout:</strong> Verifique se todos os 6 players estão bem posicionados</div>
              <div><strong>Cartas:</strong> Teste diferentes tamanhos e face up/down</div>
              <div><strong>Apostas:</strong> Valide fichas coloridas e formatação dos valores</div>
            </div>
          </div>

          <div className="mt-4 text-gray-500 text-xs">
            🎯 Use estes testes para validar que os componentes visuais estão funcionando antes de integrar no replayer principal
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TestesPage;