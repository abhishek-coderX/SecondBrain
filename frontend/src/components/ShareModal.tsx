import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Link2, Send, X } from "lucide-react";
import type { Content, ContentType } from "../types/type";
import api from "../utils/api";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  contents: Content[];
}

type Filter = ContentType | "all";

const filterPills: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "thought", label: "Thoughts" },
  { value: "twitter", label: "Twitter" },
  { value: "youtube", label: "YouTube" },
  { value: "article", label: "Articles" },
];

export const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, contents }) => {
  const [filterType, setFilterType] = useState<Filter>("all");
  const [selectedContents, setSelectedContents] = useState<string[]>([]);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const visibleContents = useMemo(
    () => (filterType === "all" ? contents : contents.filter((c) => c.type === filterType)),
    [contents, filterType]
  );

  const visibleIds = visibleContents.map((c) => c._id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedContents.includes(id));

  const handleToggle = (id: string) => {
    setSelectedContents((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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
      const res = await api.post("/share", { contentIds: selectedContents });
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

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm" onClick={handleClose}>
      <div className="bento-card flex w-full max-w-3xl flex-col overflow-hidden" style={{ maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Header — always visible */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[rgba(125,105,86,0.14)] px-6 py-5">
          <div>
            <p className="bento-heading text-3xl text-slate-900">Share your brain</p>
            <p className="mt-1 text-sm text-slate-500">{selectedContents.length} item{selectedContents.length !== 1 ? "s" : ""} selected</p>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-slate-600" onClick={handleClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content list */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-wrap gap-2">
            {filterPills.map(({ value, label }) => {
              const active = filterType === value;
              return (
                <button
                  key={value}
                  onClick={() => setFilterType(value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${active ? "bg-slate-900 text-white" : "border border-[rgba(125,105,86,0.14)] bg-white/70 text-slate-600"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-[20px] bg-[rgba(128,161,193,0.08)] px-4 py-3">
            <p className="text-sm text-slate-600">{visibleContents.length} visible in this category</p>
            <button onClick={handleSelectAll} className="text-sm font-semibold text-slate-900">
              {allVisibleSelected ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {visibleContents.length === 0 ? (
              <div className="rounded-[22px] border border-[rgba(125,105,86,0.14)] bg-white/65 p-8 text-center text-sm text-slate-500">
                Nothing in this category yet.
              </div>
            ) : (
              visibleContents.map((content) => {
                const isChecked = selectedContents.includes(content._id);
                return (
                  <label
                    key={content._id}
                    className={`flex cursor-pointer items-center gap-4 rounded-[22px] border px-4 py-4 ${
                      isChecked
                        ? "border-[rgba(223,133,82,0.24)] bg-[rgba(240,169,120,0.12)]"
                        : "border-[rgba(125,105,86,0.14)] bg-white/70"
                    }`}
                  >
                    <input type="checkbox" checked={isChecked} onChange={() => handleToggle(content._id)} className="h-4 w-4" style={{ accentColor: "#df8552" }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{content.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{content.type}</p>
                    </div>
                    {isChecked ? <Check className="h-4 w-4 text-[#c66d36]" /> : null}
                  </label>
                );
              })
            )}
          </div>

          {generatedLink ? (
            <div className="mt-5 rounded-[22px] bg-slate-900 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Share link</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[18px] bg-white/10 px-4 py-3 text-sm text-slate-100">
                  <Link2 className="h-4 w-4 flex-shrink-0 text-orange-200" />
                  <span className="truncate">{generatedLink}</span>
                </div>
                <button onClick={handleCopy} className="rounded-[18px] bg-white px-4 py-3 text-sm font-semibold text-slate-900">
                  {copied ? (
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Copied
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      Copy
                    </span>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer — always visible */}
        <div className="flex flex-shrink-0 flex-col gap-3 border-t border-[rgba(125,105,86,0.14)] px-6 py-5 sm:flex-row">
          <button onClick={handleClose} className="bento-button bento-button-secondary flex-1">
            Close
          </button>
          <button
            onClick={handleGenerateLink}
            disabled={selectedContents.length === 0 || isGenerating}
            className="bento-button bento-button-primary flex-1"
          >
            <Send className="h-4 w-4" />
            {isGenerating ? "Generating..." : generatedLink ? "Regenerate Link" : `Generate Share Link${selectedContents.length > 0 ? ` (${selectedContents.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
