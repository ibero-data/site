# Ibero Data Website

Professional multilanguage website for Ibero Data - Specializing in Open-Source Data Engineering and Custom Connectors.

## 🚀 Features

- **Multilanguage Support**: EN, ES, PT, IT
- **SEO Optimized**: Complete with sitemap, meta tags, and structured data
- **Responsive Design**: Mobile-first approach
- **Modern Stack**: Astro, React, Tailwind CSS
- **Contact Form**: Ready for integration with email services
- **GitHub Pages Ready**: Configured for automatic deployment

## 📦 Installation

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## 🔧 Configuration

### Email Setup

The contact form needs to be configured with an email service. Options:

1. **Formspree** (Recommended for static sites):
   - Sign up at https://formspree.io/
   - Get your form ID
   - Update `src/components/ContactForm.tsx` with your form ID

2. **Resend** (For server environments):
   - Add `RESEND_API_KEY` to your environment variables
   - Deploy to a platform that supports server functions (Vercel, Netlify)

### Custom Domain

Update the CNAME file in `/public/CNAME` with your domain.

### GitHub Pages Deployment

1. Push code to GitHub
2. Enable GitHub Pages in repository settings
3. Add `RESEND_API_KEY` to GitHub Secrets (if using server functions)
4. The site will automatically deploy on push to main branch

## 📁 Project Structure

```
├── public/
│   ├── logo.png
│   ├── CNAME
│   └── robots.txt
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── styles/
├── locales/
│   ├── en.json
│   ├── es.json
│   ├── pt.json
│   └── it.json
└── .github/
    └── workflows/
        └── deploy.yml
```

## 🌍 Supported Languages

- English (EN)
- Spanish (ES)
- Portuguese (PT)
- Italian (IT)

## 📄 License

© 2024 Ibero Data. All rights reserved.

## 🤝 Contact

- Website: https://iberodata.com
- Email: c.riccuti@iberodata.es
- GitHub: https://github.com/ibero-data
- LinkedIn: https://www.linkedin.com/company/iberodata/