import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, Link2, PenSquare, Video, X } from "lucide-react";
import api from "../utils/api";
import type { Content, ContentType } from "../types/type";

/** Description textarea with AI hint shown on focus or when empty */
function DescriptionField({
  value,
  onChange,
  isThought,
  error,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isThought: boolean;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const showHint = !isThought && (focused || !value.trim());
  return (
    <div className="md:col-span-2">
      <label className="bento-label">{isThought ? "Your Thought" : "Notes"}</label>
      <textarea
        name="description"
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={isThought ? 5 : 3}
        placeholder={isThought ? "Write your thought here..." : "Brief notes, highlights, or why this matters..."}
        className="bento-textarea min-h-[96px]"
      />
      {showHint ? (
        <p className="mt-1.5 text-slate-400" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
          💡 Tip: A good description helps your AI assistant answer questions accurately. Describe the key ideas, concepts, and why you saved this.
        </p>
      ) : null}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onContentAdded: (newContent: Content) => void;
  defaultType?: ContentType;
}

const contentTypes: { value: ContentType; label: string; icon: React.ElementType; tone: string }[] = [
  { value: "youtube", label: "Video", icon: Video, tone: "bg-[rgba(220,38,38,0.08)] text-[#b91c1c]" },
  { value: "twitter", label: "Twitter", icon: Link2, tone: "bg-[rgba(29,155,240,0.08)] text-[#0369a1]" },
  { value: "article", label: "Article", icon: FileText, tone: "bg-[rgba(22,163,74,0.08)] text-[#166534]" },
  { value: "thought", label: "Thought", icon: PenSquare, tone: "bg-[rgba(202,138,4,0.08)] text-[#854d0e]" },
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
    title: "",
    type: defaultType ?? "youtube",
    link: "",
    description: "",
    tags: "",
    thumbnail: "",
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
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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
  }, [formData.link, isThought]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!isThought) {
      if (!formData.link.trim()) newErrors.link = "A link is required.";
      else {
        try {
          new URL(formData.link);
        } catch {
          newErrors.link = "Enter a valid URL.";
        }
      }
    } else if (!formData.description.trim()) {
      newErrors.description = "Write your thought.";
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
      title: formData.title,
      type: formData.type,
      ...(formData.link && { link: formData.link }),
      ...(formData.description && { description: formData.description }),
      ...(formData.thumbnail && { thumbnail: formData.thumbnail }),
      tags: tagsArray,
    };

    try {
      const response = await api.post("/content", submitData);
      onContentAdded(response.data);
      onClose();
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bento-card flex w-full max-w-md flex-col overflow-hidden" style={{ maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Header — always visible */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[rgba(125,105,86,0.14)] px-4 py-4">
          <div>
            <p className="bento-heading text-2xl text-slate-900">Add to your brain</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-slate-600" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <div>
              <label className="bento-label">Content Type</label>
              <div className="grid gap-2 sm:grid-cols-4">
                {contentTypes.map(({ value, label, icon: Icon, tone }) => {
                  const isActive = formData.type === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, type: value, link: "" }))}
                      className={`rounded-[16px] border px-3 py-3 text-left text-sm ${isActive ? "border-[rgba(223,133,82,0.28)] bg-[rgba(240,169,120,0.14)]" : "border-[rgba(125,105,86,0.14)] bg-white/65"}`}
                    >
                      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${tone}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="bento-label">Title</label>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="Name this item..." className="bento-input text-sm" />
                {errors.title ? <p className="mt-1.5 text-xs text-red-600">{errors.title}</p> : null}
              </div>

              {!isThought ? (
                <div className="md:col-span-2">
                  <label className="bento-label">Link</label>
                  <input name="link" value={formData.link} onChange={handleChange} placeholder="https://..." className="bento-input text-sm" />
                  {errors.link ? <p className="mt-1.5 text-xs text-red-600">{errors.link}</p> : null}
                </div>
              ) : null}

              <DescriptionField
                value={formData.description}
                onChange={handleChange}
                isThought={isThought}
                error={errors.description}
              />

              <div>
                <label className="bento-label">Tags</label>
                <input name="tags" value={formData.tags} onChange={handleChange} placeholder="learning, productivity" className="bento-input text-sm" />
              </div>
            </div>

            {apiError ? <div className="mt-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{apiError}</div> : null}
          </div>

          {/* Footer — always visible */}
          <div className="flex flex-shrink-0 flex-col gap-3 border-t border-[rgba(125,105,86,0.14)] px-4 py-4 sm:flex-row">
            <button type="button" onClick={onClose} disabled={isLoading} className="bento-button bento-button-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="bento-button bento-button-primary flex-1">
              {isLoading ? "Saving..." : "Save to Brain"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
