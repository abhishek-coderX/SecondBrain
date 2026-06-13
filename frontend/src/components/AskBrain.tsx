import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Send } from "lucide-react";
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
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuestion = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userQuestion }]);
    setLoading(true);

    try {
      const response = await api.post("/ask", { question: userQuestion });
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: response.data.answer,
          references: response.data.references,
        },
      ]);
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
    <section className="page-enter bento-card flex h-full w-full flex-col overflow-hidden">
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
                    <div className="prose-message">
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
    </section>
  );
};
