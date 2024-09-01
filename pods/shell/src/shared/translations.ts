import { useEffect, useState } from 'react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import TranslationsDashboard from 'pod_dashboard/translations';
import TranslationsInvoices from 'pod_invoices/translations';

const CONFIG = {
  languages: ['en', 'ro'],
  bundles: [TranslationsDashboard, TranslationsInvoices],
};

const resources: Record<string, Record<string, string>> = {};

for (const translation of CONFIG.bundles) {
  for (const language of CONFIG.languages) {
    resources[language] = {
      ...resources[language],
      ...translation[language],
    };
  }
}

const instance = i18next.createInstance();

instance
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
  })
  .catch((error) => {
    console.error(error);
  });

const useTranslation = () => {
  const [, forceRerender] = useState<number>(0);

  const onLanguageChange = () => {
    forceRerender((r) => r + 1);
  };

  useEffect(() => {
    instance.on('languageChanged', onLanguageChange);

    return () => {
      instance.off('languageChanged', onLanguageChange);
    };
  }, []);

  return {
    t: instance.t,
  };
};

const changeLanguage = (language: string) => {
  instance.changeLanguage(language);
};

const translations = {
  useTranslation,
  changeLanguage,
};

export default translations;
