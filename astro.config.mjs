// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	integrations: [
		react(),
		mdx(),
		sitemap({
			i18n: {
				defaultLocale: 'en',
				locales: {
					en: 'en',
					es: 'es',
					pt: 'pt',
					it: 'it'
				}
			}
		})
	],
	vite: {
		plugins: [tailwindcss()],
	},
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'es', 'pt', 'it'],
		routing: {
			prefixDefaultLocale: false
		}
	},
	output: 'static',
	site: 'https://iberodata.es',
	base: '/'
});
