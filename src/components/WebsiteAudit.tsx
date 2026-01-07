import { useState } from "react";
import {
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Shield,
  Zap,
  Lightbulb,
  Mail,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  X,
  Send,
} from "lucide-react";
import { analyzeWebsite, calculateScores, RateLimitError, type AuditResult } from "../lib/psi-analyzer";
import { downloadAuditPDF } from "../lib/pdf-generator";

function ScoreCircle({ score, max = 10, label }: { score: number; max?: number; label: string }) {
  const percentage = (score / max) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={getColor()}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${getColor()}`}>
            {score}/{max}
          </span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground mt-2">{label}</span>
    </div>
  );
}

function DetectionItem({
  name,
  detected,
  recommendation,
}: {
  name: string;
  detected: boolean;
  recommendation?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      {detected ? (
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
      )}
      <div>
        <span className={detected ? "text-foreground" : "text-muted-foreground/60"}>{name}</span>
        {detected && recommendation && (
          <p className="text-xs text-yellow-600 mt-0.5 flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            {recommendation}
          </p>
        )}
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  unit,
  rating,
}: {
  label: string;
  value: number | string;
  unit: string;
  rating: "good" | "needs-improvement" | "poor";
}) {
  const colors = {
    good: "text-green-500",
    "needs-improvement": "text-yellow-500",
    poor: "text-red-500",
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${colors[rating]}`}>
        {value}
        {unit}
      </span>
    </div>
  );
}

function CategorySection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

