import React from "react";
import { Compass, Github, Shield, Globe } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              Project Atlas Knowledge Explorer
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Categorized, lazy-loaded human knowledge discovery engine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <a
            href="/robots.txt"
            target="_blank"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Robots.txt
          </a>
          <a
            href="/sitemap.xml"
            target="_blank"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Sitemap.xml
          </a>
          <a
            href="https://openalex.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            OpenAlex API
          </a>
          <a
            href="https://en.wikipedia.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Wikipedia API
          </a>
        </div>
      </div>
    </footer>
  );
};
