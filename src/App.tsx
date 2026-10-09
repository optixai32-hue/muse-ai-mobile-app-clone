import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  FileText,
  Lightbulb,
  CheckSquare,
  Settings,
  Menu,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  Play,
  Plus,
  Search,
  Trash2,
  Send,
  Mic,
  Paperclip,
  Sparkles,
  RefreshCw,
  LogOut,
  Grid,
  Tag,
  Bell,
  Paintbrush,
  HelpCircle,
  ExternalLink,
  Globe,
  Check,
  X,
  Target,
  Clock,
  ChevronRight,
  Loader2,
  Share2,
  Trophy,
  BarChart3,
  Video,
  Rocket,
  Bot,
  Brain,
  Zap,
  Sprout,
  Shield,
  TrendingUp,
  Calendar,
  Layers,
  Wrench,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Colors } from './constants/colors';
import {
  INITIAL_CHAT_MESSAGES,
  SIDE_CHATS,
  AI_NEWS_ITEMS,
  IDEA_ITEMS,
  TASK_GOALS,
  SETTINGS_PLAN_DATA,
  SETTINGS_CONNECTORS,
} from './constants/dummyData';
import { ChatMessage, TaskGoalItem, ConnectorItem, SideChatItem, AiNewsItem } from './types';
import { ToolIconRenderer } from './components/icons/BrandIcons';

// Vector Icon Avatar Options (replacing all emojis with real vector icons)
const AVATAR_OPTIONS = [
  { id: 'cooper', label: 'Cooper', isImage: true },
  { id: 'bot', label: 'Assistant', icon: Bot },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'brain', label: 'Neural', icon: Brain },
  { id: 'rocket', label: 'Launch', icon: Rocket },
  { id: 'lightbulb', label: 'Creative', icon: Lightbulb },
  { id: 'target', label: 'Focus', icon: Target },
  { id: 'sprout', label: 'Growth', icon: Sprout },
  { id: 'zap', label: 'Speed', icon: Zap },
];

const THEME_COLORS = [
  '#2563EB', // Muse Blue
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#E11D48', // Rose
];

