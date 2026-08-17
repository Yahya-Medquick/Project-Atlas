import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowLeft,
  Send,
  User,
  GraduationCap,
  MessageSquare,
  AlertCircle,
  RotateCcw,
  BookOpen,
  Plus,
  Check,
  X
} from "lucide-react";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { useNotes } from "../../hooks/useNotes";
import { useUser } from "../../context/UserContext";
import { getAuthHeaders } from "../../services/api";

export interface ChatSession {
  id: string;
  personaId: string;
  personaName: string;
  personaEmoji: string;
  messages: { role: "user" | "assistant"; content: string }[];
  createdAt: string;
  label: string;
}

interface Persona {
  id: string;
  name: string;
  avatar_emoji: string;
  subject_tag: string;
  system_prompt: string;
  is_active: boolean;
  created_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CounselingCardProps {
  defaultPersonaId?: string;
  onClearDefaultPersona?: () => void;
}

function getDeviceId(): string {
  let deviceId = localStorage.getItem("bifrost_device_id");
  if (!deviceId) {
    deviceId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "dev-" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("bifrost_device_id", deviceId);
  }
  return deviceId;
}

function getStorageKey(userId?: string | null): string {
  return userId ? `bifrost_counsel_sessions_${userId}` : `bifrost_counsel_sessions_guest_${getDeviceId()}`;
}

export const CounselingCard: React.FC<CounselingCardProps> = ({ defaultPersonaId, onClearDefaultPersona }) => {
  const { user } = useUser();
  const { addNote } = useNotes();
  const [addedMap, setAddedMap] = useState<Record<string | number, boolean>>({});

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPersonas, setFetchingPersonas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage matching current user's key
  useEffect(() => {
    const key = getStorageKey(user?.id);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed: ChatSession[] = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0 && !activeSessionId) {
          // Keep current active or set to latest
        }
      } catch (e) {
        console.error("Failed to parse counseling sessions from storage:", e);
        setSessions([]);
      }
    } else {
      setSessions([]);
    }
  }, [user?.id]);

  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    const key = getStorageKey(user?.id);
    localStorage.setItem(key, JSON.stringify(updatedSessions));
  };

  const triggerToast = (msg: string) => {
    const toast = document.createElement("div");
    toast.className = "fixed bottom-24 right-6 z-50 bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 shadow-xl flex items-center gap-1.5 font-medium animate-fade-in";
    toast.innerHTML = `<span>✓</span> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.5s ease";
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  };

  const handleAddNote = async (key: string | number, title: string, content: string) => {
    try {
      const activePersona = personas.find((p) => p.id === activeSession?.personaId);
      await addNote(title, content, activePersona?.subject_tag || "Counseling");
      setAddedMap((prev) => ({ ...prev, [key]: true }));
      triggerToast("Added to Notes ✓");
      setTimeout(() => setAddedMap((prev) => ({ ...prev, [key]: false })), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all active personas
  useEffect(() => {
    fetchPersonas();
  }, []);

  // Handle pre-selected default persona ID
  useEffect(() => {
    if (defaultPersonaId && personas.length > 0) {
      const match = personas.find((p) => p.id === defaultPersonaId);
      if (match) {
        handleSelectPersona(match);
      }
    }
  }, [defaultPersonaId, personas]);

  const fetchPersonas = async () => {
    setFetchingPersonas(true);
    setError(null);
    try {
      const response = await fetch("/api/personas");
      if (!response.ok) {
        throw new Error("Failed to retrieve counselor personas.");
      }
      const data = await response.json();
      setPersonas(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading counselor personas.");
    } finally {
      setFetchingPersonas(false);
    }
  };

  // Derive a short description from the system prompt first sentence
  const extractFirstSentence = (prompt: string) => {
    if (!prompt) return "";
    const index = prompt.indexOf(".");
    if (index === -1) return prompt;
    return prompt.substring(0, index + 1).trim();
  };

  // Start or create a new session from a persona
  const handleSelectPersona = (persona: Persona) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const label = `${persona.subject_tag || persona.name} • ${timeStr}`;

    const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "session-" + Date.now();
    const newSession: ChatSession = {
      id: newId,
      personaId: persona.id,
      personaName: persona.name,
      personaEmoji: persona.avatar_emoji || "🎓",
      messages: [
        {
          role: "assistant",
          content: `Assalam-o-Alaikum! I am your **${persona.name}**. ${extractFirstSentence(persona.system_prompt)} How can I help you in your Matric/FSc journey today?`
        }
      ],
      createdAt: now.toISOString(),
      label
    };

    const nextSessions = [newSession, ...sessions];
    setSessions(nextSessions);
    setActiveSessionId(newSession.id);
    saveSessionsToStorage(nextSessions);
    setError(null);
    onClearDefaultPersona?.();
  };

  const handleCloseSession = (sessionId: string) => {
    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);
    saveSessionsToStorage(remaining);

    if (activeSessionId === sessionId) {
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const activePersona = personas.find((p) => p.id === activeSession?.personaId) || null;

  // Auto-scroll chat history
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeSession) {
      scrollToBottom();
    }
  }, [activeSession?.messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeSession || loading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    const updatedMessages: Message[] = [...activeSession.messages, { role: "user", content: userMessage }];

    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id ? { ...s, messages: updatedMessages } : s
    );
    setSessions(updatedSessions);
    saveSessionsToStorage(updatedSessions);
    setLoading(true);

    try {
      const response = await fetch("/api/counsel", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          personaId: activeSession.personaId,
          messages: updatedMessages
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to retrieve counseling response.");
      }

      const data = await response.json();
      const finalMessages: Message[] = [...updatedMessages, { role: "assistant", content: data.reply }];

      setSessions((prev) => {
        const next = prev.map((s) =>
          s.id === activeSession.id ? { ...s, messages: finalMessages } : s
        );
        saveSessionsToStorage(next);
        return next;
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      
      {/* =======================================
          SESSION TABS BAR (Always visible if sessions exist)
          ======================================= */}
      {sessions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`group/tab inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <span className="text-sm select-none">{s.personaEmoji}</span>
                <span className="max-w-[130px] truncate">{s.label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseSession(s.id);
                  }}
                  className={`p-0.5 rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? "text-indigo-200 hover:text-white hover:bg-indigo-700"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                  }`}
                  title="Close Chat"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setActiveSessionId(null);
              onClearDefaultPersona?.();
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border border-dashed ${
              activeSessionId === null
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800 font-bold"
                : "text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white hover:border-slate-400"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      )}

      {/* =======================================
          VIEW 1: PERSONA SELECTION LIST (when no active session or "New Chat")
          ======================================= */}
      {!activeSession && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Expert Academic Counseling
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chat with specialized AI mentors optimized for Pakistani curricula, career paths, admissions, and exam prep.
              </p>
            </div>
          </div>

          {fetchingPersonas ? (
            <div className="py-12 text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
              <p className="text-xs text-slate-400">Loading counselor personas...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 flex gap-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to Load Counselors</p>
                <p className="mt-0.5">{error}</p>
                <button
                  onClick={fetchPersonas}
                  className="mt-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  Retry Loading
                </button>
              </div>
            </div>
          ) : personas.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
              <p className="text-xs text-slate-400">No active counselor personas are currently registered.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  onClick={() => handleSelectPersona(persona)}
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all cursor-pointer flex gap-4 hover:shadow-xs group"
                >
                  <div className="text-4xl shrink-0 select-none bg-slate-50 dark:bg-slate-950/40 w-14 h-14 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform">
                    {persona.avatar_emoji || "👤"}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {persona.name}
                      </h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 uppercase tracking-wide border border-indigo-100/30 dark:border-indigo-900/30">
                        {persona.subject_tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {extractFirstSentence(persona.system_prompt)}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Begin Counseling Session</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =======================================
          VIEW 2: ACTIVE CHAT SESSION INTERFACE
          ======================================= */}
      {activeSession && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl overflow-hidden flex flex-col h-[550px] shadow-sm">
          
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveSessionId(null);
                  onClearDefaultPersona?.();
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="View All Counselors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="text-2xl select-none">{activeSession.personaEmoji}</div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {activeSession.personaName}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  {activeSession.label}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveSessionId(null);
                onClearDefaultPersona?.();
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[10px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>New Session</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 bg-slate-50/20 dark:bg-slate-950/20">
            {activeSession.messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  {/* Bubble Avatar icon */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border select-none text-xs font-medium ${
                    isUser
                      ? "bg-slate-900 border-slate-800 text-white dark:bg-slate-100 dark:border-white dark:text-slate-900"
                      : "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-400"
                  }`}>
                    {isUser ? <User className="w-3.5 h-3.5" /> : activeSession.personaEmoji}
                  </div>

                  {/* Message Box */}
                  <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed group/msg ${
                    isUser
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-tr-none"
                      : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-2xs"
                  }`}>
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    ) : (
                      <div className="space-y-2">
                        <MarkdownRenderer content={msg.content} className="text-xs" />
                        <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150">
                          <button
                            type="button"
                            onClick={() => handleAddNote(index, `Counseling: ${activeSession.personaName}`, msg.content)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            {addedMap[index] ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Plus className="w-2.5 h-2.5" />}
                            <span>{addedMap[index] ? "Saved" : "Save this response"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Generation Loader bubble */}
            {loading && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-xs text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-400">
                  {activeSession.personaEmoji}
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-2xs flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex gap-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Send message to ${activeSession.personaName}...`}
              disabled={loading}
              className="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 flex items-center justify-center cursor-pointer transition-all disabled:opacity-40 shrink-0 shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
