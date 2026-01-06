import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export default function LanguageSwitcher({
  currentLang = "en",
}: {
  currentLang?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage =
    languages.find((lang) => lang.code === currentLang) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split("/").filter(Boolean);

    // Remove current language code if present
    if (languages.some((lang) => lang.code === pathSegments[0])) {
      pathSegments.shift();
    }

    // Legal pages are English-only - redirect to home when switching languages
    const legalPages = ["legal", "privacy", "cookies", "terms"];
    const isLegalPage = legalPages.some((page) => pathSegments[0] === page);
    if (isLegalPage) {
      window.location.href = langCode === "en" ? "/" : `/${langCode}/`;
      return;
    }

    // Build new path
    const newPath =
      langCode === "en"
        ? `/${pathSegments.join("/")}`
        : `/${langCode}/${pathSegments.join("/")}`;
    window.location.href = newPath || "/";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-all duration-200 text-foreground"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                handleLanguageChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center space-x-3 text-card-foreground ${
                lang.code === currentLang ? "bg-primary/10" : ""
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
