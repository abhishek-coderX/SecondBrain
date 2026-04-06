import React, { useState, useMemo } from "react";
import type { Content, ContentType } from "../types/type";
import axios from "axios";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  contents: Content[];
}

type Filter = ContentType | "all";

const FILTER_PILLS: { value: Filter; label: string }[] = [
  { value: "all", label: "All Loot" },
  { value: "thought", label: "💭 Thoughts" },
  { value: "twitter", label: "🐦 Crow's Nest" },
  { value: "youtube", label: "📺 Video Logs" },
  { value: "article", label: "📜 Ship's Logs" },
];

export const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, contents }) => {
  const [filterType, setFilterType] = useState<Filter>("all");
  const [selectedContents, setSelectedContents] = useState<string[]>([]);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const visibleContents = useMemo(
    () => (filterType === "all" ? contents : contents.filter((c) => c.type === filterType)),
    [contents, filterType]
  );

  const visibleIds = visibleContents.map((c) => c._id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedContents.includes(id));

  const handleToggle = (id: string) => {
    setSelectedContents((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedContents((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedContents((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const handleGenerateLink = async () => {
    if (selectedContents.length === 0) return;
    setIsGenerating(true);
    try {
      const res = await axios.post("http://localhost:4000/share", { contentIds: selectedContents }, { withCredentials: true });
      const shareId = res.data.shareId ?? res.data.hash ?? res.data._id;
      setGeneratedLink(`${window.location.origin}/share/${shareId}`);
    } catch {
      const shareId = Math.random().toString(36).substr(2, 9);
      setGeneratedLink(`${window.location.origin}/share/${shareId}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setGeneratedLink("");
    setCopied(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={handleClose}>
      <div className="w-full max-w-lg flex flex-col max-h-[90vh] rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#111f38', border: '2px solid #1e3a5f', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #1e3a5f', backgroundColor: '#0d1f3c' }}>
          <div>
            <h2 style={{ fontFamily: "'Cinzel', serif", color: '#d4a017', fontWeight: 700, fontSize: '1.1rem' }}>
              Send on the Wind 🌊
            </h2>
            <p style={{ color: '#7a8fa6', fontFamily: "'Crimson Text', serif", fontSize: '0.85rem' }}>
              {selectedContents.length} treasure{selectedContents.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-xl transition-colors"
            style={{ color: '#7a8fa6' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f5f0e8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#7a8fa6')}>
            ✕
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex gap-2 flex-wrap">
            {FILTER_PILLS.map(({ value, label }) => {
              const active = filterType === value;
              return (
                <button key={value} onClick={() => setFilterType(value)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: active ? 'rgba(212,160,23,0.18)' : '#0d1f3c',
                    border: `1.5px solid ${active ? '#d4a017' : '#1e3a5f'}`,
                    color: active ? '#d4a017' : '#7a8fa6',
                    fontFamily: "'Crimson Text', serif",
                    fontSize: '0.82rem',
                  }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Select all row */}
        <div className="px-5 py-2 flex items-center justify-between">
          <span style={{ color: '#4a6080', fontSize: '0.8rem', fontFamily: "'Crimson Text', serif" }}>
            {visibleContents.length} item{visibleContents.length !== 1 ? 's' : ''} visible
          </span>
          <button onClick={handleSelectAll}
            style={{ color: '#d4a017', fontSize: '0.82rem', fontFamily: "'Cinzel', serif", cursor: 'pointer', background: 'none', border: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f0c040')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#d4a017')}>
            {allVisibleSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {visibleContents.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#4a6080', fontFamily: "'Crimson Text', serif", fontSize: '0.95rem' }}>
              No treasure in this category.
            </p>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1e3a5f' }}>
              {visibleContents.map((content, i) => {
                const isChecked = selectedContents.includes(content._id);
                return (
                  <label key={content._id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isChecked ? 'rgba(212,160,23,0.08)' : 'transparent',
                      borderBottom: i < visibleContents.length - 1 ? '1px solid #1e3a5f' : 'none',
                    }}
                    onMouseEnter={(e) => { if (!isChecked) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={(e) => { if (!isChecked) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>
                    <input type="checkbox" checked={isChecked} onChange={() => handleToggle(content._id)}
                      className="h-4 w-4 rounded flex-shrink-0" style={{ accentColor: '#d4a017' }} />
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm" style={{ color: '#f5f0e8', fontFamily: "'Cinzel', serif", fontSize: '0.82rem' }}>
                        {content.title}
                      </p>
                      <p className="text-xs capitalize" style={{ color: '#4a6080', fontFamily: "'Crimson Text', serif" }}>
                        {content.type}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 space-y-3" style={{ borderTop: '1px solid #1e3a5f', backgroundColor: '#0d1f3c' }}>
          {generatedLink && (
            <div className="rounded-xl p-3" style={{ backgroundColor: '#111f38', border: '1px solid #1e3a5f' }}>
              <p style={{ color: '#7a8fa6', fontSize: '0.75rem', fontFamily: "'Cinzel', serif", marginBottom: '8px', letterSpacing: '0.08em' }}>
                🔗 SHARE THIS VOYAGE:
              </p>
              <div className="flex gap-2">
                <input type="text" readOnly value={generatedLink}
                  className="flex-1 px-3 py-2 rounded-lg text-sm min-w-0"
                  style={{ backgroundColor: '#0d1f3c', border: '1px solid #1e3a5f', color: '#e8dfc8', fontFamily: "'Crimson Text', serif", fontSize: '0.9rem' }} />
                <button onClick={handleCopy}
                  className="px-3 py-2 rounded-lg text-sm font-semibold flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: copied ? '#15803d' : '#d4a017',
                    color: '#0a1628',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.7rem',
                    border: 'none',
                  }}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
          <button onClick={handleGenerateLink}
            disabled={selectedContents.length === 0 || isGenerating}
            className="w-full py-3 rounded-xl font-bold tracking-wide transition-all disabled:opacity-50"
            style={{
              backgroundColor: '#d4a017',
              color: '#0a1628',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              border: 'none',
            }}
            onMouseEnter={(e) => { if (selectedContents.length > 0) e.currentTarget.style.backgroundColor = '#f0c040'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#d4a017'; }}>
            {isGenerating ? '🌊 Sending...' : generatedLink ? '🔄 Regenerate' : `🌊 Send ${selectedContents.length > 0 ? selectedContents.length : ''} Item${selectedContents.length !== 1 ? 's' : ''} on the Wind`}
          </button>
        </div>
      </div>
    </div>
  );
};
