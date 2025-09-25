import type { FC } from 'react';

interface ServiceCardProps {
  icon: FC<{ className?: string }>;
  title: string;
  description: string;
  delay?: number;
}

export default function ServiceCard({ icon: Icon, title, description, delay = 0 }: ServiceCardProps) {
  return (
    <div
      className="group p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/20"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-6 p-4 bg-gradient-to-br from-ibero-red/10 to-ibero-yellow/10 rounded-xl w-fit group-hover:scale-110 transition-transform">
        <Icon className="w-8 h-8 text-ibero-red" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}