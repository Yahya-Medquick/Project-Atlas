import React, { useState } from "react";
import { EducationData, QuizQuestion } from "../../types";
import { GraduationCap, CheckCircle2, XCircle, ExternalLink, HelpCircle, ArrowRight, Award } from "lucide-react";

interface EducationCardProps {
  educationData: EducationData;
}

export const EducationCard: React.FC<EducationCardProps> = ({ educationData }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  const handleSelectOption = (qId: string, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setShowResults((prev) => ({ ...prev, [qId]: true }));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* 1. Learning Path Roadmap */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Curated Learning Roadmap
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {educationData.learningPath.map((step) => (
            <div
              key={step.step}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                  0{step.step}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {step.difficulty}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {step.title}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.summary}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Key Concepts:
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-2">
                  {step.keyTakeaways.map((takeaway, tIdx) => (
                    <li key={tIdx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Interactive Knowledge Quiz */}
      {educationData.quizQuestions && educationData.quizQuestions.length > 0 && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive Concept Check & Quiz
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Test your understanding
            </span>
          </div>

          <div className="space-y-6">
            {educationData.quizQuestions.map((q) => {
              const selected = selectedAnswers[q.id];
              const isSubmitted = showResults[q.id];
              const isCorrect = selected === q.answerIndex;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-4"
                >
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">
                    {q.question}
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
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
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
        </div>
      )}

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
