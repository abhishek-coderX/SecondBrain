import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";
import type { Content, ContentType } from "../types/type";
import {
  ExternalLink,
  Pencil,
  Trash2,
  AlertTriangle,
  Quote,
  FileText,
  Video,
  Twitter,
  X,
} from "lucide-react";
import api from "../utils/api";

// ─── X/Twitter SVG ────────────────────────────────────────────────────────────

const XLogo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// ─── Constants ─────────────────────────────────────────────────────────────────

const titleColors: Record<ContentType, string> = {
  article: "#16a34a",
  youtube: "#dc2626",
  twitter: "#2563eb",
  thought: "#9333ea",
};

const typeConfig = {
  youtube: {
    label: "Video",
    icon: Video,
    accentClass: "bg-[rgba(220,38,38,0.08)] text-[#b91c1c] border-[rgba(220,38,38,0.16)]",
  },
  twitter: {
    label: "Twitter",
    icon: Twitter,
    accentClass: "bg-[rgba(29,155,240,0.08)] text-[#0369a1] border-[rgba(29,155,240,0.16)]",
  },
  article: {
    label: "Article",
    icon: FileText,
    accentClass: "bg-[rgba(22,163,74,0.08)] text-[#166534] border-[rgba(22,163,74,0.16)]",
  },
  thought: {
    label: "Thought",
    icon: Quote,
    accentClass: "bg-[rgba(234,88,12,0.08)] text-[#c2410c] border-[rgba(234,88,12,0.16)]",
  },
};


// ─── Shared portal backdrop styles ────────────────────────────────────────────

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalCardStyle: React.CSSProperties = {
  position: "relative",
  background: "white",
  borderRadius: "16px",
  padding: "24px",
  width: "90%",
  maxWidth: "480px",
  maxHeight: "90vh",
  overflowY: "auto",
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteModalProps {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteModal = ({ title, onCancel, onConfirm }: DeleteModalProps) =>
  ReactDOM.createPortal(
    <div style={backdropStyle} onClick={onCancel}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#fef2f2",
              color: "#dc2626",
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "#0f172a" }}>
              Delete this item?
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              This cannot be undone.
            </p>
          </div>
        </div>

        {/* Item title preview */}
        <div
          style={{
            background: "rgba(17,24,39,0.04)",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "0.875rem",
            color: "#334155",
            marginBottom: "20px",
          }}
        >
          {title}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              background: "white",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #fecaca",
              background: "#fef2f2",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#dc2626",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  content: Content;
  onClose: () => void;
  onSave: (updated: Content) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 12px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "0.875rem",
  color: "#0f172a",
  background: "#f8fafc",
  outline: "none",
  marginTop: "6px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "#64748b",
};

const EditModal = ({ content, onClose, onSave }: EditModalProps) => {
  const [title, setTitle] = useState(content.title);
  const [description, setDescription] = useState(content.description ?? "");
  const [link, setLink] = useState(content.link ?? "");
  const [tagsRaw, setTagsRaw] = useState(content.tags.map((t) => t.name).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // type is read-only — stored from props, never mutated
  const currentType = content.type;
  const cfg = typeConfig[currentType] ?? typeConfig.article;
  const TypeIcon = cfg.icon;

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      // Only include link for non-thought types
      if (currentType !== "thought") {
        payload.link = link.trim() || undefined;
      }

      const res = await api.put(`/content/${content._id}`, payload, { withCredentials: true });
      const updated: Content = { ...content, ...res.data };
      toast.success("Updated successfully");
      onSave(updated);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to update. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "#0f172a" }}>
            Edit Content
          </h3>
          <button
            onClick={onClose}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Inline error */}
        {error ? (
          <div style={{ marginBottom: "16px", padding: "10px 14px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", fontSize: "0.85rem", color: "#dc2626" }}>
            {error}
          </div>
        ) : null}

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Type — read-only badge */}
          <div>
            <label style={labelStyle}>Type</label>
            <div style={{ marginTop: "8px" }}>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "999px", border: "1px solid", fontSize: "0.75rem", fontWeight: 600 }}
                className={cfg.accentClass}
              >
                <TypeIcon size={12} />
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
            />
          </div>

          {/* Link — hidden for thoughts */}
          {currentType !== "thought" ? (
            <div>
              <label style={labelStyle}>Link</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          ) : null}

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="tag1, tag2, tag3"
              style={inputStyle}
            />
          </div>

        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "10px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", fontSize: "0.875rem", fontWeight: 600, color: "#475569", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 1, padding: "10px 16px", borderRadius: "10px", border: "none", background: saving ? "#94a3b8" : "#0f172a", fontSize: "0.875rem", fontWeight: 600, color: "white", cursor: saving ? "not-allowed" : "pointer", transition: "background 0.15s" }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Cards ────────────────────────────────────────────────────────────────────

