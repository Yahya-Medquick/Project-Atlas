import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles,
  Send,
  User,
  GraduationCap,
  AlertCircle,
  RotateCcw,
  BookOpen,
  Plus,
  Check,
  X,
  Brain,
  ChevronDown,
  RefreshCw,
  MessageSquare,
  Share2,
  BookmarkPlus,
  ExternalLink
} from "lucide-react";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { useNotes } from "../../hooks/useNotes";
import { useUser } from "../../context/UserContext";
import { getAuthHeaders } from "../../services/api";

export interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  field: string;
  bio: string;
  initialGreeting: string;
  topics: string[];
  suggestedQuestions: string[];
}

export const EXPERTS: Record<string, ExpertProfile> = {
  quantum: {
    id: "quantum",
    name: "Dr. Aris Thorne",
    title: "Quantum Information Theorist",
    avatar: "🔬",
    field: "Quantum Physics & Computing",
    bio: "Specializing in quantum entanglement, decoherence, and qubit architectures. Postdoctoral fellow at Perimeter Institute.",
    initialGreeting: "Hello. I research quantum information theory and decoherence dynamics. What questions do you have about quantum systems, superposition, or circuit complexity?",
    topics: ["quantum", "qubit", "superposition", "entanglement", "schrodinger", "quantum computing", "quantum mechanics", "teleportation", "qubits"],
    suggestedQuestions: [
      "Explain quantum decoherence and why error correction is difficult",
      "What is the mathematical threshold for quantum advantage?",
      "How does entanglement violate Bell inequalities?"
    ]
  },
  ai: {
    id: "ai",
    name: "Dr. Elena Rostova",
    title: "AI & Cognitive Systems Researcher",
    avatar: "🤖",
    field: "Artificial Intelligence & ML",
    bio: "Focuses on transformer architectures, sparse attention mechanisms, and interpretability in large neural models.",
    initialGreeting: "Welcome. I work on deep learning architectures and neural interpretability. What would you like to explore regarding machine learning, attention heads, or model alignment?",
    topics: ["ai", "machine learning", "neural", "deep learning", "transformer", "llm", "gpt", "nlp", "reinforcement learning", "artificial intelligence", "vision"],
    suggestedQuestions: [
      "How do sparse flash-attention mechanisms scale with context length?",
      "Explain the mechanics of mechanistic interpretability in LLMs",
      "What are the primary theoretical failure modes of RLHF?"
    ]
  },
  physics: {
    id: "physics",
    name: "Prof. Marcus Vance",
    title: "Theoretical Physicist",
    avatar: "⚡",
    field: "High-Energy & Particle Physics",
    bio: "Investigating standard model extensions, gauge theories, and string compactifications at CERN and Oxford.",
    initialGreeting: "Greetings. My research covers quantum field theory and high-energy physics. How can I assist your theoretical investigation into spacetime, particles, or gravity?",
    topics: ["physics", "gravity", "relativity", "particle", "higgs", "thermodynamics", "electromagnetism", "spacetime", "standard model", "string theory", "black hole", "cosmology"],
    suggestedQuestions: [
      "How does holographic duality reconcile information loss in black holes?",
      "What are the mathematical hurdles in non-Abelian gauge quantization?",
      "Explain the hierarchy problem and supersymmetry candidates"
    ]
  },
  biology: {
    id: "biology",
    name: "Dr. Mei-Ling Chen",
    title: "Computational Biologist",
    avatar: "🧬",
    field: "Genomics & Molecular Systems",
    bio: "Applying statistical models and ML to CRISPR gene editing, protein folding prediction, and epigenetic networks.",
    initialGreeting: "Hello! I study molecular systems, genomic sequences, and structural biology. What biological mechanisms or genomic questions are you analyzing today?",
    topics: ["biology", "gene", "dna", "crispr", "protein", "cell", "organism", "evolution", "neuroscience", "biochemistry", "molecular", "genomics", "rna"],
    suggestedQuestions: [
      "How do diffusion models assist de novo protein design?",
      "Explain off-target mitigation strategies in CRISPR-Cas9 endonuclease assays",
      "What governs epigenetic chromatin remodeling during cell differentiation?"
    ]
  },
  math: {
    id: "math",
    name: "Prof. Nikolai Voronov",
    title: "Pure & Applied Mathematician",
    avatar: "📐",
    field: "Topology, Algebra & Cryptography",
    bio: "Working on algebraic topology, post-quantum cryptographic primitives, and differential geometry applications.",
    initialGreeting: "Welcome. I focus on algebraic structures and mathematical foundations. What theorem, topological space, or cryptographic challenge are we analyzing?",
    topics: ["math", "calculus", "algebra", "topology", "geometry", "cryptography", "number theory", "differential equations", "matrix", "linear algebra", "discrete", "fourier"],
    suggestedQuestions: [
      "Explain the algebraic geometry foundations of lattice-based cryptography",
      "How is persistent homology computed in topological data analysis?",
      "What is the connection between the Riemann hypothesis and prime distribution?"
    ]
  },
  neuro: {
    id: "neuro",
    name: "Dr. Sarah Al-Mansoor",
    title: "Cognitive Neuroscientist",
    avatar: "🧠",
    field: "Neural Computation & Brain Dynamics",
    bio: "Investigating neural oscillations, synaptic plasticity mechanisms, and brain-computer interface signal decoders.",
    initialGreeting: "Hello. I explore cognitive architecture and computational neuroscience. What aspects of brain dynamics, neural oscillations, or synaptic plasticity are you curious about?",
    topics: ["brain", "neuroscience", "neuron", "synapse", "cognitive", "consciousness", "memory", "perception", "eeg", "fmri", "cortex", "neural computation"],
    suggestedQuestions: [
      "How do spike-timing-dependent plasticity (STDP) rules enable unsupervised learning?",
      "What role do gamma oscillations play in working memory binding?",
      "Explain the decoding algorithm pipeline for invasive motor BCIs"
    ]
  },
  cs: {
    id: "cs",
    name: "Dr. Alex Rivera",
    title: "Systems & Distributed Architect",
    avatar: "💻",
    field: "Distributed Systems & Compilers",
    bio: "Focuses on consensus protocols (Raft, Paxos), memory models, formal verification, and compiler optimization.",
    initialGreeting: "Hey there! I specialize in distributed computing, concurrency models, and systems architecture. What system bottleneck or theoretical challenge are we tackling?",
    topics: ["software", "compiler", "operating system", "distributed systems", "database", "algorithms", "data structures", "rust", "concurrency", "networking", "raft", "paxos", "system", "code"],
    suggestedQuestions: [
      "How do write-ahead logs and SSTables interact in LSM-tree databases?",
      "Explain the formal safety invariants of multi-decree Paxos vs Raft",
      "What memory ordering constraints apply to lock-free ring buffers in C++ and Rust?"
    ]
  },
  default: {
    id: "default",
    name: "Dr. Aisha Patel",
    title: "Senior Research Director & Interdisciplinary Scholar",
    avatar: "🎓",
    field: "Interdisciplinary Research & Academic Methodology",
    bio: "Directing synthesis across cross-disciplinary literature, scientific methodology, research validation, and academic publishing.",
    initialGreeting: "Hello, I am Dr. Aisha Patel. I provide cross-disciplinary academic analysis, literature synthesis, and methodology guidance. What topic or research question are we examining today?",
    topics: [],
    suggestedQuestions: [
      "How can I structure a rigorous literature review for an emerging topic?",
      "What are best practices for multi-modal hypothesis validation?",
      "Synthesize the current academic consensus and open debates in this area"
    ]
  }
};

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ExpertSession {
  id: string;
  expertKey: string;
  expertName: string;
  expertAvatar: string;
  expertTitle: string;
  topic: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface CounselingCardProps {
  defaultPersonaId?: string;
  onClearDefaultPersona?: () => void;
  topic?: string;
}

function getDeviceId(): string {
  let deviceId = localStorage.getItem("bifrost_device_id");
  if (!deviceId) {
    deviceId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "dev-" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("bifrost_device_id", deviceId);
  }
  return deviceId;
}

function matchExpertForQuery(query?: string): string {
  if (!query || !query.trim()) return "default";
  const clean = query.toLowerCase().trim();
  const words = clean.split(/\s+/);

  for (const [key, expert] of Object.entries(EXPERTS)) {
    if (key === "default") continue;
    for (const topicWord of expert.topics) {
      if (clean.includes(topicWord.toLowerCase()) || words.some((w) => w === topicWord.toLowerCase())) {
        return key;
      }
    }
  }
  return "default";
}

export const CounselingCard: React.FC<CounselingCardProps> = ({
  defaultPersonaId,
  onClearDefaultPersona,
  topic = ""
}) => {
  const { user } = useUser();
  const { addNote } = useNotes();
  const [addedMap, setAddedMap] = useState<Record<string | number, boolean>>({});

  // Auto-match expert based on query topic
  const matchedKey = useMemo(() => {
    if (defaultPersonaId && EXPERTS[defaultPersonaId]) {
      return defaultPersonaId;
    }
    return matchExpertForQuery(topic);
  }, [topic, defaultPersonaId]);

  const [selectedExpertKey, setSelectedExpertKey] = useState<string>(matchedKey);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentExpert = EXPERTS[selectedExpertKey] || EXPERTS.default;

  // Storage key for user/guest expert chats
  const storageKey = useMemo(() => {
    const userId = user?.id;
    return userId ? `bifrost_expert_chat_${userId}_${selectedExpertKey}` : `bifrost_expert_chat_guest_${getDeviceId()}_${selectedExpertKey}`;
  }, [user?.id, selectedExpertKey]);

  // Load chat session when expert or topic changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: ChatMessage[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to load expert session:", e);
      }
    }

    // Default initial greeting message tailored to current topic
    const greetingText = topic
      ? `${currentExpert.initialGreeting}\n\nI see you are exploring **${topic}**. How can I assist your research or learning on this subject?`
      : currentExpert.initialGreeting;

    setMessages([
      {
        role: "assistant",
        content: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      }
    ]);
  }, [storageKey, selectedExpertKey, topic, currentExpert]);

  // Save messages to storage
  const saveMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newMessages));
    } catch (e) {
      console.error("Failed to persist expert chat:", e);
    }
  };

  // Switch expert handler
  const handleSwitchExpert = (key: string) => {
    setSelectedExpertKey(key);
    setError(null);
    onClearDefaultPersona?.();
  };

  // Clear chat handler
  const handleClearChat = () => {
    const freshGreeting: ChatMessage[] = [
      {
        role: "assistant",
        content: currentExpert.initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      }
    ];
    saveMessages(freshGreeting);
    setError(null);
  };

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
      await addNote(title, content, currentExpert.field);
      setAddedMap((prev) => ({ ...prev, [key]: true }));
      triggerToast("Saved to Notes ✓");
      setTimeout(() => setAddedMap((prev) => ({ ...prev, [key]: false })), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    setInput("");
    setError(null);

    const nowStr = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const userMsg: ChatMessage = { role: "user", content: textToSend, timestamp: nowStr };
    const updatedMessages = [...messages, userMsg];
    saveMessages(updatedMessages);
    setLoading(true);

    try {
      // Direct call to backend counseling/expert API endpoint
      const response = await fetch("/api/counsel", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          personaId: currentExpert.id,
          topic: topic || currentExpert.field,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "Failed to retrieve expert consultation.");
      }

      const data = await response.json();
      const replyContent = data.reply || data.content || "I have analyzed your query and summarized the key theoretical findings.";
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      };

      saveMessages([...updatedMessages, assistantMsg]);
    } catch (err: any) {
      console.error("Expert Chat Error:", err);
      setError(err.message || "An unexpected error occurred during consultation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* ─────────────────────────────────────────────────────────────
          1. EXPERT PROFILE HERO CARD & STATUS
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-3xl sm:text-4xl shadow-inner select-none">
                {currentExpert.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {currentExpert.name}
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                  {currentExpert.field}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active Now
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {currentExpert.title}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                {currentExpert.bio}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={handleClearChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. EXPERT SWITCHER PILLS BAR
            ───────────────────────────────────────────────────────────── */}
        <div className="pt-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0">
              Specialist:
            </span>
            {Object.entries(EXPERTS).map(([key, exp]) => {
              const isSelected = key === selectedExpertKey;
              return (
                <button
                  key={key}
                  onClick={() => handleSwitchExpert(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 font-bold shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className="text-sm select-none">{exp.avatar}</span>
                  <span>{exp.name.split(" ")[1] || exp.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ACTIVE CHAT INTERFACE & CONVERSATION STREAM
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-[580px] shadow-sm">
        
        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border select-none text-sm font-semibold ${
                    isUser
                      ? "bg-slate-900 border-slate-800 text-white dark:bg-slate-100 dark:border-white dark:text-slate-900"
                      : "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:border-indigo-900 dark:text-indigo-300"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : currentExpert.avatar}
                </div>

                {/* Message Bubble */}
                <div
                  className={`group/msg rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-tr-none shadow-xs font-medium"
                      : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-2xs"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="space-y-3">
                      <MarkdownRenderer content={msg.content} />

                      {/* Action Bar for Assistant Messages */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 mt-2 text-[11px] text-slate-400">
                        <span>{msg.timestamp || "Specialist Insight"}</span>
                        <button
                          type="button"
                          onClick={() => handleAddNote(idx, `Expert: ${currentExpert.name}`, msg.content)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium"
                        >
                          {addedMap[idx] ? <Check className="w-3 h-3 text-emerald-500" /> : <BookmarkPlus className="w-3 h-3" />}
                          <span>{addedMap[idx] ? "Saved to Notes" : "Save Note"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-sm text-indigo-600 dark:bg-indigo-950/80 dark:border-indigo-900 dark:text-indigo-300">
                {currentExpert.avatar}
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-2xs flex items-center gap-1.5">
                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-xs text-slate-400 ml-2 font-medium">Synthesizing expert analysis...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. SUGGESTION PILLS & STARTER QUESTIONS
            ───────────────────────────────────────────────────────────── */}
        {currentExpert.suggestedQuestions && currentExpert.suggestedQuestions.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
              Suggested:
            </span>
            {currentExpert.suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors whitespace-nowrap cursor-pointer shadow-2xs shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            5. INPUT FORM & SEND CONTROLS
            ───────────────────────────────────────────────────────────── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${currentExpert.name} about ${currentExpert.field}...`}
            disabled={loading}
            className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-normal"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 sm:px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 flex items-center justify-center cursor-pointer transition-all disabled:opacity-40 shrink-0 font-bold text-xs shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
