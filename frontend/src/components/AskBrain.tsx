import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Plus, Trash2, PanelLeftClose, PanelLeftOpen, X, Square } from "lucide-react";
import api from "../utils/api";
import type { Content } from "../types/type";
import { YoutubeIcon } from "./icons/Youtube";
import { TwitterIcon } from "./icons/Twitter";
import { ArticleIcon } from "./icons/Article";

interface Message {
  sender: "user" | "bot";
  text: string;
  references?: Content[];
  webSources?: { title: string; url: string }[];
  source?: 'brain' | 'web' | 'greeting';
  showApiKeyPrompt?: boolean;
}

export const AskBrain = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! Ask me anything about the content stored in your SecondBrain. I will find relevant notes and answer your question based on them.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeySaving, setApiKeySaving] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const initializedRef = useRef(false);

  const streamIntervalRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingTextRef = useRef('');
  const currentReferencesRef = useRef<Content[]>([]);
  const currentWebSourcesRef = useRef<{ title: string; url: string }[]>([]);
  const currentSourceRef = useRef<'brain' | 'web' | 'greeting' | undefined>(undefined);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const filteredSessions = sessions.filter(s => 
    (s.title || "New Chat").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const preprocessText = (text: string) => {
    if (!text) return "";
    return text.replace(/\(Source:\s*([^)]+)\)/gi, (_, title) => {
      const cleanTitle = title.trim().replace(/^["']|["']$/g, '');
      return `\n\n  📌 **Source:** \`${cleanTitle}\``;
    });
  };

  const isNearBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    const threshold = 150; // pixels
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceToBottom <= threshold;
  };

  const scrollToBottom = (force = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (force || isNearBottom()) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  useEffect(() => {
    if (loading) {
      scrollToBottom(true);
    }
  }, [loading]);

  useEffect(() => {
    scrollToBottom(false);
  }, [streamingText]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    if (isStreaming && streamingTextRef.current) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: streamingTextRef.current,
        references: currentReferencesRef.current,
        webSources: currentWebSourcesRef.current,
        source: currentSourceRef.current
      }]);
    }

    setStreamingText('');
    streamingTextRef.current = '';
    setIsStreaming(false);
    setLoading(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [currentSessionId]);

  useEffect(() => {
    api.get('/settings/api-key')
      .then(res => setHasCustomKey(res.data.hasCustomKey))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    api.get('/sessions')
      .then(res => setSessions(res.data))
      .catch(() => {});
  }, []);

  const handleSelectSession = async (id: string) => {
    try {
      setCurrentSessionId(id);
      setLoading(true);
      const res = await api.get(`/sessions/${id}`);
      const session = res.data;
      if (session.messages && session.messages.length > 0) {
        const mapped = session.messages.map((m: any) => ({
          sender: m.role === "user" ? "user" : "bot",
          text: m.content,
          references: m.references,
          webSources: m.webSources,
          source: m.source,
        }));
        setMessages(mapped);
      } else {
        setMessages([
          {
            sender: "bot",
            text: "Hello! Ask me anything about the content stored in your SecondBrain. I will find relevant notes and answer your question based on them.",
          },
        ]);
      }
      setShowSidebar(false);
    } catch (err) {
      console.error("Failed to load session messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([
      {
        sender: "bot",
        text: "Hello! Ask me anything about the content stored in your SecondBrain. I will find relevant notes and answer your question based on them.",
      },
    ]);
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await api.delete(`/sessions/${id}`);
      setSessions((prev) => prev.filter((s: any) => s._id !== id));
      if (currentSessionId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuestion = input.trim();
    setInput("");
    
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.overflowY = "hidden";
    }

    setMessages((prev) => [...prev, { sender: "user", text: userQuestion }]);
    setLoading(true);

    let activeSessionId = currentSessionId;
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (!activeSessionId) {
        const newSession = await api.post('/sessions', {}, { signal: controller.signal });
        activeSessionId = newSession.data._id;
        setCurrentSessionId(activeSessionId);
        setSessions(prev => [newSession.data, ...prev]);
      }

      const response = await api.post("/ask", {
        question: userQuestion,
        history: messages
          .filter(m => !m.text.includes('Hello! Ask me'))
          .slice(-8)
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
        sessionId: activeSessionId,
      }, {
        signal: controller.signal
      });

      abortControllerRef.current = null;

      const fullText = response.data.answer;
      
      currentReferencesRef.current = response.data.references || [];
      currentWebSourcesRef.current = response.data.webSources || [];
      currentSourceRef.current = response.data.source;

      setIsStreaming(true);
      setStreamingText('');
      streamingTextRef.current = '';

      let i = 0;
      streamIntervalRef.current = setInterval(() => {
        if (i < fullText.length) {
          const nextText = fullText.slice(0, i + 1);
          setStreamingText(nextText);
          streamingTextRef.current = nextText;
          i++;
        } else {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
          setIsStreaming(false);
          setStreamingText('');
          streamingTextRef.current = '';
          setMessages(prev => [...prev, {
            sender: 'bot',
            text: fullText,
            references: currentReferencesRef.current,
            webSources: currentWebSourcesRef.current,
            source: currentSourceRef.current
          }]);
          setLoading(false);
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
        }
      }, 8);

      const res = await api.get("/sessions");
      setSessions(res.data);
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.name === 'AbortError' || error?.message === 'canceled') {
        return;
      }
      
      abortControllerRef.current = null;
      console.error("Failed to ask brain:", error);
      const isRateLimit = 
        error?.response?.status === 429 || 
        error?.response?.status === 503 || 
        error?.response?.data?.rateLimit ||
        (error?.response?.data?.message && (
          error.response.data.message.toLowerCase().includes("rate limit") ||
          error.response.data.message.toLowerCase().includes("rate-limited") ||
          error.response.data.message.toLowerCase().includes("quota exceeded")
        ));

      if (isRateLimit) {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: "⏳ Gemini API rate limit reached.",
          references: []
        }]);
      } else {
        const serverMessage = error.response?.data?.message || "Sorry, I encountered an error while processing your request. Please check if your backend is running.";
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: serverMessage,
          },
        ]);
      }
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <YoutubeIcon size="sm" />;
      case "twitter":
        return <TwitterIcon size="sm" />;
      case "article":
        return <ArticleIcon size="sm" />;
      default:
        return <Bot className="h-3.5 w-3.5" />;
    }
  };

  return (
    <section className="page-enter bento-card flex h-full w-full flex-row overflow-hidden">
      {/* Sidebar Panel */}
      {showSidebar ? (
        <div className="hidden md:flex w-56 border-r border-[rgba(125,105,86,0.14)] bg-white/40 flex flex-col h-full overflow-hidden">
          {/* New Chat Button */}
          <div className="p-4 border-b border-[rgba(125,105,86,0.14)]">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[rgba(125,105,86,0.16)] bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-white transition"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>
          {/* Scrollable Session List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(15,23,42,0.1)',
                background: 'rgba(15,23,42,0.03)',
                fontSize: '0.8rem',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#0f172a',
                outline: 'none',
                marginBottom: '8px'
              }}
            />

            {filteredSessions.length === 0 && searchQuery !== '' ? (
              <p style={{color:'rgba(15,23,42,0.4)', fontSize:'0.75rem', textAlign:'center', padding:'12px'}}>
                No chats found
              </p>
            ) : (
              filteredSessions.map((session: any) => {
                const isActive = session._id === currentSessionId;
                return (
                  <div
                    key={session._id}
                    onClick={() => handleSelectSession(session._id)}
                    className={`group relative flex flex-col gap-1 rounded-xl p-3 cursor-pointer transition ${
                      isActive
                        ? "bg-[rgba(240,169,120,0.14)] border border-[rgba(240,169,120,0.22)]"
                        : "hover:bg-black/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800 truncate pr-6">
                        {session.title || "New Chat"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session._id);
                        }}
                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition"
                        title="Delete Chat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(session.updatedAt || session.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white/10">
        {/* Toggle Sidebar Button Header */}
        <div className="flex items-center justify-center md:justify-between border-b border-[rgba(125,105,86,0.14)] bg-white/30 px-5 py-2">
          <button
            onClick={() => setShowSidebar((prev) => !prev)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(125,105,86,0.14)] bg-white/80 hover:bg-white text-slate-600 transition"
            title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
          >
            {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">SecondBrain Chat</span>
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              title={hasCustomKey ? "Using your Gemini key" : "Add your Gemini API key"}
              className={`flex-shrink-0 bento-button whitespace-nowrap text-xs md:text-sm ${
                hasCustomKey
                  ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                  : "bento-button-secondary text-orange-700 border-orange-200 bg-orange-50/50 hover:bg-orange-50"
              }`}
              style={{
                minHeight: '36px',
                height: '36px',
                padding: '0 12px',
                borderRadius: '12px'
              }}
            >
              🔑 {hasCustomKey ? 'Your key' : 'Add key'}
            </button>
          </div>

          <div className="hidden md:block w-8" />
        </div>

        {/* Message Container */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 space-y-5 overflow-y-auto p-5 md:p-6"
        >
          {messages.map((msg, index) => {
            const isUser = msg.sender === "user";
            return (
              <div key={index} className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser ? (
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(240,169,120,0.18)] text-[#995026]">
                    <Bot className="h-5 w-5" />
                  </div>
                ) : null}

                <div className={`max-w-3xl ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`rounded-[24px] px-5 py-4 text-sm leading-7 ${
                      isUser ? "bg-slate-900 text-white" : "border border-[rgba(125,105,86,0.14)] bg-white/75 text-slate-700"
                    }`}
                  >
                    <div className="prose-message text-left">
                      <ReactMarkdown>{preprocessText(msg.text)}</ReactMarkdown>
                    </div>
                  </div>

                  {!isUser && msg.webSources && msg.webSources.length > 0 && (
                    <div className="mt-2 w-full">
                      <p style={{fontSize:'0.7rem', color:'rgba(15,23,42,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px', fontFamily:"'Plus Jakarta Sans', sans-serif"}}>
                        Web Sources
                      </p>
                      <div className="flex flex-col gap-1">
                        {msg.webSources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize:'0.75rem',
                              color:'#2563eb',
                              fontFamily:"'Plus Jakarta Sans', sans-serif",
                              textDecoration:'none',
                              display:'flex',
                              alignItems:'center',
                              gap:'4px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                          >
                            🌐 {source.title.length > 50 ? source.title.slice(0, 50) + '...' : source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isUser && msg.references && msg.references.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.references.slice(0, 2).map((ref) => (
                        <a
                          key={ref._id}
                          href={ref.link || "#"}
                          target={ref.link ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[rgba(125,105,86,0.14)] bg-white/75 px-3 py-2 text-xs font-medium text-slate-700"
                        >
                          {getSourceIcon(ref.type)}
                          <span className="max-w-[180px] truncate">{ref.title}</span>
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {!isUser && msg.showApiKeyPrompt && (
                    <button
                      type="button"
                      onClick={() => setShowApiKeyModal(true)}
                      style={{
                        marginTop: '8px',
                        padding: '8px 16px',
                        background: 'rgba(251,146,60,0.1)',
                        border: '1px solid rgba(251,146,60,0.3)',
                        borderRadius: '8px',
                        color: '#92400e',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      🔑 Add your API key →
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isStreaming && (
            <div className="flex gap-4 flex-row justify-start">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(240,169,120,0.18)] text-[#995026]">
                <Bot className="h-5 w-5" />
              </div>
              <div className="max-w-3xl items-start flex flex-col">
                <div className="rounded-[24px] px-5 py-4 text-sm leading-7 border border-[rgba(125,105,86,0.14)] bg-white/75 text-slate-700">
                  <div className="prose-message text-left">
                    <ReactMarkdown>{preprocessText(streamingText)}</ReactMarkdown>
                    <span className="inline-block w-1.5 h-4 bg-slate-400 ml-1.5 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && !isStreaming ? (
            <div className="flex gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(240,169,120,0.18)] text-[#995026]">
                <Bot className="h-5 w-5" />
              </div>
              <div className="rounded-[24px] border border-[rgba(125,105,86,0.14)] bg-white/75 px-5 py-4">
                <div className="flex gap-2">
                  <div className="dot-pulse h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: "0s" }} />
                  <div className="dot-pulse h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: "0.2s" }} />
                  <div className="dot-pulse h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          ) : null}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="border-t border-[rgba(125,105,86,0.14)] p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto grow
                e.target.style.height = 'auto';
                const sHeight = e.target.scrollHeight;
                e.target.style.height = `${sHeight}px`;
                if (sHeight > 120) {
                  e.target.style.overflowY = 'auto';
                } else {
                  e.target.style.overflowY = 'hidden';
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !loading) {
                    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                    handleSend(fakeEvent);
                  }
                }
              }}
              placeholder="Ask a question about your notes..."
              disabled={loading}
              rows={1}
              className="bento-textarea flex-1 py-3 px-4 resize-none min-h-[46px] max-h-[120px]"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.95rem',
                lineHeight: '1.4',
                overflowY: 'hidden'
              }}
            />
            {loading || isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="bento-button bg-slate-800 hover:bg-slate-900 text-white sm:min-w-[140px] flex-shrink-0 transition-colors"
              >
                <Square className="h-4 w-4 fill-white" />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={`bento-button sm:min-w-[140px] flex-shrink-0 transition-colors ${
                  input.trim()
                    ? "bento-button-primary"
                    : "bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed"
                }`}
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            )}
          </div>
        </form>
      </div>

      {showApiKeyModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm" onClick={() => setShowApiKeyModal(false)}>
          <div className="bento-card flex w-full max-w-md flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-[rgba(125,105,86,0.14)] px-4 py-4">
              <div>
                <p className="bento-heading text-2xl text-slate-900">Connect Gemini API Key</p>
              </div>
              <button 
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-slate-600 hover:bg-black/10 transition" 
                onClick={() => setShowApiKeyModal(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="mb-3">
                <label className="bento-label">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder={hasCustomKey ? "•••••••••••••••• (Key saved)" : "AIza..."}
                  className="bento-input text-sm"
                />
              </div>

              <div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#92400e] hover:underline font-semibold"
                >
                  Get your API Key →
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-shrink-0 gap-3 border-t border-[rgba(125,105,86,0.14)] px-4 py-4 flex-col sm:flex-row">
              {hasCustomKey && (
                <button
                  type="button"
                  onClick={async () => {
                    await api.delete('/settings/api-key');
                    setHasCustomKey(false);
                    setApiKeyInput('');
                    setShowApiKeyModal(false);
                  }}
                  className="bento-button bento-button-secondary border-red-200 bg-red-50 text-red-600 hover:bg-red-100 flex-1 py-2"
                >
                  Remove Key
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="bento-button bento-button-secondary flex-1 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!apiKeyInput.trim() || apiKeySaving}
                onClick={async () => {
                  setApiKeySaving(true);
                  try {
                    await api.post('/settings/api-key', { geminiApiKey: apiKeyInput.trim() });
                    setHasCustomKey(true);
                    setShowApiKeyModal(false);
                    setApiKeyInput('');
                  } catch {
                    alert('Failed to save API key');
                  } finally {
                    setApiKeySaving(false);
                  }
                }}
                className={`bento-button flex-1 py-2 ${
                  apiKeyInput.trim() 
                    ? 'bento-button-primary' 
                    : 'bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed'
                }`}
              >
                {apiKeySaving ? "Saving..." : "Save Key"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
