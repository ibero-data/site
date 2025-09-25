import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlowingCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function GlowingCard({ children, className = '', delay = 0 }: GlowingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`relative group ${className}`}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-ibero-red to-ibero-yellow rounded-2xl opacity-0 group-hover:opacity-75 transition duration-500 blur-sm" />

      {/* Card Content */}
      <div className="relative bg-white/10 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 p-8 h-full">
        {children}
      </div>
    </motion.div>
  );
}