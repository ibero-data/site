// Google PageSpeed Insights API analyzer for MarTech detection

const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const PSI_API_KEY = import.meta.env.PUBLIC_PSI_API_KEY || "";
const CACHE_KEY = "psi_audit_cache_v3"; // v3 adds server-side GTM detection via first-party proxy
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Custom error for rate limiting
export class RateLimitError extends Error {
  constructor() {
    super("API rate limit exceeded. Please try again later or contact us for a manual audit.");
    this.name = "RateLimitError";
  }
}

// Cache helpers
function getCachedResult(url: string): AuditResult | null {
  if (typeof window === "undefined") return null;
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const entry = cache[url];
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.data;
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function setCachedResult(url: string, data: AuditResult): void {
  if (typeof window === "undefined") return;
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    // Clean old entries
    const now = Date.now();
    for (const key in cache) {
      if (now - cache[key].timestamp > CACHE_TTL) {
        delete cache[key];
      }
    }
    cache[url] = { timestamp: now, data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore cache errors
  }
}

export interface MarTechDetection {
  name: string;
  category: "google" | "social" | "consent" | "analytics" | "other";
  detected: boolean;
  details?: string;
  recommendation?: string;
}

export interface AuditResult {
  url: string;
  timestamp: string;
  martech: MarTechDetection[];
  performance: {
    score: number;
    lcp: { value: number; rating: "good" | "needs-improvement" | "poor" };
    fid: { value: number; rating: "good" | "needs-improvement" | "poor" };
    cls: { value: number; rating: "good" | "needs-improvement" | "poor" };
    fcp: { value: number; rating: "good" | "needs-improvement" | "poor" };
  };
  thirdPartyCount: number;
  thirdParties: { name: string; url: string; transferSize: number }[];
  recommendations: string[];
}

// Detection patterns for various MarTech platforms
const MARTECH_PATTERNS = {
  // Google Stack
  gtm: {
    patterns: ["googletagmanager.com", "gtm.js", "gtag/js", "gtag.js"],
    name: "Google Tag Manager",
    category: "google" as const,
    recommendation: "Consider migrating to GTM Server-Side for better privacy compliance",
  },
  gtmServerSide: {
    patterns: [".tagging-server.", "sgtm.", "gtm-server.", "server-side-tagging", "/gtm/"],
    name: "GTM Server-Side",
    category: "google" as const,
    recommendation: null,
  },
  ga4: {
    patterns: ["google-analytics.com", "analytics.google.com", "/g/collect", "gtag("],
    name: "Google Analytics 4",
    category: "google" as const,
    recommendation: "Ensure GA4 is configured with consent mode for GDPR compliance",
  },
  googleAds: {
    patterns: ["googleadservices.com", "googlesyndication.com", "doubleclick.net", "googleads.g.doubleclick.net", "pagead2.googlesyndication.com"],
    name: "Google Ads",
    category: "google" as const,
    recommendation: "Consider server-side conversion tracking for better data accuracy",
  },

  // Meta/Social
  metaPixel: {
    patterns: ["connect.facebook.net", "facebook.com/tr", "facebook.com/signals"],
    name: "Meta Pixel",
    category: "social" as const,
    recommendation: "Migrate to Conversions API (CAPI) via server-side GTM for GDPR compliance",
  },
  tiktokPixel: {
    patterns: ["analytics.tiktok.com", "tiktok.com/i18n/pixel"],
    name: "TikTok Pixel",
    category: "social" as const,
    recommendation: "Consider TikTok Events API for server-side tracking",
  },
  linkedinInsight: {
    patterns: ["snap.licdn.com", "linkedin.com/px", "linkedin.com/li.lms-analytics"],
    name: "LinkedIn Insight Tag",
    category: "social" as const,
    recommendation: "Use LinkedIn Conversions API for privacy-safe tracking",
  },
  twitterPixel: {
    patterns: ["static.ads-twitter.com", "analytics.twitter.com", "t.co/i/adsct"],
    name: "Twitter/X Pixel",
    category: "social" as const,
    recommendation: "Consider server-side implementation for better privacy",
  },
  pinterestTag: {
    patterns: ["pintrk", "ct.pinterest.com", "pinterest.com/ct"],
    name: "Pinterest Tag",
    category: "social" as const,
    recommendation: null,
  },

  // Consent Platforms
  cookiebot: {
    patterns: ["cookiebot.com", "consent.cookiebot.com"],
    name: "Cookiebot",
    category: "consent" as const,
    recommendation: null,
  },
  onetrust: {
    patterns: ["onetrust.com", "cookielaw.org", "optanon"],
    name: "OneTrust",
    category: "consent" as const,
    recommendation: null,
  },
  iubenda: {
    patterns: ["iubenda.com"],
    name: "Iubenda",
    category: "consent" as const,
    recommendation: null,
  },
  cookieyes: {
    patterns: ["cookieyes.com", "cookie-script.com"],
    name: "CookieYes",
    category: "consent" as const,
    recommendation: null,
  },
  quantcast: {
    patterns: ["quantcast.com", "quantserve.com"],
    name: "Quantcast Choice",
    category: "consent" as const,
    recommendation: null,
  },
  trustarc: {
    patterns: ["trustarc.com", "truste.com"],
    name: "TrustArc",
    category: "consent" as const,
    recommendation: null,
  },

  // Other Analytics
  hotjar: {
    patterns: ["hotjar.com", "static.hotjar.com"],
    name: "Hotjar",
    category: "analytics" as const,
    recommendation: "Ensure session recordings are GDPR compliant with consent",
  },
  clarity: {
    patterns: ["clarity.ms", "claritybt.freshmarketer.com"],
    name: "Microsoft Clarity",
    category: "analytics" as const,
    recommendation: null,
  },
  amplitude: {
    patterns: ["amplitude.com", "cdn.amplitude.com"],
    name: "Amplitude",
    category: "analytics" as const,
    recommendation: null,
  },
  mixpanel: {
    patterns: ["mixpanel.com", "cdn.mxpnl.com"],
    name: "Mixpanel",
    category: "analytics" as const,
    recommendation: null,
  },
  segment: {
    patterns: ["segment.com", "segment.io", "cdn.segment.com"],
    name: "Segment",
    category: "analytics" as const,
    recommendation: null,
  },
  heap: {
    patterns: ["heap.io", "heapanalytics.com"],
    name: "Heap",
    category: "analytics" as const,
    recommendation: null,
  },
  fullstory: {
    patterns: ["fullstory.com", "fullstory.io"],
    name: "FullStory",
    category: "analytics" as const,
    recommendation: "Ensure PII masking is properly configured for GDPR",
  },
  plausible: {
    patterns: ["plausible.io"],
    name: "Plausible Analytics",
    category: "analytics" as const,
    recommendation: null,
  },
  fathom: {
    patterns: ["usefathom.com"],
    name: "Fathom Analytics",
    category: "analytics" as const,
    recommendation: null,
  },
};

// Google domains where /collect endpoints are expected (client-side, not server-side)
const GOOGLE_ANALYTICS_DOMAINS = [
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com',
  'www.googletagmanager.com',
  'region1.google-analytics.com',
  'region2.google-analytics.com',
  'region3.google-analytics.com',
];

// URL patterns that indicate GA4/GTM traffic (could be proxied through server-side GTM)
const SGTM_PROXY_PATTERNS = [
  '/g/collect',   // GA4 measurement protocol
  '/j/collect',   // GA4 alternative endpoint
  '/collect?',    // Universal Analytics
];

/**
 * Detects server-side GTM by looking for GA/GTM traffic
 * going to non-Google domains (first-party proxy)
 */
function detectServerSideGTM(urls: string[]): {
  detected: boolean;
  proxyDomains: string[];
} {
  const proxyDomains = new Set<string>();

  for (const url of urls) {
    // Check if URL matches a GA/GTM collect pattern that could be proxied
    const matchesPattern = SGTM_PROXY_PATTERNS.some(pattern => url.includes(pattern));

    if (matchesPattern) {
      try {
        // Handle URLs that might not have protocol
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        const urlObj = new URL(fullUrl);
        const hostname = urlObj.hostname.toLowerCase();

        // Check if this is NOT a Google domain - if so, it's server-side!
        const isGoogleDomain = GOOGLE_ANALYTICS_DOMAINS.some(
          googleDomain =>
            hostname === googleDomain ||
            hostname.endsWith('.' + googleDomain)
        );

        if (!isGoogleDomain) {
          proxyDomains.add(hostname);
        }
      } catch {
        // Invalid URL, skip
      }
    }
  }

  return {
    detected: proxyDomains.size > 0,
    proxyDomains: Array.from(proxyDomains),
  };
}

function getRating(value: number, thresholds: { good: number; poor: number }): "good" | "needs-improvement" | "poor" {
  if (value <= thresholds.good) return "good";
  if (value <= thresholds.poor) return "needs-improvement";
  return "poor";
}

export async function analyzeWebsite(url: string): Promise<AuditResult> {
  // Normalize URL
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  // Check cache first
  const cached = getCachedResult(normalizedUrl);
  if (cached) {
    return cached;
  }

  // Call PageSpeed Insights API
  const apiUrl = `${PSI_API}?url=${encodeURIComponent(normalizedUrl)}&strategy=mobile&category=performance&category=best-practices${PSI_API_KEY ? `&key=${PSI_API_KEY}` : ""}`;

  const response = await fetch(apiUrl);

  // Handle rate limiting
  if (response.status === 429) {
    throw new RateLimitError();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (errorData?.error?.status === "RESOURCE_EXHAUSTED") {
      throw new RateLimitError();
    }
    throw new Error(`Failed to analyze website: ${response.statusText}`);
  }

  const data = await response.json();

  // Check for quota errors in response
  if (data.error?.code === 429 || data.error?.status === "RESOURCE_EXHAUSTED") {
    throw new RateLimitError();
  }

  // Extract third-party resources from multiple sources
  const thirdPartyAudit = data.lighthouseResult?.audits?.["third-party-summary"];
  const networkRequests = data.lighthouseResult?.audits?.["network-requests"];
  const scriptTreemap = data.lighthouseResult?.audits?.["script-treemap-data"];
  const thirdPartyItems = thirdPartyAudit?.details?.items || [];

  // Collect all URLs and entity names for detection
  const allUrls: string[] = [];
  const entityNames: string[] = [];

  // From third-party summary - entity is the service NAME (e.g., "Google Tag Manager")
  thirdPartyItems.forEach((item: any) => {
    if (item.entity) {
      // entity can be a string or object with text property
      const entityName = typeof item.entity === 'string' ? item.entity : item.entity?.text || '';
      entityNames.push(entityName.toLowerCase());
    }
    // Some items have subItems with URLs
    if (item.subItems?.items) {
      item.subItems.items.forEach((subItem: any) => {
        if (subItem.url) allUrls.push(subItem.url.toLowerCase());
      });
    }
  });

  // From network requests - this has all the actual URLs
  if (networkRequests?.details?.items) {
    networkRequests.details.items.forEach((item: any) => {
      if (item.url) allUrls.push(item.url.toLowerCase());
    });
  }

  // From script treemap data
  if (scriptTreemap?.details?.nodes) {
    scriptTreemap.details.nodes.forEach((node: any) => {
      if (node.name) allUrls.push(node.name.toLowerCase());
    });
  }

  // Special detection for server-side GTM (check for /collect on non-Google domains)
  const sgtmResult = detectServerSideGTM(allUrls);

  // Debug logging (remove in production)
  console.log('PSI Detection Debug:', {
    entityNames: entityNames.slice(0, 10),
    urlCount: allUrls.length,
    sampleUrls: allUrls.slice(0, 10),
    sgtmDetection: sgtmResult,
  });

  // Detect MarTech platforms
  const martech: MarTechDetection[] = [];

  // Entity name mappings for direct matching
  const ENTITY_MAPPINGS: Record<string, string> = {
    "google tag manager": "gtm",
    "google analytics": "ga4",
    "google/doubleclick ads": "googleAds",
    "doubleclick": "googleAds",
    "facebook": "metaPixel",
    "meta": "metaPixel",
    "tiktok": "tiktokPixel",
    "linkedin": "linkedinInsight",
    "twitter": "twitterPixel",
    "pinterest": "pinterestTag",
    "cookiebot": "cookiebot",
    "onetrust": "onetrust",
    "hotjar": "hotjar",
    "microsoft clarity": "clarity",
    "clarity": "clarity",
    "amplitude": "amplitude",
    "mixpanel": "mixpanel",
    "segment": "segment",
    "heap": "heap",
    "fullstory": "fullstory",
  };

  for (const [key, config] of Object.entries(MARTECH_PATTERNS)) {
    let detected = false;
    let details: string | undefined;

    if (key === 'gtmServerSide') {
      // Primary: Check for /collect endpoints on non-Google domains (first-party proxy)
      detected = sgtmResult.detected;
      if (detected) {
        details = `First-party proxy: ${sgtmResult.proxyDomains.join(', ')}`;
      }

      // Fallback: Check subdomain patterns (sgtm., .tagging-server., etc.)
      if (!detected) {
        detected = config.patterns.some((pattern) =>
          allUrls.some((url) => url.includes(pattern.toLowerCase()))
        );
        if (detected) {
          details = 'Detected via subdomain pattern';
        }
      }
    } else {
      // Standard detection for other platforms
      const detectedByUrl = config.patterns.some((pattern) =>
        allUrls.some((url) => url.includes(pattern.toLowerCase()))
      );

      const detectedByEntity = entityNames.some((entity) => {
        const mappedKey = Object.entries(ENTITY_MAPPINGS).find(([name]) =>
          entity.includes(name)
        )?.[1];
        return mappedKey === key || entity.includes(config.name.toLowerCase());
      });

      detected = detectedByUrl || detectedByEntity;
    }

    martech.push({
      name: config.name,
      category: config.category,
      detected,
      details,
      recommendation: detected && config.recommendation ? config.recommendation : undefined,
    });
  }

  // Extract performance metrics
  const performanceScore = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);

  const lcpAudit = data.lighthouseResult?.audits?.["largest-contentful-paint"];
  const fidAudit = data.lighthouseResult?.audits?.["max-potential-fid"];
  const clsAudit = data.lighthouseResult?.audits?.["cumulative-layout-shift"];
  const fcpAudit = data.lighthouseResult?.audits?.["first-contentful-paint"];

  const lcpValue = lcpAudit?.numericValue || 0;
  const fidValue = fidAudit?.numericValue || 0;
  const clsValue = clsAudit?.numericValue || 0;
  const fcpValue = fcpAudit?.numericValue || 0;

  // Generate recommendations
  const recommendations: string[] = [];

  // Check for consent platform
  const hasConsentPlatform = martech.some((m) => m.category === "consent" && m.detected);
  const hasClientSideTracking = martech.some(
    (m) => (m.category === "social" || m.name === "Google Tag Manager") && m.detected
  );
  const hasServerSideGTM = martech.find((m) => m.name === "GTM Server-Side")?.detected;

  if (!hasConsentPlatform && hasClientSideTracking) {
    recommendations.push("No cookie consent platform detected. This is required for GDPR compliance in the EU.");
  }

  if (hasClientSideTracking && !hasServerSideGTM) {
    recommendations.push(
      "Consider implementing GTM Server-Side to improve data accuracy, site performance, and privacy compliance."
    );
  }

  // Add platform-specific recommendations
  martech
    .filter((m) => m.detected && m.recommendation)
    .forEach((m) => {
      if (m.recommendation && !recommendations.includes(m.recommendation)) {
        recommendations.push(m.recommendation);
      }
    });

  // Performance recommendations
  if (performanceScore < 50) {
    recommendations.push("Your performance score is low. Third-party scripts may be impacting load times.");
  }

  if (thirdPartyItems.length > 10) {
    recommendations.push(
      `You have ${thirdPartyItems.length} third-party connections. Consider reducing these for better performance and privacy.`
    );
  }

  const result: AuditResult = {
    url: normalizedUrl,
    timestamp: new Date().toISOString(),
    martech,
    performance: {
      score: performanceScore,
      lcp: {
        value: Math.round(lcpValue),
        rating: getRating(lcpValue, { good: 2500, poor: 4000 }),
      },
      fid: {
        value: Math.round(fidValue),
        rating: getRating(fidValue, { good: 100, poor: 300 }),
      },
      cls: {
        value: Math.round(clsValue * 1000) / 1000,
        rating: getRating(clsValue, { good: 0.1, poor: 0.25 }),
      },
      fcp: {
        value: Math.round(fcpValue),
        rating: getRating(fcpValue, { good: 1800, poor: 3000 }),
      },
    },
    thirdPartyCount: thirdPartyItems.length,
    thirdParties: thirdPartyItems.slice(0, 20).map((item: any) => ({
      name: typeof item.entity === 'string' ? item.entity : item.entity?.text || "Unknown",
      url: item.url || "",
      transferSize: item.transferSize || 0,
    })),
    recommendations,
  };

  // Cache the result
  setCachedResult(normalizedUrl, result);

  return result;
}

