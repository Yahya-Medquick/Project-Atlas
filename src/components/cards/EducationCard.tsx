import React, { useState, useEffect } from "react";
import { EducationData, QuizQuestion } from "../../types";
import { GraduationCap, CheckCircle2, XCircle, ExternalLink, HelpCircle, Award, Plus, RefreshCw, Sparkles } from "lucide-react";
import { MultiLevelDefinitionCard } from "../MultiLevelDefinitionCard";

interface EducationCardProps {
  educationData: EducationData;
  topic: string;
}

export const EducationCard: React.FC<EducationCardProps> = ({ educationData, topic }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [quizList, setQuizList] = useState<QuizQuestion[]>(educationData.quizQuestions || []);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [mcqError, setMcqError] = useState<string | null>(null);

  useEffect(() => {
    setQuizList(educationData.quizQuestions || []);
  }, [educationData]);

  const handleSelectOption = (qId: string, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setShowResults((prev) => ({ ...prev, [qId]: true }));
  };

  const handleLoadMoreMcqs = async () => {
    setLoadingMore(true);
    setMcqError(null);
    try {
      const res = await fetch(`/api/mcqs?q=${encodeURIComponent(topic)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.questions && Array.isArray(data.questions)) {
          setQuizList((prev) => [...prev, ...data.questions]);
        }
      } else {
        setMcqError("Failed to load additional MCQs.");
      }
    } catch (err) {
      setMcqError("Network error while generating MCQs.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Multi-Level Study Definition Box (Validated Beginner to Advanced) */}
      <MultiLevelDefinitionCard topic={topic} />

      {/* 2. Interactive Knowledge Quiz & MCQs */}
      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              Interactive Assessment
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {quizList.length} Questions
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Test your understanding of {topic}
            </p>
          </div>

          <button
            onClick={handleLoadMoreMcqs}
            disabled={loadingMore}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>More Questions</span>
              </>
            )}
          </button>
        </div>

        {mcqError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-600 dark:text-rose-300">
            {mcqError}
          </div>
        )}

        <div className="space-y-6">
          {quizList.map((q, qIndex) => {
            const selected = selectedAnswers[q.id];
            const isSubmitted = showResults[q.id];
            const isCorrect = selected === q.answerIndex;

            return (
              <div
                key={q.id ? `${q.id}-${qIndex}` : `mcq-${qIndex}`}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-1.5">
                      Q{qIndex + 1}.
                    </span>
                    {q.question}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    let btnStyle =
                      "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-500";

                    if (isSubmitted) {
                      if (optIdx === q.answerIndex) {
                        btnStyle =
                          "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold";
                      } else if (selected === optIdx) {
                        btnStyle =
                          "bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100 font-bold";
                      }
                    } else if (selected === optIdx) {
                      btnStyle = "bg-indigo-50 dark:bg-indigo-950 border-indigo-600 font-bold";
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isSubmitted && optIdx === q.answerIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        {isSubmitted && selected === optIdx && optIdx !== q.answerIndex && (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation feedback */}
                {isSubmitted && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                      isCorrect
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60"
                    }`}
                  >
                    <Award className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold">
                        {isCorrect ? "Correct! " : "Explanation: "}
                      </span>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Load More Button at bottom of MCQs section */}
        <div className="pt-2 text-center">
          <button
            onClick={handleLoadMoreMcqs}
            disabled={loadingMore}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/80 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 font-semibold text-xs inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 border border-slate-200 dark:border-slate-700"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Generating Similar Questions...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-indigo-500" />
                <span>Load More Similar MCQs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Free University & Online Courses */}
      {educationData.freeCourses && educationData.freeCourses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <span>Open & Free University Courses</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {educationData.freeCourses.map((course, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {course.platform} • {course.level}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {course.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {course.description}
                  </p>
                </div>

                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1 shrink-0 shadow-xs transition-colors"
                >
                  <span>Explore</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