export default function WebsiteAudit() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setIsRateLimited(false);
    setResult(null);

    try {
      const auditResult = await analyzeWebsite(url);
      setResult(auditResult);
    } catch (err) {
      if (err instanceof RateLimitError) {
        setIsRateLimited(true);
      } else {
        setError(err instanceof Error ? err.message : "Failed to analyze website. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !result) return;

    setEmailSending(true);
    setEmailError(null);

    try {
      // For now, download PDF and open mailto
      // In production, this would call a serverless function
      downloadAuditPDF(result);

      // Open mailto with pre-filled subject
      const subject = encodeURIComponent(`MarTech Audit Report - ${new URL(result.url).hostname}`);
      const body = encodeURIComponent(
        `Hi,\n\nPlease find attached my MarTech audit report for ${result.url}.\n\nI'd like to discuss the recommendations with your team.\n\nBest regards`
      );
      window.open(`mailto:info@iberodata.es?subject=${subject}&body=${body}`, "_blank");

      setEmailSent(true);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSent(false);
        setEmail("");
      }, 2000);
    } catch (err) {
      setEmailError("Failed to send email. Please try again.");
    } finally {
      setEmailSending(false);
    }
  };

  const scores = result ? calculateScores(result) : null;

  const googleStack = result?.martech.filter((m) => m.category === "google") || [];
  const socialStack = result?.martech.filter((m) => m.category === "social") || [];
  const consentStack = result?.martech.filter((m) => m.category === "consent") || [];
  const analyticsStack = result?.martech.filter((m) => m.category === "analytics") || [];

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your website URL (e.g., example.com)"
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-8 py-4 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Analyze
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Rate Limit State */}
      {isRateLimited && (
        <div className="max-w-2xl mx-auto p-6 bg-card border border-border rounded-2xl text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            High Demand Right Now
          </h3>
          <p className="text-muted-foreground mb-6">
            Our free audit tool is experiencing high traffic. The API quota has been temporarily exceeded.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You can try again in a few minutes, or get a comprehensive manual audit from our team:
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Request Manual Audit
            </a>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-2xl mx-auto text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Analyzing your website... This may take 15-30 seconds.
          </p>
        </div>
      )}

      {/* Results */}
      {result && scores && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* URL Badge */}
          <div className="text-center">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {result.url}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Score Overview */}
          <div className="bg-card rounded-2xl border border-border p-8">
            <h2 className="text-xl font-semibold text-foreground text-center mb-8">
              Your MarTech Health Score
            </h2>
            <div className="flex justify-center gap-12 flex-wrap">
              <ScoreCircle score={scores.tracking} label="Tracking Setup" />
              <ScoreCircle score={scores.privacy} label="Privacy & Compliance" />
              <ScoreCircle score={scores.performance} label="Performance" />
            </div>
          </div>

          {/* Detection Results */}
          <div className="grid md:grid-cols-2 gap-6">
            <CategorySection title="Google Stack" icon={BarChart3}>
              {googleStack.map((item) => (
                <DetectionItem
                  key={item.name}
                  name={item.name}
                  detected={item.detected}
                  recommendation={item.recommendation}
                />
              ))}
            </CategorySection>

            <CategorySection title="Social & Advertising" icon={BarChart3}>
              {socialStack.map((item) => (
                <DetectionItem
                  key={item.name}
                  name={item.name}
                  detected={item.detected}
                  recommendation={item.recommendation}
                />
              ))}
            </CategorySection>

            <CategorySection title="Consent Management" icon={Shield}>
              {consentStack.map((item) => (
                <DetectionItem
                  key={item.name}
                  name={item.name}
                  detected={item.detected}
                  recommendation={item.recommendation}
                />
              ))}
              {!consentStack.some((m) => m.detected) && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mt-3">
                  <p className="text-sm text-red-500 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    No consent management platform detected. This is required for GDPR compliance.
                  </p>
                </div>
              )}
            </CategorySection>

            <CategorySection title="Analytics & UX Tools" icon={BarChart3}>
              {analyticsStack.map((item) => (
                <DetectionItem
                  key={item.name}
                  name={item.name}
                  detected={item.detected}
                  recommendation={item.recommendation}
                />
              ))}
            </CategorySection>
          </div>

          {/* Performance Metrics */}
          <CategorySection title="Core Web Vitals" icon={Zap}>
            <div className="grid sm:grid-cols-2 gap-x-8">
              <MetricItem
                label="Largest Contentful Paint (LCP)"
                value={(result.performance.lcp.value / 1000).toFixed(1)}
                unit="s"
                rating={result.performance.lcp.rating}
              />
              <MetricItem
                label="First Contentful Paint (FCP)"
                value={(result.performance.fcp.value / 1000).toFixed(1)}
                unit="s"
                rating={result.performance.fcp.rating}
              />
              <MetricItem
                label="Max Potential FID"
                value={result.performance.fid.value}
                unit="ms"
                rating={result.performance.fid.rating}
              />
              <MetricItem
                label="Cumulative Layout Shift (CLS)"
                value={result.performance.cls.value}
                unit=""
                rating={result.performance.cls.rating}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Third-party scripts detected: <strong>{result.thirdPartyCount}</strong>
            </p>
          </CategorySection>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <CategorySection title="Recommendations" icon={Lightbulb}>
              <ul className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                    </div>
                    <span className="text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </CategorySection>
          )}

          {/* Download & Share */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
              Save Your Report
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => downloadAuditPDF(result)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-muted border border-border text-foreground font-semibold rounded-xl transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email Report
              </button>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Need help implementing these recommendations?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              We specialize in GTM Server-Side, GDPR compliance, and MarTech optimization. Let's talk
              about how we can improve your tracking setup.
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Talk to an Expert
            </a>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowEmailModal(false);
                setEmailSent(false);
                setEmailError(null);
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {emailSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">PDF Downloaded!</h3>
                <p className="text-muted-foreground">
                  Your email client should open. Attach the downloaded PDF and send!
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Email Your Report
                </h3>
                <p className="text-muted-foreground mb-6">
                  Enter your email and we'll prepare the report for you to send.
                </p>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>

                  {emailError && (
                    <p className="text-sm text-red-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {emailError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={emailSending || !email.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-semibold rounded-xl transition-colors"
                  >
                    {emailSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Download & Email
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  The PDF will download and your email client will open with a pre-filled message.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
