import React, { useState, useEffect } from "react";
import axios from "axios";
import type { Content, ContentType } from "../types/type";

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onContentAdded: (newContent: Content) => void;
  defaultType?: ContentType;
}

const CONTENT_TYPES: { value: ContentType; label: string; emoji: string; accent: string }[] = [
  { value: "youtube", label: "Video Log", emoji: "📺", accent: "#ef4444" },
  { value: "twitter", label: "Crow's Nest", emoji: "🐦", accent: "#60a5fa" },
  { value: "article", label: "Ship's Log", emoji: "📜", accent: "#d4a017" },
  { value: "thought", label: "Inner Voice", emoji: "💭", accent: "#f59e0b" },
];

interface FormState {
  title: string;
  type: ContentType;
  link: string;
  description: string;
  tags: string;
  thumbnail: string;
}

export function CreateContentModal({ open, onClose, onContentAdded, defaultType }: CreateContentModalProps) {
  const [formData, setFormData] = useState<FormState>({
    title: "", type: defaultType ?? "youtube", link: "", description: "", tags: "", thumbnail: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const isThought = formData.type === "thought";

  useEffect(() => {
    if (open) {
      setFormData({ title: "", type: defaultType ?? "youtube", link: "", description: "", tags: "", thumbnail: "" });
      setErrors({});
      setApiError(null);
    }
  }, [open, defaultType]);

  useEffect(() => {
    if (isThought) return;
    const { link } = formData;
    if (!link) return;
    if (link.includes("youtube.com") || link.includes("youtu.be")) {
      setFormData((prev) => ({ ...prev, type: "youtube" }));
    } else if (link.includes("twitter.com") || link.includes("x.com")) {
      setFormData((prev) => ({ ...prev, type: "twitter" }));
    } else {
      setFormData((prev) => ({ ...prev, type: "article" }));
    }
  }, [formData.link]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!formData.title.trim()) newErrors.title = "A title is required, Navigator.";
    if (!isThought) {
      if (!formData.link.trim()) newErrors.link = "A link is required.";
      else { try { new URL(formData.link); } catch { newErrors.link = "Enter a valid URL."; } }
    } else {
      if (!formData.description.trim()) newErrors.description = "Write your thought.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setApiError(null);
    const tagsArray = formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const submitData = {
      title: formData.title, type: formData.type,
      ...(formData.link && { link: formData.link }),
      ...(formData.description && { description: formData.description }),
      ...(formData.thumbnail && { thumbnail: formData.thumbnail }),
      tags: tagsArray,
    };
    try {
      const response = await axios.post("http://localhost:4000/content", submitData, { withCredentials: true });
      onContentAdded(response.data);
      onClose();
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Something went wrong on the high seas.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  const inputStyle = {
    backgroundColor: '#0d1f3c',
    border: '1.5px solid #1e3a5f',
    color: '#f5f0e8',
    fontFamily: "'Crimson Text', serif",
    fontSize: '1rem',
    borderRadius: '10px',
    padding: '10px 14px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.7rem',
    fontFamily: "'Cinzel', serif",
    color: '#d4a017',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}>
      <div className="w-full max-w-md flex flex-col max-h-[92vh] rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#111f38', border: '2px solid #1e3a5f', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #1e3a5f', backgroundColor: '#0d1f3c' }}>
          <div>
            <h2 style={{ fontFamily: "'Cinzel', serif", color: '#d4a017', fontWeight: 700, fontSize: '1.1rem' }}>
              Stow the Loot 🏴‍☠️
            </h2>
            <p style={{ color: '#7a8fa6', fontSize: '0.8rem', fontFamily: "'Crimson Text', serif" }}>
              Add to your personal treasure chest
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-xl"
            style={{ color: '#7a8fa6', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f5f0e8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#7a8fa6')}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex flex-col flex-1">
          <div className="p-5 space-y-4">
            {/* Type selector */}
            <div>
              <label style={labelStyle}>⚓ Loot Type</label>
              <div className="grid grid-cols-4 gap-2">
                {CONTENT_TYPES.map(({ value, label, emoji, accent }) => {
                  const isActive = formData.type === value;
                  return (
                    <button key={value} type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, type: value, link: "" }))}
                      className="flex flex-col items-center justify-center py-3 px-1 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: isActive ? `${accent}18` : '#0d1f3c',
                        border: `2px solid ${isActive ? accent : '#1e3a5f'}`,
                        color: isActive ? accent : '#7a8fa6',
                        fontFamily: "'Crimson Text', serif",
                        fontSize: '0.82rem',
                      }}>
                      <span className="text-lg mb-1">{emoji}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={labelStyle}>🗺️ Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="Name this treasure..."
                style={{ ...inputStyle, borderColor: errors.title ? '#ef4444' : '#1e3a5f' }}
                onFocus={(e) => (e.target.style.borderColor = errors.title ? '#ef4444' : '#d4a017')}
                onBlur={(e) => (e.target.style.borderColor = errors.title ? '#ef4444' : '#1e3a5f')}
              />
              {errors.title && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px', fontFamily: "'Crimson Text', serif" }}>{errors.title}</p>}
            </div>

            {/* Link */}
            {!isThought && (
              <div>
                <label style={labelStyle}>🔗 Link *</label>
                <input type="url" name="link" value={formData.link} onChange={handleChange}
                  placeholder="https://..."
                  style={{ ...inputStyle, borderColor: errors.link ? '#ef4444' : '#1e3a5f' }}
                  onFocus={(e) => (e.target.style.borderColor = errors.link ? '#ef4444' : '#d4a017')}
                  onBlur={(e) => (e.target.style.borderColor = errors.link ? '#ef4444' : '#1e3a5f')}
                />
                {errors.link && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px', fontFamily: "'Crimson Text', serif" }}>{errors.link}</p>}
              </div>
            )}

            {/* Description / Thought */}
            <div>
              <label style={labelStyle}>{isThought ? "💭 Your Thought *" : "📝 Description"}</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                rows={isThought ? 5 : 3}
                placeholder={isThought ? "Write your thought here..." : "Brief description..."}
                style={{ ...inputStyle, resize: 'none', borderColor: errors.description ? '#ef4444' : '#1e3a5f' }}
                onFocus={(e) => (e.target.style.borderColor = errors.description ? '#ef4444' : '#d4a017')}
                onBlur={(e) => (e.target.style.borderColor = errors.description ? '#ef4444' : '#1e3a5f')}
              />
              {errors.description && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px', fontFamily: "'Crimson Text', serif" }}>{errors.description}</p>}
            </div>

            {/* Tags */}
            <div>
              <label style={labelStyle}>🏷️ Bounty Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange}
                placeholder="learning, productivity (comma separated)"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#d4a017')}
                onBlur={(e) => (e.target.style.borderColor = '#1e3a5f')}
              />
            </div>
          </div>

          {apiError && (
            <div className="mx-5 mb-3 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(185,28,28,0.15)', border: '1.5px solid #7f1d1d', color: '#ef4444', fontFamily: "'Crimson Text', serif" }}>
              ⚠️ {apiError}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 p-5 mt-auto" style={{ borderTop: '1px solid #1e3a5f', backgroundColor: '#0d1f3c' }}>
            <button type="button" onClick={onClose} disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ border: '1.5px solid #1e3a5f', color: '#7a8fa6', backgroundColor: 'transparent', fontFamily: "'Cinzel', serif", fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Retreat
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              style={{ backgroundColor: '#d4a017', color: '#0a1628', fontFamily: "'Cinzel', serif", fontSize: '0.7rem', letterSpacing: '0.08em', border: 'none' }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#f0c040'; }}
              onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#d4a017'; }}>
              {isLoading ? "⚓ Storing..." : "⚓ Stow to Chest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}