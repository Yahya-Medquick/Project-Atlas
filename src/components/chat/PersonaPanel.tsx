import React, { useState, useMemo } from 'react';
import {
  PanelRightClose,
  Search,
  Globe,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Download,
  Share2,
  Check,
  ChevronRight,
  UserCheck,
  Compass,
  MessageSquare,
  Tag,
  ArrowRight,
  BookOpen,
  MessageCircle,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { ExpertPersona } from '../../data/experts';
import { usePersonas } from '../../hooks/usePersonas';

interface PersonaPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedPersonaId: string;
  onSelectPersona: (personaId: string, variant: 'global' | 'pk') => void;
  variant: 'global' | 'pk';
  onToggleVariant: (variant: 'global' | 'pk') => void;
  onOpenPwaShortcut: (persona: ExpertPersona) => void;
  suggestedPersonaId?: string;
  onSelectPrompt?: (prompt: string) => void;
  onSelectTopic?: (topic: string) => void;
}

const DOMAIN_CATEGORIES = [
  { id: 'all', label: 'All Fields' },
  { id: 'physics', label: 'Physics & Quantum' },
  { id: 'cs', label: 'CS & Systems' },
  { id: 'ai', label: 'AI & Data Science' },
  { id: 'biology', label: 'Bio & Medicine' },
  { id: 'economics', label: 'Economics & Policy' },
  { id: 'law', label: 'Law & Tech IP' },
];

