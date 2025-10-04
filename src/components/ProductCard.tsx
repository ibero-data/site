import { motion } from 'framer-motion';
import { ArrowUpRight, Github, Globe, Star, GitFork, Code2, Sparkles } from 'lucide-react';

interface ProductCardProps {
  title: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  githubUrl: string;
  features: string[];
  techStack: string[];
  primaryColor: string;
  secondaryColor: string;
  delay?: number;
  stats?: {
    stars?: number;
    forks?: number;
  };
}

export default function ProductCard({
  title,
  description,
  logoUrl,
  websiteUrl,
  githubUrl,
  features,
  techStack,
  primaryColor,
  secondaryColor,
  delay = 0,
  stats
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="group relative h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl blur-2xl"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
        }}
      />

      <div className="relative h-full bg-white/10 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 overflow-hidden transition-all duration-500 group-hover:border-white/40 dark:group-hover:border-gray-600/50 group-hover:shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-60"
          style={{
            background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
          }}
        />

        <div className="p-8 flex flex-col h-full">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg"
                style={{
                  boxShadow: `0 4px 20px ${primaryColor}30`
                }}
              >
                <img
                  src={logoUrl}
                  alt={`${title} logo`}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {title}
                  <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r text-white font-semibold"
                    style={{
                      background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
                    }}
                  >
                    OPEN SOURCE
                  </span>
                </h3>
                {stats && (
                  <div className="flex items-center gap-3 mt-1">
                    {stats.stars && (
                      <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Star className="w-3 h-3" />
                        {stats.stars}
                      </span>
                    )}
                    {stats.forks && (
                      <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <GitFork className="w-3 h-3" />
                        {stats.forks}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed flex-grow">
            {description}
          </p>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              KEY FEATURES
            </h4>
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay + 0.1 * index }}
                  viewport={{ once: true }}
                  className="px-3 py-1.5 bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 border border-white/30 dark:border-gray-700/50"
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              TECH STACK
            </h4>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-gradient-to-r text-white text-xs font-semibold rounded-lg shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}90, ${secondaryColor}90)`
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-auto pt-4 border-t border-white/10 dark:border-gray-800">
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
              }}
            >
              <Globe className="w-4 h-4" />
              Visit Website
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-gray-900 dark:bg-gray-800 text-white border border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}