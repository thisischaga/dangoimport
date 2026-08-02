import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQAccordion({ items = [] }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-3">
      {items.map((it, idx) => (
        <div key={idx} className="bg-white border rounded-lg overflow-hidden">
          <button aria-expanded={open === idx} onClick={() => setOpen(open === idx ? null : idx)} className="w-full flex items-center justify-between px-4 py-3 text-left">
            <div>
              <div className="font-semibold">{it.q}</div>
              {it.tag && <div className="text-xs text-[#6b7280] mt-1">{it.tag}</div>}
            </div>
            <ChevronDown className={`transition-transform ${open === idx ? 'rotate-180' : ''}`} />
          </button>
          <motion.div initial={{ height: 0, opacity: 0 }} animate={open === idx ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }} transition={{ duration: 0.28 }} className="px-4">
            <div className="py-3 text-sm text-[#374151]">{it.a}</div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
