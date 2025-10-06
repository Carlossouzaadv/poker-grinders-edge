'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HTMLWrapperProps {
  children: React.ReactNode;
}

export default function HTMLWrapper({ children }: HTMLWrapperProps) {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState('pt');

  useEffect(() => {
    const currentLang = i18n.language || 'pt';
    setLang(currentLang);
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  return (
    <html lang={lang} suppressHydrationWarning>
      {children}
    </html>
  );
}
