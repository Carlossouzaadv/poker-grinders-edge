import React from 'react';

export const DashboardMockup: React.FC = () => (
  <div className="bg-gray-900 rounded-2xl p-4 w-64 h-96 shadow-2xl border border-gray-700 relative overflow-hidden">
    {/* Status bar */}
    <div className="flex justify-between items-center text-white text-xs mb-4">
      <span>9:41 AM</span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-white rounded-full"></div>
        <div className="w-1 h-1 bg-white rounded-full"></div>
        <div className="w-1 h-1 bg-white rounded-full"></div>
      </div>
    </div>

    {/* Header */}
    <div className="text-center mb-6">
      <h3 className="text-white font-bold text-lg">Dashboard</h3>
      <p className="text-green-400 text-sm">Setembro 2024</p>
    </div>

    {/* Stats Cards */}
    <div className="space-y-4 mb-6">
      <div className="bg-green-800/30 border border-green-500/30 rounded-lg p-3">
        <div className="text-green-400 text-xs">Total Profit</div>
        <div className="text-white font-bold text-xl">+$2,847</div>
        <div className="text-green-400 text-xs">↗ +12.5% este mês</div>
      </div>

      <div className="bg-blue-800/30 border border-blue-500/30 rounded-lg p-3">
        <div className="text-blue-400 text-xs">ROI Médio</div>
        <div className="text-white font-bold text-xl">18.3%</div>
        <div className="text-blue-400 text-xs">142 torneios</div>
      </div>
    </div>

    {/* Chart Area */}
    <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
      <div className="text-gray-300 text-xs mb-2">Evolução (30 dias)</div>
      <div className="h-16 flex items-end space-x-1">
        {[12, 8, 15, 22, 18, 25, 30, 28, 35, 32, 38, 42, 40, 45].map((height, i) => (
          <div
            key={i}
            className="bg-gradient-to-t from-green-600 to-green-400 w-3 rounded-sm"
            style={{ height: `${height}%` }}
          ></div>
        ))}
      </div>
    </div>

    {/* Bottom nav */}
    <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs">
      <div className="text-green-400">📊</div>
      <div className="text-gray-500">🃏</div>
      <div className="text-gray-500">🎯</div>
      <div className="text-gray-500">👨‍🏫</div>
    </div>

    {/* Glow effect */}
    <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl blur opacity-30"></div>
  </div>
);

