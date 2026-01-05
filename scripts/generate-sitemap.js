import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOMAIN = 'https://iberodata.es';
const LOCALES = ['en', 'es'];

const STATIC_PAGES = [
  { loc: '', priority: 1.0, changefreq: 'daily' },
];

const ADDITIONAL_PAGES = [
  { loc: '/services', priority: 0.9, changefreq: 'weekly' },
  { loc: '/about', priority: 0.8, changefreq: 'weekly' },
  { loc: '/contact', priority: 0.7, changefreq: 'monthly' },
  { loc: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { loc: '/terms', priority: 0.3, changefreq: 'yearly' },
];

function generateSitemapXML(urls) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
${url.alternates ? url.alternates.map(alt =>
    `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}"/>`
).join('\n') : ''}
  </url>`).join('\n')}
</urlset>`;
  return xml;
}

function generateSitemapIndex(sitemaps) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${DOMAIN}/${sitemap}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  return xml;
}

function generateUrls() {
  const urls = [];
  const today = new Date().toISOString().split('T')[0];

  // Generate URLs for all static pages and locales
  STATIC_PAGES.forEach(page => {
    // Default locale (en) without prefix
    const enUrl = {
      loc: `${DOMAIN}${page.loc}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
      alternates: LOCALES.map(locale => ({
        lang: locale === 'en' ? 'x-default' : locale,
        href: locale === 'en' ? `${DOMAIN}${page.loc}` : `${DOMAIN}/${locale}${page.loc}`
      }))
    };
    urls.push(enUrl);

    // Other locales with prefix
    LOCALES.filter(l => l !== 'en').forEach(locale => {
      urls.push({
        loc: `${DOMAIN}/${locale}${page.loc}`,
        lastmod: today,
        changefreq: page.changefreq,
        priority: page.priority * 0.9, // Slightly lower priority for alternate languages
        alternates: LOCALES.map(l => ({
          lang: l === 'en' ? 'x-default' : l,
          href: l === 'en' ? `${DOMAIN}${page.loc}` : `${DOMAIN}/${l}${page.loc}`
        }))
      });
    });
  });

  // Add additional pages if they exist
  ADDITIONAL_PAGES.forEach(page => {
    // Check if these pages exist in your structure
    // For now, we'll add them as placeholders
    const enUrl = {
      loc: `${DOMAIN}${page.loc}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
      alternates: LOCALES.map(locale => ({
        lang: locale === 'en' ? 'x-default' : locale,
        href: locale === 'en' ? `${DOMAIN}${page.loc}` : `${DOMAIN}/${locale}${page.loc}`
      }))
    };
    urls.push(enUrl);

    LOCALES.filter(l => l !== 'en').forEach(locale => {
      urls.push({
        loc: `${DOMAIN}/${locale}${page.loc}`,
        lastmod: today,
        changefreq: page.changefreq,
        priority: page.priority * 0.9,
        alternates: LOCALES.map(l => ({
          lang: l === 'en' ? 'x-default' : l,
          href: l === 'en' ? `${DOMAIN}${page.loc}` : `${DOMAIN}/${l}${page.loc}`
        }))
      });
    });
  });

  return urls;
}

function generateSitemaps() {
  const publicDir = path.join(__dirname, '..', 'public');

  // Generate main sitemap
  const urls = generateUrls();
  const sitemapXML = generateSitemapXML(urls);
  fs.writeFileSync(path.join(publicDir, 'sitemap-0.xml'), sitemapXML);

  // Generate sitemap index
  const sitemapIndex = generateSitemapIndex(['sitemap-0.xml']);
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndex);

  // Also create a sitemap.xml that points to the index for compatibility
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);

  console.log('✅ Sitemaps generated successfully!');
  console.log(`   - sitemap-index.xml (${urls.length} URLs total)`);
  console.log('   - sitemap-0.xml');
  console.log('   - sitemap.xml (copy of index for compatibility)');
}

generateSitemaps();