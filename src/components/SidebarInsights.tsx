import React from "react";
import { Sparkles, Activity, ShieldCheck, Zap, ArrowUpRight, Network } from "lucide-react";
import { Entity } from "../types";

interface SidebarInsightsProps {
  entity?: Entity | null;
  query: string;
  matchedAlias?: string | null;
  rankingScore?: number;
  synonymsConnected?: string[];
  onSelectSynonym: (synonym: string) => void;
}

export const SidebarInsights: React.FC<SidebarInsightsProps> = ({
  entity,
  query,
  matchedAlias,
  rankingScore = 95,
  synonymsConnected = [],
  onSelectSynonym,
}) => {
  if (!entity && !query) return null;

  const displayTitle = entity ? entity.title : query;
  const popularity = entity?.popularityScore || 92;
  const freshness = entity?.freshnessScore || 96;
  const authority = entity?.authorityScore || 98;
  const aliases = entity?.aliases || synonymsConnected || ["gravitation", "Newton", "General Relativity", "black holes"];

  return (
    <aside className="w-full lg:w-80 space-y-4 shrink-0">
      
      {/* Entity Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Lightweight Entity
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
            Rank Score: {rankingScore}/100
          </span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize tracking-tight">
            {displayTitle}
          </h3>
          {matchedAlias && (
            <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
              <span>Synonym connection:</span>
              <span className="underline font-bold">"{matchedAlias}"</span>
            </div>
          )}
        </div>

        {entity?.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {entity.description}
          </p>
        )}

        {/* Multi-Factor Ranking Scores */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Popularity Metric
            </span>
            <span className="font-bold text-slate-900 dark:text-white">{popularity}/100</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Academic Authority
            </span>
            <span className="font-bold text-slate-900 dark:text-white">{authority}/100</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> Freshness Index
            </span>
            <span className="font-bold text-slate-900 dark:text-white">{freshness}%</span>
          </div>
        </div>
      </div>

      {/* Connected Synonyms & Semantic Connections */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
          <span className="flex items-center gap-1.5">
            <Network className="w-4 h-4 text-indigo-500" /> Connected Synonyms
          </span>
          <span className="text-[10px] text-slate-400 font-normal">Click to resolve</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {aliases.map((alias, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSynonym(alias)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/80 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center gap-1 group"
            >
              <span>{alias}</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Project Atlas Node Status Card */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs space-y-2">
        <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Multi-Source Live Verification
        </div>
        <p className="text-indigo-900/80 dark:text-indigo-300/80 text-[11px] leading-relaxed">
          OpenAlex peer-reviewed paper indexes, Wikipedia REST endpoints, and Google Gemini AI models are active.
        </p>
      </div>

    </aside>
  );
};
