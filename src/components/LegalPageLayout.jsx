import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ShieldCheck,
  ShieldLock,
  FileText,
  Info,
  AlertTriangle,
  Share2,
  Link2,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import Footer from './Footer';

const defaultIcon = BookOpen;

const LegalPageLayout = ({
  title,
  description,
  sections = [],
  icon: Icon = defaultIcon,
  breadcrumbs = [],
  children,
}) => {
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [copyStatus, setCopyStatus] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    if (!sections.length) return;
    const updateState = () => {
      const sectionElements = sections
        .map((section) => document.getElementById(section.id))
        .filter(Boolean);
      const fromTop = window.scrollY + 140;
      let current = sections[0]?.id || '';
      sectionElements.forEach((section) => {
        if (section.offsetTop <= fromTop) current = section.id;
      });
      setActiveId(current);
    };

    updateState();
    window.addEventListener('scroll', updateState, { passive: true });
    return () => window.removeEventListener('scroll', updateState);
  }, [sections]);

  const onNav = (id) => {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900">

      <div className="pt-4" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-[#F68B1E]">
                Accueil
              </Link>
            </li>
            {breadcrumbs?.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <ChevronRight size={14} className="text-slate-400" />
                {item.to ? (
                  <Link to={item.to} className="hover:text-[#F68B1E]">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-700">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[2rem] bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 py-20 px-6 text-center text-white shadow-[0_35px_80px_rgba(15,23,42,0.18)]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400/10 text-emerald-300 shadow-lg">
              <Icon className="h-8 w-8" />
            </div>
            <div className="mt-8 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">{title}</h1>
              {description && <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-emerald-100">{description}</p>}
            </div>
          </motion.section>

          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-28 bg-gray-50 rounded-3xl border border-gray-100 p-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">Sommaire</p>
              <nav className="flex flex-col gap-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onNav(section.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                      activeId === section.id
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <ChevronRight size={10} />
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>

        <div className="lg:hidden">
          <details className="rounded-3xl border border-gray-100 bg-white">
            <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-gray-900">Sommaire</summary>
            <div className="space-y-1 border-t border-gray-100 px-5 py-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onNav(section.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
                    activeId === section.id ? 'bg-emerald-50 text-gray-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{section.title}</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              ))}
            </div>
          </details>
        </div>

        <div id="legal-content" className="mt-10 space-y-10">
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>
                  {section.subtitle && <p className="mt-2 text-sm text-slate-500">{section.subtitle}</p>}
                </div>
                </div>
              <div className="mt-4 text-base leading-8 text-slate-700">
                {section.html ? (
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                ) : (
                  section.content.split('\n').map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <p key={idx} className="mt-4" />;
                    if (trimmed.startsWith('•')) {
                      return (
                        <p key={idx} className="mt-3 flex gap-3 text-slate-700">
                          <span className="mt-1 text-lg text-[#F68B1E]">•</span>
                          <span>{trimmed.slice(1).trim()}</span>
                        </p>
                      );
                    }
                    return <p key={idx} className="mt-4">{trimmed}</p>;
                  })
                )}
              </div>
            </motion.section>
          ))}

          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default React.memo(LegalPageLayout);