// Real icon mappings for idea automation cards (replacing emojis)
const IDEA_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'idea-1': { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
  'idea-2': { icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
  'idea-3': { icon: Video, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200' },
  'idea-4': { icon: Rocket, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
};

// Real icon mappings for news feed categories
const CATEGORY_META: Record<
  AiNewsItem['category'],
  { icon: React.ElementType; color: string; bg: string }
> = {
  Research: { icon: Brain, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  Product: { icon: Globe, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
  Policy: { icon: Shield, color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' },
  Funding: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  Tools: { icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'chat' | 'feed' | 'ideas' | 'tasks' | 'tools' | 'settings'>('chat');

  // Agent Mascot & Profile State
  const [agentName, setAgentName] = useState('Cooper');
  const [agentSubtitle, setAgentSubtitle] = useState('Autonomous Agent');
  const [mascotIcon, setMascotIcon] = useState('cooper');
  const [mascotColor, setMascotColor] = useState<string>(Colors.primary);

  // Modals & Panels State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isEditAgentOpen, setIsEditAgentOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedManageTool, setSelectedManageTool] = useState<ConnectorItem | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [activeSideChatId, setActiveSideChatId] = useState<string>('main');
  const [sideChats, setSideChats] = useState<SideChatItem[]>(SIDE_CHATS);
  const [searchDrawerQuery, setSearchDrawerQuery] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Tasks State
  const [tasks, setTasks] = useState<TaskGoalItem[]>(TASK_GOALS);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  // Tools & Connectors State
  const [connectors, setConnectors] = useState<ConnectorItem[]>(SETTINGS_CONNECTORS);
  const [connectingToolId, setConnectingToolId] = useState<string | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping, activeTab]);

  // Handle Send Chat
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsAiTyping(true);

    // Smart companion responses from Cooper
    setTimeout(() => {
      setIsAiTyping(false);
      const lower = text.toLowerCase();
      let reply: ChatMessage;

      if (
        lower.includes('schedule') ||
        lower.includes('remind') ||
        lower.includes('every day') ||
        lower.includes('routine') ||
        lower.includes('goal')
      ) {
        reply = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: `I've prepared a recurring schedule for this task. Please review the proposal:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          scheduleConfirmation: {
            title: text.length > 35 ? text.slice(0, 35) + '...' : text,
            originalPrompt: text,
            taskType: 'generic_prompt',
            taskPayload: { query: text },
            scheduleRule: {
              frequency: lower.includes('week') ? 'weekly' : 'daily',
              time: '08:00 AM',
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            delivery: 'chat',
            summary: `Cooper will autonomously execute: "${text}" every morning at 8:00 AM.`,
          },
          scheduleStatus: 'pending',
        };
      } else if (
        lower.includes('connect') ||
        lower.includes('tool') ||
        lower.includes('slack') ||
        lower.includes('gmail') ||
        lower.includes('github') ||
        lower.includes('notion')
      ) {
        const toolName = lower.includes('slack')
          ? 'Slack'
          : lower.includes('github')
          ? 'GitHub'
          : lower.includes('notion')
          ? 'Notion'
          : 'Google Workspace';
        reply = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: `I can automate this using ${toolName}. Let's make sure the integration is active:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          connectCta: {
            toolName,
            connectUrl: '#',
          },
        };
      } else if (
        lower.includes('browse') ||
        lower.includes('search') ||
        lower.includes('leaderboard') ||
        lower.includes('website')
      ) {
        reply = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: `I initialized a secure Browserbase session to inspect the live target:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          browserPreview: {
            type: 'browser_session',
            status: 'ready',
            sessionId: `sess-${Date.now().toString().slice(-6)}`,
            reason: 'Inspecting live data & web entries',
            currentUrl: 'https://news.ycombinator.com',
            previewUrl: 'https://news.ycombinator.com',
          },
        };
      } else {
        const defaultResponses = [
          `Got it! I am analyzing this task and will handle the execution steps for you. Let me know if you want me to set up an automated schedule for it.`,
          `Understood. I've noted your objective. I can keep track of this across your connected tools and trigger autonomous check-ins.`,
          `I'm on it! Would you like me to run this as a one-time operation, or turn it into a recurring routine in your Tasks tab?`,
        ];
        reply = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }

      setMessages((prev) => [...prev, reply]);
    }, 850);
  };

  // Schedule Card Handlers
  const handleConfirmSchedule = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg?.scheduleConfirmation) return;

    const newGoal: TaskGoalItem = {
      id: `task-${Date.now()}`,
      title: msg.scheduleConfirmation.title,
      schedule: `Every day @ ${msg.scheduleConfirmation.scheduleRule.time}`,
      status: 'active',
      runsCount: 0,
    };

    setTasks((prev) => [newGoal, ...prev]);

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              text: 'Routine scheduled successfully! Added to your Tasks tab.',
              scheduleStatus: 'confirmed',
            }
          : m
      )
    );
    showToast('Scheduled routine created in Tasks!');
  };

  const handleCancelSchedule = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              text: 'Schedule proposal cancelled.',
              scheduleStatus: 'cancelled',
            }
          : m
      )
    );
    showToast('Schedule cancelled');
  };

  // Run Task Now in Tasks Tab
  const handleRunTask = (taskId: string) => {
    setRunningTaskId(taskId);
    showToast('Running autonomous agent task...');

    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                runsCount: t.runsCount + 1,
              }
            : t
        )
      );
      setRunningTaskId(null);
      showToast('Task executed successfully!');
    }, 1100);
  };

  // Toggle Task Active/Inactive
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'active' ? 'paused' : 'active';
          showToast(`${t.title} is now ${nextStatus === 'active' ? 'active' : 'paused'}`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Add New Task from Modal
  const handleCreateNewTask = (title: string, schedule: string) => {
    const newTask: TaskGoalItem = {
      id: `task-${Date.now()}`,
      title,
      schedule,
      status: 'active',
      runsCount: 0,
    };
    setTasks((prev) => [newTask, ...prev]);
    setIsNewTaskModalOpen(false);
    showToast('New scheduled routine added!');
  };

  // Select Idea and Load into Chat
  const handleSelectIdea = (idea: any) => {
    setActiveTab('chat');
    handleSendMessage(idea.prompt);
    showToast(`Started: ${idea.title}`);
  };

  // Connect / Disconnect Tool
  const handleToggleTool = (toolId: string) => {
    setConnectingToolId(toolId);
    const target = connectors.find((c) => c.id === toolId);
    if (!target) return;

    setTimeout(() => {
      setConnectors((prev) =>
        prev.map((c) => {
          if (c.id === toolId) {
            const nextConnected = !c.connected;
            showToast(nextConnected ? `Connected to ${c.name}!` : `Disconnected ${c.name}`);
            return {
              ...c,
              connected: nextConnected,
              accountEmail: nextConnected ? 'active.user@domain.com' : undefined,
            };
          }
          return c;
        })
      );
      setConnectingToolId(null);
      if (selectedManageTool?.id === toolId) {
        setSelectedManageTool(null);
      }
    }, 750);
  };

  // Filter side chats in drawer
  const filteredSideChats = sideChats.filter((c) =>
    c.title.toLowerCase().includes(searchDrawerQuery.toLowerCase())
  );

  // Helper renderer for avatar icon (replaces all emojis with real icons)
  const renderAvatarGraphic = (iconKey: string, sizeClass = 'w-6 h-6') => {
    if (iconKey === 'cooper') {
      return (
        <img
          src="/assets/images/cooper_mascot.jpg"
          alt={agentName}
          className="w-full h-full object-cover"
        />
      );
    }
    const found = AVATAR_OPTIONS.find((opt) => opt.id === iconKey);
    if (found && found.icon) {
      const IconComp = found.icon;
      return <IconComp className={sizeClass} />;
    }
    return <Bot className={sizeClass} />;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 select-none antialiased">
      {/* Global Toast Overlay */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 border border-slate-700 animate-fade-in pointer-events-none">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          DESKTOP & TABLET SIDEBAR (Visible on lg: screens and up)
         ========================================================================= */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 z-30 shrink-0 ${
          isDesktopSidebarCollapsed ? 'w-20' : 'w-72 xl:w-80'
        }`}
      >
        {/* Brand & Agent Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsEditAgentOpen(true)}
              className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 ring-2 ring-blue-500/20 shrink-0 flex items-center justify-center hover:scale-105 transition"
              title="Edit Agent Profile"
            >
              {renderAvatarGraphic(mascotIcon, 'w-6 h-6 text-blue-600')}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>
            {!isDesktopSidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                  {agentName}
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600">
                    Pro
                  </span>
                </h1>
                <p className="text-xs text-slate-500 truncate">{agentSubtitle}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition"
            title={isDesktopSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isDesktopSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="p-3 space-y-1">
          {[
            { key: 'chat', label: 'Chat Companion', icon: MessageSquare },
            { key: 'feed', label: 'Autonomous Feed', icon: FileText },
            { key: 'ideas', label: 'Idea Templates', icon: Lightbulb },
            { key: 'tasks', label: 'Scheduled Tasks', icon: CheckSquare },
            { key: 'tools', label: 'Tools & Connectors', icon: Grid },
            { key: 'settings', label: 'Settings', icon: Settings },
          ].map((nav) => {
            const Icon = nav.icon;
            const isActive = activeTab === nav.key;
            return (
              <button
                key={nav.key}
                onClick={() => setActiveTab(nav.key as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#E6E8EA] text-slate-950 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={nav.label}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                {!isDesktopSidebarCollapsed && <span className="truncate">{nav.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Side Conversations Drawer Section (Visible when expanded) */}
        {!isDesktopSidebarCollapsed && (
          <div className="flex-1 flex flex-col min-h-0 border-t border-slate-100 p-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Side Chats</span>
              <button
                onClick={() => {
                  const newChat: SideChatItem = {
                    id: `side-${Date.now()}`,
                    title: `Topic ${sideChats.length + 1}`,
                    hasUnreadDot: false,
                  };
                  setSideChats((prev) => [newChat, ...prev]);
                  setActiveTab('chat');
                  showToast('Started new thread');
                }}
                className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-500 flex items-center justify-center transition"
                title="New side thread"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              <button
                onClick={() => {
                  setActiveTab('chat');
                  setActiveSideChatId('main');
                  showToast('Switched to Main chat');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  activeSideChatId === 'main' && activeTab === 'chat'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">Main chat</span>
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              </button>

              {sideChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveTab('chat');
                    setActiveSideChatId(chat.id);
                    showToast(`Opened: ${chat.title}`);
                  }}
                  className={`group w-full text-left px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition flex items-center justify-between ${
                    activeSideChatId === chat.id && activeTab === 'chat'
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate flex-1 pr-2">{chat.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {chat.hasUnreadDot && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSideChats((prev) => prev.filter((c) => c.id !== chat.id));
                        showToast('Thread removed');
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quota Usage Widget */}
        {!isDesktopSidebarCollapsed && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800">{SETTINGS_PLAN_DATA.planName}</span>
              <span className="font-bold text-blue-600">{SETTINGS_PLAN_DATA.remainingCredits} credits left</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${SETTINGS_PLAN_DATA.percentUsed}%` }}
              />
            </div>
            <button
              onClick={() => showToast('Upgraded tier preview')}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              Upgrade Plan
            </button>
          </div>
        )}
      </aside>

      {/* =========================================================================
          MAIN APPLICATION VIEWPORT (Responsive on all screen sizes)
         ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Top Header (Compact on mobile, Spacious on desktop) */}
        <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-100 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Trigger (Hidden on Desktop) */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-95 transition"
              title="Open drawer menu"
            >
              <Menu className="w-5 h-5" strokeWidth={2.2} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {/* Title / Current Section Indicator */}
            <div className="flex items-center gap-2.5">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'chat' && `Chat with ${agentName}`}
                {activeTab === 'feed' && 'Autonomous Intelligence Feed'}
                {activeTab === 'ideas' && 'Automation Ideas & Templates'}
                {activeTab === 'tasks' && 'Scheduled Goals & Routines'}
                {activeTab === 'tools' && 'Connected Tools & Workspace'}
                {activeTab === 'settings' && 'Account & System Preferences'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Agent
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsEditAgentOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              <Paintbrush className="w-3.5 h-3.5 text-blue-600" />
              Customize Agent
            </button>

            <button
              onClick={() => setIsSettingsMenuOpen(true)}
              className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-95 transition"
              title="Options"
            >
              <MoreHorizontal className="w-5 h-5 text-slate-800" strokeWidth={2.2} />
            </button>
          </div>
        </header>

        {/* Dynamic Content Viewport */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          {/* ----------------- TAB: CHAT ----------------- */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
              {/* Messages Thread Container */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 py-4 space-y-4 max-w-4xl w-full mx-auto"
              >
                {/* Date Divider Badge */}
                <div className="flex justify-center my-2">
                  <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200/60">
                    Today
                  </span>
                </div>

                {/* Messages */}
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[90%] sm:max-w-[78%] px-4 sm:px-5 py-3.5 rounded-2xl text-[14.5px] sm:text-[15px] leading-relaxed select-text shadow-sm ${
                          isUser
                            ? 'bg-[#E8C4B4] text-[#3B2318] rounded-br-sm font-medium'
                            : 'bg-[#EEF0F2] text-[#1E2022] rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Connected Tool CTA Card with REAL BRAND SVG LOGO */}
                        {!isUser && msg.connectCta && (
                          <div className="mt-3.5 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                <ToolIconRenderer toolName={msg.connectCta.toolName} className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  Connect {msg.connectCta.toolName}
                                </p>
                                <p className="text-[11px] text-slate-500">Enable automated workflows & actions</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab('tools');
                                showToast(`Opening ${msg.connectCta?.toolName} settings`);
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition shrink-0"
                            >
                              Connect
                            </button>
                          </div>
                        )}

                        {/* Web Browser Live Preview Card */}
                        {!isUser && msg.browserPreview && (
                          <div className="mt-3.5 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="px-3.5 py-2.5 bg-slate-50 flex items-center justify-between border-b border-slate-200 text-xs font-semibold text-slate-700">
                              <span className="flex items-center gap-1.5 truncate">
                                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                                {msg.browserPreview.currentUrl}
                              </span>
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                                Live Session
                              </span>
                            </div>
                            <div className="p-3 bg-slate-50 text-xs text-slate-600 space-y-1">
                              <p className="font-mono text-[11px] text-slate-400">
                                Session ID: {msg.browserPreview.sessionId}
                              </p>
                              <p className="text-slate-800 font-medium">{msg.browserPreview.reason}</p>
                            </div>
                            <div className="p-2.5 bg-white border-t border-slate-100">
                              <button
                                onClick={() => showToast('Simulating live automated browser window')}
                                className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Open Interactive Browser View
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Schedule Confirmation Card */}
                        {!isUser && msg.scheduleConfirmation && (
                          <div className="mt-3.5 p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <h4 className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              Schedule Recurring Autonomous Goal?
                            </h4>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Goal:</span>
                                <span className="font-bold text-slate-800">{msg.scheduleConfirmation.title}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Recurrence:</span>
                                <span className="font-bold text-slate-800">
                                  {msg.scheduleConfirmation.scheduleRule.frequency === 'weekly' ? 'Weekly' : 'Daily'} @{' '}
                                  {msg.scheduleConfirmation.scheduleRule.time}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Target Delivery:</span>
                                <span className="font-bold text-slate-800 capitalize">
                                  {msg.scheduleConfirmation.delivery} Channel
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg leading-normal">
                              {msg.scheduleConfirmation.summary}
                            </p>

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleConfirmSchedule(msg.id)}
                                disabled={msg.scheduleStatus === 'confirmed'}
                                className={`flex-1 py-2 text-xs font-bold rounded-xl transition text-white ${
                                  msg.scheduleStatus === 'confirmed'
                                    ? 'bg-emerald-600'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {msg.scheduleStatus === 'confirmed' ? 'Scheduled & Active' : 'Confirm Routine'}
                              </button>
                              <button
                                onClick={() => {
                                  setInputText(msg.scheduleConfirmation?.originalPrompt || '');
                                  handleCancelSchedule(msg.id);
                                }}
                                disabled={msg.scheduleStatus === 'confirmed'}
                                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCancelSchedule(msg.id)}
                                disabled={msg.scheduleStatus === 'confirmed'}
                                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* AI Typing Indicator */}
                {isAiTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium italic py-2 animate-fade-in">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>{agentName} is thinking & analyzing context...</span>
                  </div>
                )}
              </div>

              {/* Bottom Quick Prompts with REAL ICONS (no emojis) */}
              <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0 max-w-4xl w-full mx-auto">
                <button
                  onClick={() => handleSendMessage('Schedule daily morning health check-in at 8:00 AM')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Schedule daily check-in
                </button>
                <button
                  onClick={() => handleSendMessage('Summarize unread team Slack messages and emails')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  Summarize Slack & Email
                </button>
                <button
                  onClick={() => handleSendMessage('Browse trending money-making AI apps')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  Browse live web apps
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 sm:px-8 md:px-12 lg:px-16 bg-white border-t border-slate-100 pb-20 lg:pb-5">
                <div className="max-w-4xl mx-auto flex items-center gap-2.5 bg-[#F3F4F6] border border-[#ECEEF0] rounded-full px-3 py-2 shadow-inner">
                  <button
                    onClick={() => showToast('Attach file / document')}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 transition"
                    title="Attach file"
                  >
                    <Plus className="w-5 h-5 text-slate-700" strokeWidth={2.2} />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    placeholder={`Ask ${agentName} to schedule routines, inspect web links, run automations...`}
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 text-[14.5px] placeholder:text-slate-400 px-1"
                  />

                  {inputText.trim().length > 0 ? (
                    <button
                      onClick={() => handleSendMessage()}
                      className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition"
                      title="Send message"
                    >
                      <Send className="w-4 h-4 text-white" strokeWidth={2.4} />
                    </button>
                  ) : (
                    <button
                      onClick={() => showToast('Voice input activated')}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 transition"
                      title="Voice input"
                    >
                      <Mic className="w-4 h-4 text-slate-700" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB: FEED ----------------- */}
          {activeTab === 'feed' && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 py-6 pb-24 lg:pb-8 max-w-5xl w-full mx-auto space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">AI News & Intelligence</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Autonomous briefings and workflow updates gathered for {agentName}.
                </p>
              </div>

              {/* Featured Signal Banner */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                    Today&apos;s Signal
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    Agentic AI is shifting toward useful daily workflows
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    Companion agents are moving beyond chat interfaces into scheduled background routines and cross-tool executions.
                  </p>
                </div>
              </div>

              {/* Responsive Grid of News Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_NEWS_ITEMS.map((item) => {
                  const meta = CATEGORY_META[item.category] || CATEGORY_META.Research;
                  const CategoryIcon = meta.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => showToast(`Selected: ${item.title}`)}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold text-slate-800">{item.source}</span>
                          <span className="text-xs text-slate-400 font-medium">{item.timeAgo}</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">
                          {item.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${meta.color} ${meta.bg}`}
                        >
                          <CategoryIcon className="w-3.5 h-3.5" />
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{item.readTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------- TAB: IDEAS (REAL ICONS) ----------------- */}
          {activeTab === 'ideas' && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 py-6 pb-24 lg:pb-8 max-w-5xl w-full mx-auto space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Automation Ideas</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  1-Tap autonomous workflow blueprints ready to dispatch to {agentName}.
                </p>
              </div>

              {/* Responsive Grid with REAL Vector Icons instead of Emojis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {IDEA_ITEMS.map((idea) => {
                  const iconConfig = IDEA_ICONS[idea.id] || {
                    icon: Lightbulb,
                    color: 'text-blue-500',
                    bg: 'bg-blue-50 border-blue-200',
                  };
                  const IdeaIcon = iconConfig.icon;

                  return (
                    <div
                      key={idea.id}
                      onClick={() => handleSelectIdea(idea)}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-lg cursor-pointer transition flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs ${iconConfig.bg} ${iconConfig.color}`}
                          >
                            <IdeaIcon className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Run Template <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                          {idea.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {idea.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                        <span>Autonomous Execution</span>
                        <span className="text-blue-600 font-bold">1-Tap Deploy</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------- TAB: TASKS & GOALS ----------------- */}
          {activeTab === 'tasks' && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 py-6 pb-24 lg:pb-8 max-w-5xl w-full mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Scheduled Routines</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Autonomous goals running in background intervals.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewTaskModalOpen(true)}
                  className="self-start sm:self-auto px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Routine
                </button>
              </div>

              {/* Metric KPI Summary */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Active</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                    {tasks.filter((t) => t.status === 'active').length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Routines</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{tasks.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Runs</span>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                    {tasks.reduce((acc, curr) => acc + curr.runsCount, 0)}
                  </p>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isActive = task.status === 'active';
                  const isRunning = runningTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition shadow-sm ${
                        isActive ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                              isActive ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className={`text-sm sm:text-base font-bold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                              {task.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                              <span className="flex items-center gap-1 font-semibold text-slate-700">
                                <Clock className="w-3.5 h-3.5 text-blue-600" />
                                {task.schedule}
                              </span>
                              <span>•</span>
                              <span>{task.runsCount} executions completed</span>
                            </div>
                          </div>
                        </div>

                        {/* Switch */}
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => handleToggleTaskStatus(task.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          State: <span className={isActive ? 'text-emerald-600 font-bold' : 'text-slate-500'}>{isActive ? 'Active' : 'Paused'}</span>
                        </span>
                        <button
                          onClick={() => handleRunTask(task.id)}
                          disabled={isRunning}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold active:scale-95 transition flex items-center gap-1.5 border border-blue-200/60"
                        >
                          {isRunning ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Running Agent...
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-blue-600" />
                              Run Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------- TAB: TOOLS & CONNECTORS (REAL LOGOS) ----------------- */}
          {activeTab === 'tools' && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 py-6 pb-24 lg:pb-8 max-w-5xl w-full mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Connected Tools</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Connect external accounts with real OAuth integration so {agentName} can execute tasks.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Checked connection status with providers')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Status
                </button>
              </div>

              {/* Grid of Connectors with REAL SVG LOGOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectors.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
                          <ToolIconRenderer toolName={tool.name} className="w-6 h-6" />
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            tool.connected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tool.connected ? 'Connected' : 'Available'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-3">{tool.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{tool.description}</p>
                      {tool.accountEmail && (
                        <p className="text-xs font-semibold text-blue-600 mt-2 bg-blue-50 px-2.5 py-1 rounded-lg inline-block">
                          Account: {tool.accountEmail}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">{tool.category}</span>
                      {tool.connected ? (
                        <button
                          onClick={() => setSelectedManageTool(tool)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
                        >
                          Manage Connection
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleTool(tool.id)}
                          disabled={connectingToolId === tool.id}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 transition flex items-center gap-1.5 shadow-xs"
                        >
                          {connectingToolId === tool.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Connect'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------- TAB: SETTINGS ----------------- */}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 py-6 pb-24 lg:pb-8 max-w-3xl w-full mx-auto space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Manage plan usage, appearance, and agent configuration.
                </p>
              </div>

              {/* Plan Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">{SETTINGS_PLAN_DATA.planName}</span>
                  <span className="text-xs font-bold text-blue-600">{SETTINGS_PLAN_DATA.percentUsed}% consumed</span>
                </div>
                <p className="text-xs text-slate-500">{SETTINGS_PLAN_DATA.resetText}</p>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${SETTINGS_PLAN_DATA.percentUsed}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-600 font-medium">
                    {SETTINGS_PLAN_DATA.creditsUsed} / {SETTINGS_PLAN_DATA.creditsTotal} Credits
                  </span>
                  <button
                    onClick={() => showToast('Upgraded tier preview')}
                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>

              {/* Preferences Group */}
              <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden bg-white shadow-xs">
                <button
                  onClick={() => setIsEditAgentOpen(true)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Paintbrush className="w-5 h-5 text-slate-700" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Agent Appearance & Persona</p>
                      <p className="text-xs text-slate-500">Edit mascot emblem, display name, and theme accent</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setActiveTab('tools')}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Grid className="w-5 h-5 text-slate-700" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Workspace Connectors</p>
                      <p className="text-xs text-slate-500">Manage Google Workspace, Slack, Notion, GitHub</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => showToast('Notifications toggled')}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-700" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Autonomous Notifications</p>
                      <p className="text-xs text-slate-500">Alerts when background goals finish running</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => showToast('Muse AI v1.2 — High Performance Autonomous Companion')}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-slate-700" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Help & Support</p>
                      <p className="text-xs text-slate-500">API Documentation and prompt guidelines</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => showToast('Signed out of demo session')}
                  className="w-full p-4 flex items-center justify-between hover:bg-red-50 text-red-600 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-bold text-red-600">Sign Out</p>
                      <p className="text-xs text-red-400">End current companion session</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* =========================================================================
            MOBILE BOTTOM NAVIGATION DOCK (Hidden on lg: screens)
           ========================================================================= */}
        <nav className="lg:hidden fixed bottom-3 left-4 right-4 z-30 bg-white/95 backdrop-blur-md rounded-full shadow-xl border border-slate-200/80 p-1.5 flex items-center justify-around">
          {[
            { key: 'chat', label: 'Chat', icon: MessageSquare },
            { key: 'feed', label: 'Feed', icon: FileText },
            { key: 'ideas', label: 'Ideas', icon: Lightbulb },
            { key: 'tasks', label: 'Tasks', icon: CheckSquare },
            { key: 'tools', label: 'Tools', icon: Grid },
            { key: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex flex-col items-center justify-center py-2 px-2.5 sm:px-3 rounded-full transition active:scale-95 ${
                  isActive ? 'bg-[#E6E8EA] text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-950'
                }`}
                title={tab.label}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* =========================================================================
          MODALS & OVERLAYS
         ========================================================================= */}

      {/* 1. Mobile Left Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left">
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <span className="text-base font-bold text-slate-900">{agentName}</span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <button
                onClick={() => {
                  setActiveTab('chat');
                  setIsMobileDrawerOpen(false);
                  showToast('Switched to Main chat');
                }}
                className="w-full py-3.5 px-4 bg-[#E6E8EA] rounded-full text-left font-bold text-sm text-slate-900"
              >
                Main chat
              </button>
            </div>

            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Side chats</span>
              <button
                onClick={() => {
                  setSideChats([]);
                  showToast('Side chats cleared');
                }}
                className="text-xs font-semibold text-slate-400 hover:text-red-500"
              >
                Clear all
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 divide-y divide-slate-100">
              {filteredSideChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveTab('chat');
                    setIsMobileDrawerOpen(false);
                    showToast(`Opened: ${chat.title}`);
                  }}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-xl"
                >
                  <span className="text-sm text-slate-800 font-medium truncate flex-1 pr-2">
                    {chat.title}
                  </span>
                  <div className="flex items-center gap-2">
                    {chat.hasUnreadDot && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSideChats((prev) => prev.filter((c) => c.id !== chat.id));
                        showToast('Chat removed');
                      }}
                      className="text-slate-300 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white">
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setActiveTab('settings');
                }}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700"
              >
                <Settings className="w-4 h-4" />
              </button>

              <div className="flex-1 flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-2 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchDrawerQuery}
                  onChange={(e) => setSearchDrawerQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-800 w-full"
                />
              </div>

              <button
                onClick={() => {
                  const newChat: SideChatItem = {
                    id: `side-${Date.now()}`,
                    title: `Conversation ${sideChats.length + 1}`,
                    hasUnreadDot: false,
                  };
                  setSideChats((prev) => [newChat, ...prev]);
                  setIsMobileDrawerOpen(false);
                  setActiveTab('chat');
                  showToast('Started new conversation');
                }}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top-Right 3-Dots Action Sheet */}
      {isSettingsMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end p-4">
          <div onClick={() => setIsSettingsMenuOpen(false)} className="absolute inset-0 bg-transparent" />
          <div className="relative mt-12 mr-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 p-1.5 z-10 animate-fade-in text-xs font-semibold text-slate-800 divide-y divide-slate-100">
            <div className="space-y-0.5 pb-1">
              <button
                onClick={() => {
                  setIsSettingsMenuOpen(false);
                  setIsEditAgentOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-left"
              >
                <Sparkles className="w-4 h-4 text-slate-700" />
                Edit Mascot & Avatar
              </button>
              <button
                onClick={() => {
                  setIsSettingsMenuOpen(false);
                  setIsEditAgentOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-left"
              >
                <Paintbrush className="w-4 h-4 text-slate-700" />
                Rename Agent
              </button>
              <button
                onClick={() => {
                  setIsSettingsMenuOpen(false);
                  showToast('Export transcript generated');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-left"
              >
                <Share2 className="w-4 h-4 text-slate-700" />
                Export Chat
              </button>
              <button
                onClick={() => {
                  setIsSettingsMenuOpen(false);
                  setMessages(INITIAL_CHAT_MESSAGES);
                  showToast('Conversation cleared');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-left"
              >
                <RefreshCw className="w-4 h-4 text-slate-700" />
                Clear Messages
              </button>
            </div>
            <div className="pt-1">
              <button
                onClick={() => {
                  setIsSettingsMenuOpen(false);
                  setMessages([]);
                  showToast('Chat deleted');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 text-left"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Edit Agent Personalization Modal (REAL SVG ICONS, NO EMOJIS) */}
      {isEditAgentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Customize Agent</h3>
              <button
                onClick={() => setIsEditAgentOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar Preview */}
            <div className="flex justify-center py-1">
              <div
                className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shadow-sm border-2"
                style={{ borderColor: mascotColor }}
              >
                {renderAvatarGraphic(mascotIcon, 'w-8 h-8 text-blue-600')}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Agent Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 bg-slate-50"
                maxLength={25}
              />
            </div>

            {/* Real SVG Avatar Choices (No Emojis) */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Avatar Emblem
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = mascotIcon === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setMascotIcon(opt.id)}
                      className={`h-11 rounded-xl flex items-center justify-center border transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                      title={opt.label}
                    >
                      {opt.isImage ? (
                        <div className="w-6 h-6 rounded-full overflow-hidden">
                          <img
                            src="/assets/images/cooper_mascot.jpg"
                            alt="Cooper"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : IconComp ? (
                        <IconComp className="w-5 h-5" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Color Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Theme Accent
              </label>
              <div className="flex justify-between items-center px-1">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setMascotColor(color)}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                      mascotColor === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {mascotColor === color && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditAgentOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsEditAgentOpen(false);
                  showToast('Agent profile updated');
                }}
                className="flex-1 py-2.5 text-white text-xs font-bold rounded-xl shadow-sm transition"
                style={{ backgroundColor: mascotColor }}
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">New Scheduled Routine</h3>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const title = (form.elements.namedItem('taskTitle') as HTMLInputElement).value;
                const schedule = (form.elements.namedItem('taskSchedule') as HTMLInputElement).value;
                if (title && schedule) {
                  handleCreateNewTask(title, schedule);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Routine Name
                </label>
                <input
                  name="taskTitle"
                  required
                  placeholder="e.g. Daily Morning Inbox Sorter"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Frequency Interval
                </label>
                <select
                  name="taskSchedule"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-blue-500 bg-slate-50"
                >
                  <option value="Every day @ 8:00 AM">Every day @ 8:00 AM</option>
                  <option value="Every day @ 1:00 PM">Every day @ 1:00 PM</option>
                  <option value="Every day @ 9:00 PM">Every day @ 9:00 PM</option>
                  <option value="Every Monday @ 9:00 AM">Every Monday @ 9:00 AM</option>
                  <option value="Every Sunday @ 6:00 PM">Every Sunday @ 6:00 PM</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Create Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Manage Connector Modal with REAL SVG LOGO */}
      {selectedManageTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <ToolIconRenderer toolName={selectedManageTool.name} className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedManageTool.name}</h3>
              </div>
              <button
                onClick={() => setSelectedManageTool(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-2 text-slate-600 border border-slate-100">
              <p>
                <span className="font-bold text-slate-800">Category:</span> {selectedManageTool.category}
              </p>
              <p>
                <span className="font-bold text-slate-800">Connection State:</span> Active & Verified
              </p>
              {selectedManageTool.accountEmail && (
                <p>
                  <span className="font-bold text-slate-800">Connected Account:</span>{' '}
                  {selectedManageTool.accountEmail}
                </p>
              )}
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                Scoped access allows {agentName} to perform search, notifications, and scheduled automations.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleToggleTool(selectedManageTool.id)}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition"
              >
                Disconnect Account
              </button>
              <button
                onClick={() => setSelectedManageTool(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
