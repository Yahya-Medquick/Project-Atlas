import React, { useState, useEffect, useMemo, lazy, Suspense, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import { useBookmarks } from './hooks/useBookmarks';
import { useNotes } from './hooks/useNotes';
import { useUser } from './context/UserContext';
import { useChatSessions } from './hooks/useChatSessions';
import { useQueryLimits } from './hooks/useQueryLimits';
import { initPersistentDeviceId } from './utils/deviceFingerprint';
import { getAuthHeaders } from './services/api';
import { ChatSidebar } from './components/chat/ChatSidebar';
import { PersonaPanel } from './components/chat/PersonaPanel';
import { ChatStage } from './components/chat/ChatStage';
import { PaywallModal } from './components/chat/PaywallModal';
import { PwaShortcutModal } from './components/chat/PwaShortcutModal';
import { AuthModal } from './components/AuthModal';
import { NotesSidePanel } from './components/NotesSidePanel';
import { ExpertPersona, matchExpert } from './data/experts';
import { usePersonas } from './hooks/usePersonas';
import { ChatMode, ChatMessage } from './types/chat';

// Lazy-loaded secondary modals for optimal performance
const BookmarksModal = lazy(() =>
  import('./components/BookmarksModal').then((m) => ({ default: m.BookmarksModal }))
);
const AdminDashboardModal = lazy(() =>
  import('./components/AdminDashboardModal').then((m) => ({ default: m.AdminDashboardModal }))
);
const UserProfileModal = lazy(() =>
  import('./components/UserProfileModal').then((m) => ({ default: m.UserProfileModal }))
);
const TopicCompareModal = lazy(() =>
  import('./components/TopicCompareModal').then((m) => ({ default: m.TopicCompareModal }))
);
const TopicTimelineModal = lazy(() =>
  import('./components/TopicTimelineModal').then((m) => ({ default: m.TopicTimelineModal }))
);
const DeveloperApiModal = lazy(() =>
  import('./components/DeveloperApiModal').then((m) => ({ default: m.DeveloperApiModal }))
);
const CompiledNotesModal = lazy(() =>
  import('./components/CompiledNotesModal').then((m) => ({ default: m.CompiledNotesModal }))
);
const KnowledgeGraphModal = lazy(() =>
  import('./components/KnowledgeGraphModal').then((m) => ({ default: m.KnowledgeGraphModal }))
);

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { notes, addNote } = useNotes();
  const { user, isLoggedIn } = useUser();

  // Chat sessions state manager
  const {
    sessions,
    activeSessionId,
    activeSession,
    selectSession,
    createSession,
    updateSessionMessages,
    updateSessionMeta,
    togglePinSession,
    renameSession,
    deleteSession,
  } = useChatSessions();

  // Query usage & paywall tracker
  const {
    usage,
    canExecuteQuery,
    recordQueryExecution,
    isPaywallOpen,
    triggerPaywall,
    closePaywall,
  } = useQueryLimits();

  // Initialize device fingerprinting on first app load
  useEffect(() => {
    initPersistentDeviceId().catch((err) => {
      console.warn("Device fingerprint init warning:", err);
    });
  }, []);

  // Layout panel collapse states (responsive defaults: open on desktop, closed on mobile)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(() => window.innerWidth >= 1024);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(() => window.innerWidth >= 1280);

  // Active persona region variant ('global' | 'pk')
  const [expertVariant, setExpertVariant] = useState<'global' | 'pk'>('global');

  // Loading state for Gemini stream
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(false);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState<boolean>(false);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState<boolean>(false);
  const [compiledNotesModalState, setCompiledNotesModalState] = useState<{
    isOpen: boolean;
    compiledText: string;
    subjectTags: string[];
  }>({ isOpen: false, compiledText: '', subjectTags: [] });
  const [pwaPersona, setPwaPersona] = useState<ExpertPersona | null>(null);

  // Selected persona resolution
  const { globalExperts, pkExperts } = usePersonas();
  const activeExpertSet = expertVariant === 'pk' ? pkExperts : globalExperts;
  const currentPersonaId = activeSession?.personaId || 'aris';
  const activePersona: ExpertPersona =
    activeExpertSet[currentPersonaId] || activeExpertSet['aris'] || Object.values(activeExpertSet)[0];

  // Best domain match persona suggestion
  const suggestedPersona = useMemo(() => {
    if (!activeSession?.title) return undefined;
    const match = matchExpert(activeSession.title, activeExpertSet);
    return match?.id;
  }, [activeSession?.title, activeExpertSet]);

  // Initial bootstrap: create initial session if none exists or parse URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSession = urlParams.get('session');
    const urlPersona = urlParams.get('persona');
    const urlMode = (urlParams.get('mode') || 'concept') as ChatMode;

    if (urlSession && sessions.some((s) => s.id === urlSession)) {
      selectSession(urlSession);
      return;
    }

    if (sessions.length === 0) {
      const initialPersonaId = urlPersona || 'aris';
      createSession(initialPersonaId, urlMode, 'Quantum Physics & AI Foundations', 'Quantum Physics & AI Foundations', expertVariant);
    } else if (!activeSessionId) {
      selectSession(sessions[0].id);
    }
  }, [sessions, activeSessionId, createSession, selectSession, expertVariant]);

  // Handle window resize to auto-adapt sidebars
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsLeftPanelOpen(false);
      }
      if (window.innerWidth < 1280) {
        setIsRightPanelOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K for New Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createSession, expertVariant]);

  // Create new chat
  const handleNewChat = useCallback(() => {
    const newSession = createSession('aris', 'concept', 'Explore Topic', 'New Chat', expertVariant);
    if (window.innerWidth < 1024) {
      setIsLeftPanelOpen(false);
    }
  }, [createSession, expertVariant]);

  // Switch persona in ongoing chat session
  const handleSelectPersona = useCallback(
    (personaId: string, variant: 'global' | 'pk') => {
      setExpertVariant(variant);
      if (activeSession) {
        const expertSet = variant === 'pk' ? pkExperts : globalExperts;
        const persona = expertSet[personaId] || Object.values(expertSet)[0];
        updateSessionMeta(activeSession.id, {
          personaId: persona.id,
          variant,
        });
      }
      if (window.innerWidth < 1024) {
        setIsRightPanelOpen(false);
      }
    },
    [activeSession, updateSessionMeta]
  );

  // Send message handler (invokes /api/chat/message with mode, specs, and persona prompt)
  const handleSendMessage = async (content: string, modeOverride?: ChatMode) => {
    if (!content.trim()) return;

    if (!canExecuteQuery()) {
      triggerPaywall();
      return;
    }

    const currentSession = activeSession || createSession('aris', 'concept', content.slice(0, 32));
    const targetMode = modeOverride || currentSession.mode || 'concept';

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      mode: targetMode,
      personaId: currentSession.personaId,
    };

    const newMessages = [...currentSession.messages, userMessage];

    // If first user message, update session title
    const isFirstUserMsg = currentSession.messages.filter((m) => m.role === 'user').length === 0;
    const newTitle = isFirstUserMsg ? content.trim().slice(0, 36) : currentSession.title;

    updateSessionMessages(currentSession.id, newMessages, newTitle);
    setIsLoadingMessage(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          sessionId: currentSession.id,
          personaId: currentSession.personaId,
          mode: targetMode,
          specs: currentSession.specs || {},
          variant: currentSession.variant || expertVariant,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          triggerPaywall();
          throw new Error('Query limit reached. Upgrade to Pro.');
        }
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      recordQueryExecution();

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: data.reply || 'No response received.',
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        mode: targetMode,
        personaId: currentSession.personaId,
      };

      updateSessionMessages(currentSession.id, [...newMessages, assistantMessage], newTitle);
    } catch (err: any) {
      console.warn('Chat error, falling back to local fallback:', err);
      // Fallback assistant response
      const fallbackReply = `### ${activePersona.name} (${targetMode.toUpperCase()} MODE)\n\nThank you for exploring **${content.trim()}**.\n\n$$\\mathcal{H} |\\psi\\rangle = E |\\psi\\rangle$$\n\nHere is a foundational breakdown:\n1. **Core Mechanism**: In ${targetMode} mode, we analyze the structural invariants.\n2. **Next Steps**: Feel free to request step-by-step derivations or exam rubrics.`;

      const fallbackMsg: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        mode: targetMode,
        personaId: currentSession.personaId,
      };

      updateSessionMessages(currentSession.id, [...newMessages, fallbackMsg], newTitle);
    } finally {
      setIsLoadingMessage(false);
    }
  };

  // Save to Notes callback
  const handleSaveToNotes = (content: string, title?: string) => {
    const noteTitle = title || `${activePersona.name} Note`;
    const subject = activeSession?.mode || 'General';
    addNote(noteTitle, content, subject);
    setIsNotesOpen(true);
  };

  // Save to Bookmarks callback
  const handleSaveBookmark = (title: string, category: any, url?: string, description?: string) => {
    addBookmark({
      topic: activeSession?.title || 'Knowledge',
      title,
      category: category || 'overview',
      url: url || window.location.href,
      description: description || '',
    });
  };

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex overflow-hidden font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* 1. LEFT PANEL: CHAT HISTORY SIDEBAR */}
      <ChatSidebar
        isOpen={isLeftPanelOpen}
        onToggle={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          selectSession(id);
          if (window.innerWidth < 1024) setIsLeftPanelOpen(false);
        }}
        onNewChat={handleNewChat}
        onRenameSession={renameSession}
        onDeleteSession={deleteSession}
        onPinSession={togglePinSession}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarksCount={bookmarks.length}
        onOpenNotes={() => setIsNotesOpen(true)}
        notesCount={notes.length}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenPaywall={triggerPaywall}
        queryUsage={usage}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* 2. CENTER PANEL: MAIN CHAT STAGE */}
      <ChatStage
        session={activeSession}
        activePersona={activePersona}
        variant={expertVariant}
        onSendMessage={handleSendMessage}
        isLoading={isLoadingMessage}
        onToggleLeftPanel={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        isLeftPanelOpen={isLeftPanelOpen}
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
        isRightPanelOpen={isRightPanelOpen}
        onUpdateSessionMeta={updateSessionMeta}
        onSaveToNotes={handleSaveToNotes}
        onSaveBookmark={handleSaveBookmark}
        onOpenPaywall={triggerPaywall}
        onOpenKnowledgeGraph={() => setIsKnowledgeGraphOpen(true)}
        queryUsage={usage}
      />

      {/* 3. RIGHT PANEL: EXPERT PERSONA SELECTOR */}
      <PersonaPanel
        isOpen={isRightPanelOpen}
        onToggle={() => setIsRightPanelOpen(!isRightPanelOpen)}
        selectedPersonaId={currentPersonaId}
        onSelectPersona={handleSelectPersona}
        variant={expertVariant}
        onToggleVariant={(v) => {
          setExpertVariant(v);
          if (activeSession) {
            updateSessionMeta(activeSession.id, { variant: v });
          }
        }}
        onOpenPwaShortcut={(persona) => setPwaPersona(persona)}
        suggestedPersonaId={suggestedPersona}
        onSelectPrompt={(prompt) => handleSendMessage(prompt)}
        onSelectTopic={(topic) => createSession(currentPersonaId, 'concept', topic, topic, expertVariant)}
      />

      {/* MODALS & OVERLAYS */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={closePaywall}
        queryUsage={usage}
        onOpenLogin={() => {
          closePaywall();
          setIsLoginOpen(true);
        }}
      />

      <PwaShortcutModal
        persona={pwaPersona}
        isOpen={!!pwaPersona}
        onClose={() => setPwaPersona(null)}
      />

      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <NotesSidePanel
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
      />

      <Suspense fallback={null}>
        <KnowledgeGraphModal
          isOpen={isKnowledgeGraphOpen}
          onClose={() => setIsKnowledgeGraphOpen(false)}
          initialTopic={activeSession?.title || 'Quantum Mechanics'}
          onSelectTopic={(topic) => {
            setIsKnowledgeGraphOpen(false);
            createSession(currentPersonaId, 'concept', topic, topic, expertVariant);
          }}
        />

        <CompiledNotesModal
          isOpen={compiledNotesModalState.isOpen}
          onClose={() => setCompiledNotesModalState({ isOpen: false, compiledText: '', subjectTags: [] })}
          compiledText={compiledNotesModalState.compiledText}
          subjectTags={compiledNotesModalState.subjectTags}
        />

        <BookmarksModal
          isOpen={isBookmarksOpen}
          onClose={() => setIsBookmarksOpen(false)}
          bookmarks={bookmarks}
          onRemove={removeBookmark}
          onSelectTopic={(topic) => {
            setIsBookmarksOpen(false);
            createSession(currentPersonaId, 'concept', topic, topic, expertVariant);
          }}
        />

        <AdminDashboardModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />

        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          recentSearches={sessions.map((s) => s.title).slice(0, 10)}
          onSelectSearch={(topic) => {
            setIsProfileOpen(false);
            createSession(currentPersonaId, 'concept', topic, topic, expertVariant);
          }}
          onClearHistory={() => {}}
          bookmarksCount={bookmarks.length}
          onOpenBookmarks={() => {
            setIsProfileOpen(false);
            setIsBookmarksOpen(true);
          }}
        />

        <TopicCompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          defaultTopicA={activeSession?.title || 'Quantum Mechanics'}
          onSelectTopic={(topic) => {
            setIsCompareOpen(false);
            createSession(currentPersonaId, 'concept', topic, topic, expertVariant);
          }}
        />

        <TopicTimelineModal
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          topic={activeSession?.title || 'Quantum Mechanics'}
        />

        <DeveloperApiModal
          isOpen={isApiDocsOpen}
          onClose={() => setIsApiDocsOpen(false)}
        />
      </Suspense>
    </div>
  );
}
