import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Plus, Trash2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import api from "../utils/api";
import type { Content } from "../types/type";
import { YoutubeIcon } from "./icons/Youtube";
import { TwitterIcon } from "./icons/Twitter";
import { ArticleIcon } from "./icons/Article";

interface Message {
  sender: "user" | "bot";
  text: string;
  references?: Content[];
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
  const [showSidebar, setShowSidebar] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get("/sessions");
        setSessions(res.data);
        // Auto-create new session on open
        const newSession = await api.post("/sessions");
        setCurrentSessionId(newSession.data._id);
        // Re-fetch sessions to list the new session in sidebar
        const refreshed = await api.get("/sessions");
        setSessions(refreshed.data);
      } catch (err) {
        console.error("Failed to init AskBrain sessions:", err);
      }
    };
    init();
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
    } catch (err) {
      console.error("Failed to load session messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      setLoading(true);
      const newSession = await api.post("/sessions");
      setCurrentSessionId(newSession.data._id);
      setMessages([
        {
          sender: "bot",
          text: "Hello! Ask me anything about the content stored in your SecondBrain. I will find relevant notes and answer your question based on them.",
        },
      ]);
      // Re-fetch sessions to update sidebar list
      const res = await api.get("/sessions");
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to create new session:", err);
    } finally {
      setLoading(false);
    }
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
    setMessages((prev) => [...prev, { sender: "user", text: userQuestion }]);
    setLoading(true);

    try {
      const response = await api.post("/ask", {
        question: userQuestion,
        history: messages.slice(-6).map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        })),
        sessionId: currentSessionId,
      });
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: response.data.answer,
          references: response.data.references,
        },
      ]);
      // Refresh session list to show updated title and dates
      const res = await api.get("/sessions");
      setSessions(res.data);
    } catch (error) {
      console.error("Failed to ask brain:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I encountered an error while processing your request. Please check if your backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
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
        <div className="w-56 border-r border-[rgba(125,105,86,0.14)] bg-white/40 flex flex-col h-full overflow-hidden">
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
            {sessions.map((session: any) => {
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
            })}
          </div>
        </div>
      ) : null}

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white/10">
        {/* Toggle Sidebar Button Header */}
        <div className="flex items-center justify-between border-b border-[rgba(125,105,86,0.14)] bg-white/30 px-5 py-2">
          <button
            onClick={() => setShowSidebar((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(125,105,86,0.14)] bg-white/80 hover:bg-white text-slate-600 transition"
            title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
          >
            {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
          <span className="text-sm font-semibold text-slate-700">SecondBrain Chat</span>
          <div className="w-8" />
        </div>

        {/* Message Container */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-6">
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
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>

                  {!isUser && index > 0 && msg.references && msg.references.length > 0 ? (
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
                </div>
              </div>
            );
          })}

          {loading ? (
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
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your notes..."
              disabled={loading}
              className="bento-input flex-1"
            />
            <button type="submit" disabled={loading || !input.trim()} className="bento-button bento-button-primary sm:min-w-[140px]">
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
