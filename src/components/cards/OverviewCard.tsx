import React from "react";
import { OverviewData } from "../../types";
import { ExternalLink, Calendar, Users, Cpu, Bookmark, Check } from "lucide-react";

interface OverviewCardProps {
  data: OverviewData;
  onBookmark?: (title: string, category: any, url: string, desc?: string) => void;
  isBookmarked?: boolean;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  data,
  onBookmark,
  isBookmarked = false,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Primary Summary Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                Core Synthesis
              </span>
              {data.wikiUrl && (
                <a
                  href={data.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                >
                  <span>Wikipedia Reference</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
              {data.summary}
            </p>

            {data.wikiExtract && data.wikiExtract !== data.summary && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 italic">
                "{data.wikiExtract}"
              </div>
            )}
          </div>

          {data.wikiThumbnail && (
            <div className="w-full lg:w-48 h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-950">
              <img
                src={data.wikiThumbnail}
                alt={data.topic}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Facts Grid */}
      {data.quickFacts && data.quickFacts.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>Quick Metadata & Key Facts</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.quickFacts.map((fact, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs"
              >
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                  {fact.label}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {fact.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Concepts */}
      {data.coreConcepts && data.coreConcepts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>Core Theoretical Pillars</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.coreConcepts.map((concept, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
              >
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {concept.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {concept.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {concept.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Section */}
      {data.timeline && data.timeline.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Historical Timeline & Evolution</span>
          </h3>
          <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900/60 ml-4 pl-6 space-y-6">
            {data.timeline.map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-950 group-hover:scale-125 transition-transform" />
                <div className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-1">
                  {item.year}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Figures */}
      {data.keyFigures && data.keyFigures.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>Pioneering Figures & Discoverers</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.keyFigures.map((person, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {person.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {person.name}
                  </h4>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                    {person.role}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {person.contribution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
