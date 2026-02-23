import React, { useState, useEffect } from 'react';
import { Calculator } from './components/Calculator';
import { Language, dictionary } from './i18n/dictionary';

export default function App() {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const userLang = navigator.language || (navigator as any).userLanguage || '';
    if (userLang.includes('zh')) setLang('zh');
    else if (userLang.includes('de')) setLang('de');
    else setLang('en');
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-0 sm:p-4 md:p-8">
      <Calculator lang={lang} setLang={setLang} />
    </div>
  );
}
