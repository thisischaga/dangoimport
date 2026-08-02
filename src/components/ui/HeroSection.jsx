import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection({ title, subtitle, children, icon, className }) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`bg-white py-8 ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {icon && <div className="shrink-0">{icon}</div>}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-[#6b7280] max-w-2xl">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </motion.section>
  );
}
