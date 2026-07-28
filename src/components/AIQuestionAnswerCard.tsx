import React, { useState } from "react";
import { Sparkles, Send, HelpCircle, ExternalLink, RefreshCw, CheckCircle2 } from "lucide-react";
import { AIQuestionAnswer } from "../types";

interface AIQuestionAnswerCardProps {
  topic: string;
}

export const AIQuestionAnswerCard: React.FC<AIQuestionAnswerCardProps> = ({ topic }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIQuestionAnswer | null>(null);

  const handleAsk = async (qToAsk?: string) => {
    const q = (qToAsk || question).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/ask?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Unable to synthesize answer at this moment.");
      }
    } catch (err: any) {
      console.warn("AI Q&A error:", err);
      setError("Network request failed. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              AI Synthesizer & Question Answering
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Gemini 2.5 Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Ask natural language questions about {topic}</p>
          </div>
        </div>
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask anything about ${topic} (e.g. How does it work?)...`}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Synthesize</span>
        </button>
      </form>

      {/* Error display */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Answer Output */}
      {result && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in text-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-slate-900 dark:text-white font-bold">"{result.question}"</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Confidence: {result.confidence}%
            </span>
          </div>

          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {result.answer}
          </p>

          {/* Source Citations */}
          {result.sources && result.sources.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px]">
              <span className="font-bold text-slate-500">Verified Sources:</span>
              {result.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-medium"
                >
                  <span>{src.title}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}

          {/* Followup suggestions */}
          {result.relatedFollowups && result.relatedFollowups.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
              {result.relatedFollowups.map((f, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuestion(f);
                    handleAsk(f);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-[10px] text-slate-600 dark:text-slate-300 transition-colors text-left"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