export const PersonaPanel: React.FC<PersonaPanelProps> = ({
  isOpen,
  onToggle,
  selectedPersonaId,
  onSelectPersona,
  variant,
  onToggleVariant,
  onOpenPwaShortcut,
  suggestedPersonaId,
  onSelectPrompt,
  onSelectTopic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { globalExperts, pkExperts } = usePersonas();
  const activeExpertSet = variant === 'pk' ? pkExperts : globalExperts;
  const personaList = useMemo(() => {
    const map = new Map<string, ExpertPersona>();
    for (const p of Object.values(activeExpertSet)) {
      map.set(p.id || (p as any).slug, p);
    }
    return Array.from(map.values());
  }, [activeExpertSet]);
  const activePersona = activeExpertSet[selectedPersonaId] || personaList[0];

  const filteredPersonas = useMemo(() => {
    return personaList.filter((persona) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCategory = persona.domains.some((d) => {
          if (selectedCategory === 'physics') return d.includes('physics') || d.includes('quantum');
          if (selectedCategory === 'cs') return d.includes('software') || d.includes('system') || d.includes('distributed');
          if (selectedCategory === 'ai') return d.includes('machine learning') || d.includes('ai') || d.includes('data');
          if (selectedCategory === 'biology') return d.includes('biology') || d.includes('health') || d.includes('genetics');
          if (selectedCategory === 'economics') return d.includes('economics') || d.includes('finance') || d.includes('policy');
          if (selectedCategory === 'law') return d.includes('law') || d.includes('ip') || d.includes('legal');
          return true;
        });
        if (!matchesCategory) return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = persona.name.toLowerCase().includes(q);
      const matchRole = persona.role.toLowerCase().includes(q);
      const matchBadge = persona.badge.toLowerCase().includes(q);
      const matchSpecialty = persona.specialties.some((s) => s.toLowerCase().includes(q));
      const matchDomain = persona.domains.some((d) => d.toLowerCase().includes(q));

      return matchName || matchRole || matchBadge || matchSpecialty || matchDomain;
    });
  }, [personaList, selectedCategory, searchQuery]);

  // Dynamic suggested prompts based on active persona's specialties
  const dynamicSuggestedPrompts = useMemo(() => {
    if (!activePersona) return [];
    const specs = activePersona.specialties || [];
    return [
      `Explain the fundamental principles of ${specs[0] || 'this field'} with rigorous proofs and intuitive analogies.`,
      `What are the most common exam traps or misconceptions in ${specs[1] || specs[0] || 'this domain'}?`,
      `How do modern 2026 research breakthroughs connect to ${specs[0] || 'this concept'}?`,
    ];
  }, [activePersona]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      {/* Main Persona Panel */}
      <aside
        className={`fixed lg:static top-0 bottom-0 right-0 z-40 flex flex-col w-[300px] sm:w-[320px] bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:w-0 lg:border-l-0'
        }`}
      >
        {/* Header */}
        <div className="h-14 px-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/70 dark:bg-slate-950/70">
          <div className="flex items-center gap-2 select-none">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Expert Personas
              </h2>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Collapse Persona Panel"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>

        {/* Global vs. Pakistani Region Toggle */}
        <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 shrink-0 space-y-2.5">
          <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => onToggleVariant('global')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                variant === 'global'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Global</span>
            </button>

            <button
              onClick={() => onToggleVariant('pk')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                variant === 'pk'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇵🇰</span>
              <span>Pakistani</span>
            </button>
          </div>

          {/* Search Personas Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter specialists & domains..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {DOMAIN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Container with Active Persona Deep Focus + Persona Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Active Persona Deep Focus & Suggested Inquiries */}
          {activePersona && (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-purple-50/50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-xs"
                    style={{ backgroundColor: activePersona.avatar_color }}
                  >
                    {activePersona.initials}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {activePersona.name} Focus
                  </span>
                </div>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    color: activePersona.avatar_color,
                    borderColor: `${activePersona.avatar_color}40`,
                    backgroundColor: `${activePersona.avatar_color}10`,
                  }}
                >
                  {activePersona.badge}
                </span>
              </div>

              {/* Domains & Focus Chips */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-indigo-500" />
                  <span>Domain Focus</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {activePersona.domains.map((dom, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectTopic && onSelectTopic(dom)}
                      className="text-[9px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 transition-colors cursor-pointer"
                    >
                      {dom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Suggested Prompts */}
              {onSelectPrompt && dynamicSuggestedPrompts.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-indigo-100 dark:border-indigo-900/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-indigo-500" />
                    <span>Suggested Inquiries</span>
                  </span>
                  <div className="space-y-1">
                    {dynamicSuggestedPrompts.map((promptText, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => onSelectPrompt(promptText)}
                        className="w-full text-left p-1.5 rounded-lg bg-white/90 dark:bg-slate-800/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-indigo-100 dark:border-indigo-900 text-[10px] text-slate-700 dark:text-slate-200 font-medium transition-all group/p flex items-start gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <ArrowRight className="w-3 h-3 text-indigo-500 group-hover/p:text-white group-hover/p:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{promptText}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section Divider */}
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1 flex items-center justify-between">
            <span>All Specialists ({filteredPersonas.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Click to switch</span>
          </div>

          {/* Persona Cards List */}
          {filteredPersonas.map((persona) => {
            const isSelected = persona.id === selectedPersonaId;
            const isSuggested = suggestedPersonaId === persona.id;

            return (
              <div
                key={persona.id}
                onClick={() => onSelectPersona(persona.id, variant)}
                className={`relative rounded-xl border p-3 cursor-pointer transition-all duration-150 group/card select-none ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800/95 border-indigo-600 dark:border-indigo-400 shadow-sm ring-1 ring-indigo-500/20'
                    : 'bg-white/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-2xs'
                }`}
              >
                {/* Auto-Match Suggestion Ribbon */}
                {isSuggested && !isSelected && (
                  <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Best Topic Match</span>
                  </div>
                )}

                {/* Persona Header: Avatar, Name, Role */}
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
                    style={{ backgroundColor: persona.avatar_color }}
                  >
                    {persona.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {persona.name}
                      </h3>
                      {isSelected && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                      {persona.role}
                    </p>

                    <p className="text-[10px] text-slate-400 truncate">
                      {persona.affiliation}
                    </p>
                  </div>
                </div>

                {/* Badge Tag */}
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      color: persona.avatar_color,
                      borderColor: `${persona.avatar_color}40`,
                      backgroundColor: `${persona.avatar_color}10`,
                    }}
                  >
                    {persona.badge}
                  </span>

                  {/* PWA Shortcut Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPwaShortcut(persona);
                    }}
                    className="opacity-0 group-hover/card:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-[10px] flex items-center gap-1 font-medium cursor-pointer"
                    title="Add shortcut to desktop / home screen"
                  >
                    <Download className="w-3 h-3" />
                    <span>Shortcut</span>
                  </button>
                </div>

                {/* Specialties tags */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {persona.specialties.slice(0, 3).map((spec, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* WhatsApp Student Support & Mentorship Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/50 border border-emerald-500/30 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {variant === 'pk' ? '🇵🇰 Student WhatsApp Help' : 'WhatsApp Study Desk'}
                  </h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Direct Academic Counselor
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Online
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {variant === 'pk'
                ? 'Get 1-on-1 guidance on Pakistani university admissions (FAST, NUST, LUMS, AKU), syllabus roadblocks, or career roadmaps.'
                : 'Need personalized research advice or study roadmaps? Connect directly with academic mentors on WhatsApp.'}
            </p>

            <button
              onClick={() => {
                const phone = import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER;
                const message = encodeURIComponent('Hi, I am using Bifrost. I want to: [Support / Request a Persona / Institute Registration]');
                const url = `https://wa.me/${phone}?text=${message}`;
                window.open(url, '_blank');
              }}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs group cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-emerald-500/10">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> Mon-Sat (9 AM - 9 PM PKT)
              </span>
              <span className="font-mono text-[9px] text-slate-500">Free Mentorship</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
