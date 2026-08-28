import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCw,
  FileText,
  Check,
  ChevronRight,
  ChevronLeft,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useNotes } from '../../hooks/useNotes';

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface MCQCardProps {
  topic: string;
  onSaveToNotes?: (content: string, title?: string) => void;
  onClose?: () => void;
}

export const MCQCard: React.FC<MCQCardProps> = ({ topic, onSaveToNotes, onClose }) => {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [savedToNotesMap, setSavedToNotesMap] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState<{ correct: number; totalAnswered: number }>({ correct: 0, totalAnswered: 0 });

  const { addNote } = useNotes();

  const fetchMCQs = async (isNewBatch = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mcqs?topic=${encodeURIComponent(topic)}`);
      if (!res.ok) {
        throw new Error('Failed to generate MCQs');
      }
      const data = await res.json();
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        if (isNewBatch) {
          setQuestions((prev) => [...prev, ...data.questions]);
          setCurrentIndex(questions.length);
        } else {
          setQuestions(data.questions);
          setCurrentIndex(0);
          setSelectedAnswers({});
          setShowExplanation({});
          setScore({ correct: 0, totalAnswered: 0 });
        }
      } else {
        throw new Error('No questions returned');
      }
    } catch (err: any) {
      console.warn('MCQ generation error:', err);
      setError(err?.message || 'Unable to generate questions at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (topic) {
      fetchMCQs(false);
    }
  }, [topic]);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (selectedAnswers[questionIdx] !== undefined) return; // already answered

    const currentQ = questions[questionIdx];
    const isCorrect = optionIdx === currentQ.answerIndex;

    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
    setShowExplanation((prev) => ({ ...prev, [questionIdx]: true }));

    setScore((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      totalAnswered: prev.totalAnswered + 1,
    }));
  };

  const handleSaveQuestionToNotes = async (qIdx: number) => {
    const q = questions[qIdx];
    if (!q) return;

    const noteTitle = `MCQ: ${topic} - Question ${qIdx + 1}`;
    const correctLetter = ['A', 'B', 'C', 'D'][q.answerIndex] || `Option ${q.answerIndex + 1}`;
    const noteContent = `### Topic: ${topic}\n\n**Question:**\n${q.question}\n\n**Options:**\n${q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}\n\n**Correct Answer:** ${correctLetter} (${q.options[q.answerIndex]})\n\n**Explanation:**\n${q.explanation}`;

    try {
      if (onSaveToNotes) {
        onSaveToNotes(noteContent, noteTitle);
      } else {
        await addNote(noteTitle, noteContent, 'Exam Prep');
      }
      setSavedToNotesMap((prev) => ({ ...prev, [qIdx]: true }));
      setTimeout(() => {
        setSavedToNotesMap((prev) => ({ ...prev, [qIdx]: false }));
      }, 3000);
    } catch (e) {
      console.warn('Failed to save MCQ note:', e);
    }
  };

  const currentQ = questions[currentIndex];
  const isAnswered = currentQ && selectedAnswers[currentIndex] !== undefined;
  const selectedOpt = currentQ ? selectedAnswers[currentIndex] : undefined;

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Interactive Quiz & MCQs</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                {topic}
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Diagnostic conceptual checks & board-aligned testing
            </p>
          </div>
        </div>

        {/* Score & Controls */}
        <div className="flex items-center gap-2">
          {score.totalAnswered > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              <Award className="w-3.5 h-3.5" />
              <span>
                Score: {score.correct}/{score.totalAnswered} ({Math.round((score.correct / score.totalAnswered) * 100)}%)
              </span>
            </div>
          )}

          <button
            onClick={() => fetchMCQs(false)}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Regenerate MCQs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline text-[11px]">Refresh</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {isLoading && questions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Generating exam-grade MCQs for &ldquo;{topic}&rdquo;...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-2 text-center">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => fetchMCQs(false)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : currentQ ? (
          <div className="space-y-4">
            {/* Question Counter & Meta */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveQuestionToNotes(currentIndex)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Save this question & explanation to notes"
                >
                  {savedToNotesMap[currentIndex] ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Saved!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3" />
                      <span>Save to Notes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
              <MarkdownRenderer content={currentQ.question} />
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedOpt === optIdx;
                const isCorrect = optIdx === currentQ.answerIndex;
                const optionLetter = String.fromCharCode(65 + optIdx);

                let optClass = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700';

                if (isAnswered) {
                  if (isCorrect) {
                    optClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500';
                  } else {
                    optClass = 'border-slate-200 dark:border-slate-800 opacity-60 text-slate-500 dark:text-slate-400';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentIndex, optIdx)}
                    disabled={isAnswered}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${optClass}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isAnswered && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isSelected && !isCorrect
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {optionLetter}
                    </span>

                    <div className="flex-1 min-w-0 pt-0.5 leading-relaxed">
                      <MarkdownRenderer content={option} />
                    </div>

                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Drawer */}
            {isAnswered && showExplanation[currentIndex] && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide text-[10px]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Explanation & Diagnostic Breakdown</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <MarkdownRenderer content={currentQ.explanation} />
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => fetchMCQs(true)}
                    disabled={isLoading}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate More MCQs</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