export function calculateScores(result: AuditResult) {
  const detected = result.martech.filter((m) => m.detected);

  // Tracking & Analytics Score
  const hasGTM = detected.some((m) => m.name === "Google Tag Manager");
  const hasServerSide = detected.some((m) => m.name === "GTM Server-Side");
  const hasGA4 = detected.some((m) => m.name === "Google Analytics 4");
  const hasSocialPixels = detected.some((m) => m.category === "social");

  let trackingScore = 0;
  if (hasGTM) trackingScore += 3;
  if (hasServerSide) trackingScore += 4;
  if (hasGA4) trackingScore += 2;
  if (hasSocialPixels && hasServerSide) trackingScore += 1;
  trackingScore = Math.min(10, trackingScore);

  // Privacy & Compliance Score
  const hasConsent = detected.some((m) => m.category === "consent");
  let privacyScore = 0;
  if (hasConsent) privacyScore += 5;
  if (hasServerSide) privacyScore += 3;
  if (result.thirdPartyCount <= 5) privacyScore += 2;
  else if (result.thirdPartyCount <= 10) privacyScore += 1;
  privacyScore = Math.min(10, privacyScore);

  return {
    tracking: trackingScore,
    privacy: privacyScore,
    performance: Math.round(result.performance.score / 10),
  };
}
