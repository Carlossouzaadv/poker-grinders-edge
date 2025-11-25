'use client';

import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  return (
    <header
      className={`fixed top-0 right-0 z-50 p-4 md:p-6 ${
        transparent ? 'bg-transparent' : 'bg-[#121212]/95 backdrop-blur-sm border-b border-[#4C5FD5]/20'
      }`}
    >
      <div className="flex items-center justify-end">
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
