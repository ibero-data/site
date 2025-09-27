import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

interface ContactFormProps {
  translations: any;
}

export default function ContactForm({ translations }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = translations.contact.nameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = translations.contact.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.message.trim() || formData.message.length < 20) {
      newErrors.message = translations.contact.messageMinLength;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setStatus("loading");

    try {
      const response = await fetch("https://formspree.io/f/myznkjpg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // track error with trk
        // @ts-ignore
        if (window.trk) {
          // @ts-ignore
          window.trk("formError", {
            form: "contact",
            error: response.statusText,
          });
        }
        throw new Error("Failed to send message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
      // @ts-ignore
      if (window.trk) {
        // @ts-ignore
        window.trk("formSent", {
          form: "contact",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");

      // Reset error message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {translations.contact.name}
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={translations.contact.namePlaceholder}
          className={`w-full px-4 py-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border ${
            errors.name
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } focus:outline-none focus:ring-2 focus:ring-ibero-yellow transition-all`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {translations.contact.email}
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder={translations.contact.emailPlaceholder}
          className={`w-full px-4 py-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border ${
            errors.email
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } focus:outline-none focus:ring-2 focus:ring-ibero-yellow transition-all`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {translations.contact.message}
        </label>
        <textarea
          id="message"
          rows={5}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          placeholder={translations.contact.messagePlaceholder}
          className={`w-full px-4 py-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border ${
            errors.message
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } focus:outline-none focus:ring-2 focus:ring-ibero-yellow transition-all resize-none`}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === "loading"}
        className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
          status === "loading"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-ibero-red to-ibero-red/80 hover:shadow-2xl hover:scale-105"
        }`}
      >
        {status === "loading" ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>{translations.contact.sending}</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>{translations.contact.submit}</span>
          </>
        )}
      </button>

      {/* Status Messages */}
      {status === "success" && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700 dark:text-green-400">
            {translations.contact.success}
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700 dark:text-red-400">
            {translations.contact.error}
          </span>
        </div>
      )}
    </form>
  );
}
