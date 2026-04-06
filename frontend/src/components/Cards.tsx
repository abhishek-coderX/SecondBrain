import React, { useState } from "react";
import type { Content } from "../types/type";
import { ExternalLink, Share, Trash2, AlertTriangle } from "lucide-react";
import { Tweet } from "react-tweet";

interface CardsProps extends Content {
  onDelete?: (id: string) => void;
}

const TYPE_CONFIG = {
  youtube: {
    label: "📺 Video Log",
    headerBg: "#fff5f5",
    headerBorder: "#fecaca",
    accentColor: "#dc2626",
    accentDim: "rgba(220,38,38,0.08)",
    cardBorder: "#fecaca",
  },
  twitter: {
    label: "🐦 Twitter Post",
    headerBg: "#eff6ff",
    headerBorder: "#bfdbfe",
    accentColor: "#2563eb",
    accentDim: "rgba(37,99,235,0.08)",
    cardBorder: "#bfdbfe",
  },
  article: {
    label: "📜 Article",
    headerBg: "#fffbf0",
    headerBorder: "#e8d9b0",
    accentColor: "#b8860b",
    accentDim: "rgba(184,134,11,0.08)",
    cardBorder: "#e8d9b0",
  },
  thought: {
    label: "💭 Thought",
    headerBg: "#fffbeb",
    headerBorder: "#fde68a",
    accentColor: "#d97706",
    accentDim: "rgba(217,119,6,0.08)",
    cardBorder: "#fde68a",
  },
};

export const Cards = ({ onDelete, ...props }: CardsProps) => {
  const { _id, title, link, type, description, tags = [], createdAt, thumbnail, userId, duration } = props;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.article;

  const getYoutubeId = () => {
    if (link?.includes("youtube.com/watch?v=")) return link.split("v=")[1]?.split("&")[0];
    if (link?.includes("youtu.be/")) return link.split("youtu.be/")[1]?.split("?")[0];
    return null;
  };

  const renderEmbed = () => {
    if (type === "thought") {
      return description ? (
        <p style={{ color: '#4a3f28', fontFamily: "'Crimson Text', serif", fontSize: '1.05rem', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
          {description}
        </p>
      ) : null;
    }
    if (type === "youtube") {
      const vid = getYoutubeId();
      if (vid) return (
        <div className="relative w-full">
          <iframe className="w-full h-48 rounded-lg" src={`https://www.youtube.com/embed/${vid}`}
            title="YouTube" frameBorder="0" allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          {duration && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff' }}>{duration}</span>
          )}
        </div>
      );
    }
    if (type === "twitter") {
      const tweetId = link?.split("status/")[1]?.split("?")[0];
      if (tweetId) return <div className="w-full"><Tweet id={tweetId} /></div>;
      return (
        <div className="w-full h-24 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#eff6ff', border: '2px dashed #bfdbfe' }}>
          <p style={{ color: '#93c5fd', fontSize: '0.8rem' }}>Click ↗ to view on Twitter</p>
        </div>
      );
    }
    if (type === "article") {
      return thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-auto rounded-lg object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      ) : (
        <div className="w-full h-24 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#faf8f2', border: '2px dashed #e8d9b0' }}>
          <span style={{ color: '#b8a070', fontSize: '1.4rem' }}>📜</span>
        </div>
      );
    }
    return null;
  };

  const handleShare = async () => {
    if (link) {
      if (navigator.share) {
        try { await navigator.share({ title, url: link }); }
        catch { navigator.clipboard.writeText(link); }
      } else {
        navigator.clipboard.writeText(link);
      }
    }
  };

  return (
    <>
      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteDialog(false)}>
          <div className="w-full max-w-sm rounded-2xl p-6"
            style={{ backgroundColor: '#fff', border: '2px solid #fecaca', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#fee2e2', border: '1.5px solid #fca5a5' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#dc2626' }} />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Cinzel', serif", color: '#dc2626', fontWeight: 700, fontSize: '0.95rem' }}>
                  Walk the Plank?
                </h3>
                <p style={{ color: '#7a6e5a', fontSize: '0.82rem', fontFamily: "'Crimson Text', serif" }}>
                  This item will be deleted permanently.
                </p>
              </div>
            </div>
            <p className="mb-5 px-3 py-2 rounded-lg line-clamp-2"
              style={{ backgroundColor: '#faf8f2', border: '1px solid #e8d9b0', color: '#4a3f28', fontFamily: "'Crimson Text', serif", fontSize: '0.95rem' }}>
              "{title}"
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteDialog(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold transition-colors"
                style={{ border: '1.5px solid #e8d9b0', color: '#7a6e5a', fontFamily: "'Cinzel', serif", backgroundColor: 'transparent', fontSize: '0.7rem', letterSpacing: '0.05em', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf8f2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                Cancel
              </button>
              <button onClick={() => { onDelete?.(_id); setShowDeleteDialog(false); }}
                className="flex-1 py-2.5 rounded-xl font-semibold transition-colors"
                style={{ backgroundColor: '#dc2626', color: '#fff', fontFamily: "'Cinzel', serif", border: 'none', fontSize: '0.7rem', letterSpacing: '0.05em', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}>
                💀 Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="w-full rounded-xl overflow-hidden transition-all duration-200"
        style={{ backgroundColor: '#ffffff', border: `2px solid ${cfg.cardBorder}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px ${cfg.accentColor}30`; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}>

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5"
          style={{ backgroundColor: cfg.headerBg, borderBottom: `1px solid ${cfg.headerBorder}` }}>
          <span style={{ fontSize: '0.68rem', fontFamily: "'Cinzel', serif", color: cfg.accentColor, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {cfg.label}
          </span>
          <div className="flex gap-1">
            {link && (
              <>
                <button onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                  className="p-1 rounded transition-colors" title="Open original"
                  style={{ color: '#b8a070' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1a2840')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#b8a070')}>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleShare} className="p-1 rounded transition-colors" title="Copy link"
                  style={{ color: '#b8a070' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1a2840')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#b8a070')}>
                  <Share className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {onDelete && (
              <button onClick={() => setShowDeleteDialog(true)}
                className="p-1 rounded transition-colors" title="Delete"
                style={{ color: '#b8a070' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#b8a070')}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <h1 className="font-bold mb-2 line-clamp-2 leading-snug"
            style={{ color: '#1a2840', fontFamily: "'Cinzel', serif", fontSize: '0.88rem' }}>
            {title}
          </h1>
          {userId?.username && (
            <p className="text-xs mb-3" style={{ color: '#b8a070', fontFamily: "'Crimson Text', serif" }}>
              ⚓ by {userId.username}
            </p>
          )}
          {type !== "thought" && description && (
            <p className="text-sm mb-3 line-clamp-3 leading-relaxed"
              style={{ color: '#7a6e5a', fontFamily: "'Crimson Text', serif", fontSize: '0.95rem' }}>
              {description}
            </p>
          )}
          <div className="mb-3">{renderEmbed()}</div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: cfg.accentDim, color: cfg.accentColor, border: `1px solid ${cfg.accentColor}30`, fontFamily: "'Crimson Text', serif", fontSize: '0.8rem' }}>
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
          {createdAt && (
            <p className="text-xs" style={{ color: '#c8b888', fontFamily: "'Crimson Text', serif" }}>
              {new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          )}
        </div>
      </div>
    </>
  );
};
