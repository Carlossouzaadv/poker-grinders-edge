'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  // Prevenir erro de hidratação
  useEffect(() => {
    setIsClient(true);
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => changeLanguage('pt')}
        className={`w-10 h-7 rounded overflow-hidden transition-all duration-200 hover:scale-110 border-2 ${
          isClient && currentLanguage === 'pt' ? 'border-yellow-400 shadow-lg scale-105' : 'border-gray-400'
        }`}
        title="Português (Brasil)"
      >
        {/* Bandeira do Brasil - SVG */}
        <svg viewBox="0 0 40 28" className="w-full h-full">
          {/* Fundo verde */}
          <rect width="40" height="28" fill="#009b3a"/>

          {/* Losango amarelo */}
          <polygon points="20,4 32,14 20,24 8,14" fill="#fedf00"/>

          {/* Círculo azul */}
          <circle cx="20" cy="14" r="6" fill="#002776"/>

          {/* Faixa "ORDEM E PROGRESSO" */}
          <ellipse cx="20" cy="14" rx="5.5" ry="2" fill="none" stroke="#fedf00" strokeWidth="0.3"/>
        </svg>
      </button>

      <button
        onClick={() => changeLanguage('en')}
        className={`w-10 h-7 rounded overflow-hidden transition-all duration-200 hover:scale-110 border-2 ${
          isClient && currentLanguage === 'en' ? 'border-yellow-400 shadow-lg scale-105' : 'border-gray-400'
        }`}
        title="English (United Kingdom)"
      >
        {/* Bandeira da Inglaterra */}
        <div className="w-full h-full bg-white relative">
          {/* Cruz vermelha */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 w-1 h-full bg-red-600 transform -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-red-600 transform -translate-y-1/2"></div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
