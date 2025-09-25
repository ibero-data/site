import type { APIRoute } from 'astro';

const languages = ['en', 'es', 'pt', 'it'];
const baseUrl = 'https://ibero-data.github.io';

export const GET: APIRoute = async () => {
  const pages = [
    '', // home
    '#services',
    '#about',
    '#contact'
  ];

  const urls = languages.flatMap(lang => {
    const langPrefix = lang === 'en' ? '' : `/${lang}`;
    return pages.map(page => ({
      url: `${baseUrl}${langPrefix}${page}`,
      changefreq: 'weekly',
      priority: page === '' ? 1.0 : 0.8,
      lastmod: new Date().toISOString()
    }));
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(({ url, changefreq, priority, lastmod }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${languages.map(lang => {
      const langPrefix = lang === 'en' ? '' : `/${lang}`;
      return `<xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${langPrefix}" />`;
    }).join('\n    ')}
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};

export const prerender = false;