export const GTOMockup: React.FC = () => (
  <div className="bg-gray-900 rounded-2xl p-4 w-64 h-96 shadow-2xl border border-gray-700 relative overflow-hidden">
    {/* Status bar */}
    <div className="flex justify-between items-center text-white text-xs mb-4">
      <span>9:41 AM</span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-white rounded-full"></div>
        <div className="w-1 h-1 bg-white rounded-full"></div>
        <div className="w-1 h-1 bg-white rounded-full"></div>
      </div>
    </div>

    {/* Header */}
    <div className="text-center mb-4">
      <h3 className="text-white font-bold text-lg">Consultor GTO</h3>
      <p className="text-purple-400 text-sm">6-Max Cash Game</p>
    </div>

    {/* Scenario */}
    <div className="bg-purple-800/30 border border-purple-500/30 rounded-lg p-3 mb-4">
      <div className="text-purple-400 text-xs mb-1">Cenário</div>
      <div className="text-white text-sm">BTN vs BB, 100bb</div>
      <div className="text-gray-300 text-xs">Facing 3-bet to 12bb</div>
    </div>

    {/* Range Grid */}
    <div className="mb-4">
      <div className="text-gray-300 text-xs mb-2">Range Recomendado:</div>
      <div className="grid grid-cols-6 gap-1">
        {/* AA, KK, QQ, JJ - Call/4bet */}
        {['AA', 'KK', 'QQ', 'JJ', 'TT', '99'].map((hand, i) => (
          <div
            key={i}
            className={`h-6 w-6 text-xs flex items-center justify-center rounded text-white font-bold ${
              i < 4 ? 'bg-green-600' : 'bg-yellow-600'
            }`}
          >
            {hand}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1 mt-1">
        {['AK', 'AQ', 'AJ', 'KQ', 'QJ', 'JT'].map((hand, i) => (
          <div
            key={i}
            className={`h-6 w-6 text-xs flex items-center justify-center rounded text-white font-bold ${
              i < 2 ? 'bg-green-600' : i < 4 ? 'bg-yellow-600' : 'bg-red-600'
            }`}
          >
            {hand}
          </div>
        ))}
      </div>
    </div>

    {/* Legend */}
    <div className="space-y-2 text-xs">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-600 rounded"></div>
        <span className="text-white">Call/4-bet (32%)</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-yellow-600 rounded"></div>
        <span className="text-white">Call (28%)</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-600 rounded"></div>
        <span className="text-white">Fold (40%)</span>
      </div>
    </div>

    {/* Bottom nav */}
    <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs">
      <div className="text-gray-500">📊</div>
      <div className="text-purple-400">🧠</div>
      <div className="text-gray-500">🎯</div>
      <div className="text-gray-500">👨‍🏫</div>
    </div>

    {/* Glow effect */}
    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur opacity-30"></div>
  </div>
);

export const MarketplaceMockup: React.FC = () => (
  <div className="bg-gray-900 rounded-2xl p-4 w-64 h-96 shadow-2xl border border-gray-700 relative overflow-hidden">
    {/* Status bar */}
    <div className="flex justify-between items-center text-white text-xs mb-4">
      <span>9:41 AM</span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-white rounded-full"></div>
        <div className="w-1 h-1 bg-white rounded-full"></div>
        <div className="w-1 h-1 bg-white rounded-full"></div>
      </div>
    </div>

    {/* Header */}
    <div className="text-center mb-4">
      <h3 className="text-white font-bold text-lg">Coaches</h3>
      <p className="text-orange-400 text-sm">Encontre seu mentor</p>
    </div>

    {/* Coach Cards */}
    <div className="space-y-3 mb-4">
      <div className="bg-orange-800/30 border border-orange-500/30 rounded-lg p-3">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            RF
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Rafael Silva</div>
            <div className="text-orange-400 text-xs">MTT Specialist</div>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
          <div className="text-gray-300">⭐ 4.9 • 127 aulas</div>
          <div className="text-green-400 font-bold">R$ 150/h</div>
        </div>
      </div>

      <div className="bg-blue-800/30 border border-blue-500/30 rounded-lg p-3">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            MC
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Marina Costa</div>
            <div className="text-blue-400 text-xs">Cash Game Pro</div>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
          <div className="text-gray-300">⭐ 4.8 • 89 aulas</div>
          <div className="text-green-400 font-bold">R$ 200/h</div>
        </div>
      </div>

      <div className="bg-green-800/30 border border-green-500/30 rounded-lg p-3">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            TS
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Thiago Santos</div>
            <div className="text-green-400 text-xs">SNG Expert</div>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
          <div className="text-gray-300">⭐ 4.7 • 203 aulas</div>
          <div className="text-green-400 font-bold">R$ 120/h</div>
        </div>
      </div>
    </div>

    {/* Filter buttons */}
    <div className="flex space-x-2 text-xs mb-4">
      <div className="bg-orange-600 text-white px-3 py-1 rounded-full">MTT</div>
      <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full">Cash</div>
      <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full">SNG</div>
    </div>

    {/* Bottom nav */}
    <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs">
      <div className="text-gray-500">📊</div>
      <div className="text-gray-500">🧠</div>
      <div className="text-gray-500">🎯</div>
      <div className="text-orange-400">👨‍🏫</div>
    </div>

    {/* Glow effect */}
    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 rounded-2xl blur opacity-30"></div>
  </div>
);