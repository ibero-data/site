import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOMAIN = 'https://iberodata.es';
const LOCALES = ['en', 'es', 'pt', 'it'];

function generateRSSFeed(locale = 'en') {
  const langPath = locale === 'en' ? '' : `/${locale}`;
  const feedUrl = `${DOMAIN}${langPath}/rss.xml`;
  const siteUrl = `${DOMAIN}${langPath}`;

  const langTitles = {
    en: 'Ibero Data - Data Engineering Solutions',
    es: 'Ibero Data - Soluciones de Ingeniería de Datos',
    pt: 'Ibero Data - Soluções de Engenharia de Dados',
    it: 'Ibero Data - Soluzioni di Ingegneria dei Dati'
  };

  const langDescriptions = {
    en: 'Latest updates from Ibero Data - Open-Source Data Engineering and Custom Connectors',
    es: 'Últimas actualizaciones de Ibero Data - Ingeniería de Datos Open-Source y Conectores Personalizados',
    pt: 'Últimas atualizações da Ibero Data - Engenharia de Dados Open-Source e Conectores Personalizados',
    it: 'Ultimi aggiornamenti da Ibero Data - Ingegneria dei Dati Open-Source e Connettori Personalizzati'
  };

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${langTitles[locale]}</title>
    <description>${langDescriptions[locale]}</description>
    <link>${siteUrl}</link>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>

    <item>
      <title>${locale === 'en' ? 'Welcome to Ibero Data' : locale === 'es' ? 'Bienvenido a Ibero Data' : locale === 'pt' ? 'Bem-vindo ao Ibero Data' : 'Benvenuto in Ibero Data'}</title>
      <description>${langDescriptions[locale]}</description>
      <link>${siteUrl}</link>
      <guid isPermaLink="true">${siteUrl}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <dc:creator>Ibero Data Team</dc:creator>
    </item>
  </channel>
</rss>`;

  return rss;
}

function generateAllRSSFeeds() {
  const publicDir = path.join(__dirname, '..', 'public');

  // Generate RSS for each locale
  LOCALES.forEach(locale => {
    const rss = generateRSSFeed(locale);

    if (locale === 'en') {
      // Main RSS feed at root
      fs.writeFileSync(path.join(publicDir, 'rss.xml'), rss);
      fs.writeFileSync(path.join(publicDir, 'feed.xml'), rss); // Alternative feed URL
    } else {
      // Create locale directory if it doesn't exist
      const localeDir = path.join(publicDir, locale);
      if (!fs.existsSync(localeDir)) {
        fs.mkdirSync(localeDir, { recursive: true });
      }
      fs.writeFileSync(path.join(localeDir, 'rss.xml'), rss);
    }
  });

  console.log('✅ RSS feeds generated successfully!');
  console.log('   - /rss.xml (English)');
  console.log('   - /feed.xml (English alternative)');
  LOCALES.filter(l => l !== 'en').forEach(locale => {
    console.log(`   - /${locale}/rss.xml (${locale.toUpperCase()})`);
  });
}

generateAllRSSFeeds();