interface CardsProps extends Content {
  onDelete?: (id: string) => void;
  onUpdate?: (updated: Content) => void;
}

const getYoutubeId = (link?: string) => {
  if (link?.includes("youtube.com/watch?v=")) return link.split("v=")[1]?.split("&")[0];
  if (link?.includes("youtu.be/")) return link.split("youtu.be/")[1]?.split("?")[0];
  return null;
};

export const Cards = ({ onDelete, onUpdate, ...props }: CardsProps) => {
  const { _id, title, link, type, description, tags = [], createdAt, thumbnail, userId, duration } = props;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Article OG image state
  const [articleImg, setArticleImg] = useState<string | null>(thumbnail || null);
  const [imgLoading, setImgLoading] = useState(false);

  const videoId = getYoutubeId(link);
  const [ytThumb, setYtThumb] = useState<string>('');

  useEffect(() => {
    if (!videoId) return;
    const img = new Image();
    img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    img.onload = () => {
      // maxresdefault returns a 120x90 grey image if it doesn't exist
      if (img.width > 120) {
        setYtThumb(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      } else {
        setYtThumb(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      }
    };
    img.onerror = () => setYtThumb(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
  }, [videoId]);

  useEffect(() => {
    if (type !== 'article' || !link) return;
    setArticleImg(thumbnail || null);
  }, [link, type, thumbnail]);

  useEffect(() => {
    if (type !== 'article' || articleImg || !link) return;
    setImgLoading(true);

    const fetchImage = async () => {
      // Try 1: linkpreview.net (works for Medium)
      try {
        const r = await fetch(
          `https://api.linkpreview.net/?key=free&q=${encodeURIComponent(link)}`
        );
        const d = await r.json();
        if (d?.image && !d.image.includes('logo') && !d.image.includes('favicon')) {
          setArticleImg(d.image);
          return;
        }
      } catch {}

      // Try 2: microlink
      try {
        const r = await fetch(`https://api.microlink.io?url=${encodeURIComponent(link)}`);
        const d = await r.json();
        const img = d?.data?.image?.url;
        if (img && !img.includes('logo') && img.includes('http')) {
          setArticleImg(img);
          return;
        }
      } catch {}

      // Try 3: Branded domain placeholder — better than nothing
      try {
        const domain = new URL(link).hostname.replace('www.', '');
        setArticleImg(`DOMAIN:${domain}`);
      } catch {}
    };

    fetchImage().finally(() => setImgLoading(false));
  }, [link, type, thumbnail]);

  const cfg = typeConfig[type] ?? typeConfig.article;
  const TypeIcon = cfg.icon;

  const renderEmbed = () => {
    if (type === "thought") {
      return description ? (
        <p
          className="whitespace-pre-wrap text-sm leading-7 text-slate-700"
          title={description}
          style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {description}
        </p>
      ) : null;
    }

    if (type === "youtube") {
      const vid = getYoutubeId(link);
      if (vid) {
        return (
          <div className="relative">
            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                <img 
                  src={ytThumb} 
                  alt={title} 
                  style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", display: "block" }} 
                />
              </a>
            ) : (
              <img 
                src={ytThumb} 
                alt={title} 
                style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", display: "block" }} 
              />
            )}
            {duration ? (
              <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white pointer-events-none">
                {duration}
              </span>
            ) : null}
          </div>
        );
      }
    }

    if (type === "twitter") {
      const urlUsername = link?.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status/)?.[1];
      const tweetContent = (
        <div
          style={{
            background: "#f7f9fa",
            border: "1px solid #e1e8ed",
            borderRadius: "8px",
            padding: "16px",
            cursor: link ? "pointer" : "default",
          }}
        >
          {description ? (
            <p
              title={description}
              style={{
                fontSize: "0.9rem",
                lineHeight: "1.6",
                color: "#14171a",
                margin: 0,
                whiteSpace: "pre-wrap",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </p>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "#657786", margin: 0, fontStyle: "italic" }}>
              No preview available.
            </p>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "12px",
              paddingTop: "10px",
              borderTop: "1px solid #e1e8ed",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#1da1f2" }}>
              <XLogo />
              {urlUsername ? (
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1da1f2" }}>
                  @{urlUsername}
                </span>
              ) : null}
            </div>
            {link ? (
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#1da1f2",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                View on X ↗
              </span>
            ) : null}
          </div>
        </div>
      );

      return link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
          {tweetContent}
        </a>
      ) : (
        tweetContent
      );
    }

    // article image is rendered directly in the card JSX via ogImage state

    return null;
  };

  return (
    <>
      {/* Delete modal — portal */}
      {showDeleteDialog ? (
        <DeleteModal
          title={title}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={() => {
            onDelete?.(_id);
            setShowDeleteDialog(false);
            toast.success("Deleted successfully");
          }}
        />
      ) : null}

      {/* Edit modal — portal */}
      {showEditModal ? (
        <EditModal
          content={{ _id, title, link, type, description, tags, createdAt, thumbnail, userId, duration } as Content}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => onUpdate?.(updated)}
        />
      ) : null}

      <article className="bento-card bento-shadow-hover overflow-hidden p-4">
        <div className="flex items-start justify-between gap-3">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.accentClass}`}>
            <TypeIcon className="h-3.5 w-3.5" />
            {cfg.label}
          </div>

          <div className="flex items-center gap-1">
            {/* Edit */}
            <button
              onClick={() => setShowEditModal(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-black/5 hover:text-slate-900"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>

            {/* Open original */}
            {link ? (
              <button
                onClick={() => window.open(link, "_blank", "noopener,noreferrer")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-black/5 hover:text-slate-900"
                title="Open original"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            ) : null}

            {/* Delete */}
            {onDelete ? (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold leading-7" style={{ color: titleColors[type] }}>
            {title}
          </h3>
          {userId?.username ? (
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">by {userId.username}</p>
          ) : null}
        </div>

        {/* YOUTUBE — iframe embed then description */}
        {type === "youtube" ? (
          <div className="mt-4">{renderEmbed()}</div>
        ) : null}

        {/* ARTICLE — OG image via microlink, then description */}
        {type === "article" ? (
          <div className="mt-4">
            {imgLoading ? (
              <div style={{width:'100%', height:'160px', background:'linear-gradient(90deg, #f0fdf4 25%, #dcfce7 50%, #f0fdf4 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite', borderRadius:'8px'}} />
            ) : link ? (
              <a href={link} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                {articleImg && !articleImg.startsWith('DOMAIN:') ? (
                  <img
                    src={articleImg}
                    alt={title}
                    style={{width:'100%', height:'160px', objectFit:'cover', borderRadius:'8px'}}
                    onError={() => {
                      try {
                        const domain = new URL(link).hostname.replace('www.', '');
                        setArticleImg(`DOMAIN:${domain}`);
                      } catch { setArticleImg(null); }
                    }}
                  />
                ) : articleImg?.startsWith('DOMAIN:') ? (
                  <div style={{width:'100%', height:'160px', background:'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius:'8px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                    <span style={{fontSize:'2.5rem'}}>📄</span>
                    <span style={{color:'#16a34a', fontSize:'0.8rem', fontWeight:600, fontFamily:"'Plus Jakarta Sans', sans-serif"}}>
                      {articleImg.replace('DOMAIN:', '')}
                    </span>
                  </div>
                ) : (
                  <div style={{width:'100%', height:'160px', background:'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <span style={{color:'#16a34a', fontSize:'0.85rem', fontFamily:"'Plus Jakarta Sans', sans-serif"}}>Article preview unavailable</span>
                  </div>
                )}
              </a>
            ) : (
              articleImg && !articleImg.startsWith('DOMAIN:') ? (
                <img
                  src={articleImg}
                  alt={title}
                  style={{width:'100%', height:'160px', objectFit:'cover', borderRadius:'8px'}}
                  onError={() => {
                    try {
                      const domain = new URL(link).hostname.replace('www.', '');
                      setArticleImg(`DOMAIN:${domain}`);
                    } catch { setArticleImg(null); }
                  }}
                />
              ) : articleImg?.startsWith('DOMAIN:') ? (
                <div style={{width:'100%', height:'160px', background:'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius:'8px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                  <span style={{fontSize:'2.5rem'}}>📄</span>
                  <span style={{color:'#16a34a', fontSize:'0.8rem', fontWeight:600, fontFamily:"'Plus Jakarta Sans', sans-serif"}}>
                    {articleImg.replace('DOMAIN:', '')}
                  </span>
                </div>
              ) : (
                <div style={{width:'100%', height:'160px', background:'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span style={{color:'#16a34a', fontSize:'0.85rem', fontFamily:"'Plus Jakarta Sans', sans-serif"}}>Article preview unavailable</span>
                </div>
              )
            )}
          </div>
        ) : null}

        {/* THOUGHT + TWITTER — embed is the content */}
        {type === "thought" || type === "twitter" ? (
          <div className="mt-4">{renderEmbed()}</div>
        ) : null}

        {/* Description — only for youtube + article, not twitter (already in tweet box) or thought (already in embed) */}
        {(type === "youtube" || type === "article") && description ? (
          <p
            className="mt-3 text-sm leading-6 text-slate-600"
            title={description}
            style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {description}
          </p>
        ) : null}

        {tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full border border-[rgba(125,105,86,0.14)] bg-white/70 px-3 py-1 text-xs font-medium text-slate-600"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}

        {createdAt ? (
          <p className="mt-4 text-xs text-slate-500">
            {new Date(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        ) : null}
      </article>
    </>
  );
};
