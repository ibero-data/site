export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang && ['en', 'es'].includes(lang)) return lang as string;
  return 'en';
}

export function useTranslations(lang: string) {
  return function t(key: string) {
    return translations[lang]?.[key] || translations['en'][key] || key;
  };
}

interface Translations {
  [key: string]: any;
}

const translations: { [key: string]: Translations } = {
  en: await import('../../locales/en.json'),
  es: await import('../../locales/es.json'),
};

export function getTranslations(lang: string) {
  return translations[lang] || translations['en'];
}