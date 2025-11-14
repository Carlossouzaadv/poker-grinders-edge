'use client';

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  // Ensure i18n is initialized on client side
  if (typeof window !== 'undefined' && !i18n.isInitialized) {
    i18n.init().catch(err => console.warn('i18n init failed:', err));
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

export default I18nProvider;