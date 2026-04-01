import React, { useState, useEffect } from "react";
import axios from "axios";
import { CloseIcon } from "./icons/Close";
import type { Content, ContentType } from "../types/type";

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onContentAdded: (newContent: Content) => void;
}

const CONTENT_TYPES: { value: ContentType; label: string; emoji: string }[] = [
  { value: "youtube", label: "YouTube", emoji: "▶️" },
  { value: "twitter", label: "Twitter", emoji: "🐦" },
  { value: "article", label: "Article", emoji: "📰" },
  { value: "thought", label: "Thought", emoji: "💭" },
];

interface FormState {
  title: string;
  type: ContentType;
  link: string;
  description: string;
  tags: string;
  thumbnail: string;
}

export function CreateContentModal({
  open,
  onClose,
  onContentAdded,
}: CreateContentModalProps) {
  const [formData, setFormData] = useState<FormState>({
    title: "",
    type: "youtube",
    link: "",
    description: "",
    tags: "",
    thumbnail: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const isThought = formData.type === "thought";

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setFormData({ title: "", type: "youtube", link: "", description: "", tags: "", thumbnail: "" });
      setErrors({});
      setApiError(null);
    }
  }, [open]);

  // Auto-detect type from link
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

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!isThought) {
      if (!formData.link.trim()) {
        newErrors.link = "Link is required";
      } else {
        try {
          new URL(formData.link);
        } catch {
          newErrors.link = "Please enter a valid URL";
        }
      }
    } else {
      if (!formData.description.trim()) {
        newErrors.description = "Write your thought here";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError(null);

    const tagsArray = formData.tags
      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const submitData = {
      title: formData.title,
      type: formData.type,
      ...(formData.link && { link: formData.link }),
      ...(formData.description && { description: formData.description }),
      ...(formData.thumbnail && { thumbnail: formData.thumbnail }),
      tags: tagsArray,
    };

    try {
      const response = await axios.post(
        "http://localhost:4000/content",
        submitData,
        { withCredentials: true }
      );
      onContentAdded(response.data);
      onClose();
    } catch (error: any) {
      setApiError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Add to your Brain</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CloseIcon size="md" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-5 grid grid-cols-1 gap-4">
            {/* Content Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CONTENT_TYPES.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: value, link: "" }))}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border-2 text-xs font-medium transition-all
                      ${formData.type === value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                  >
                    <span className="text-lg mb-1">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                  errors.title ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="Give it a descriptive title..."
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Link — hidden for thoughts */}
            {!isThought && (
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                  Link *
                </label>
                <input
                  type="url"
                  name="link"
                  id="link"
                  value={formData.link}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                    errors.link ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="https://..."
                />
                {errors.link && <p className="text-red-500 text-xs mt-1">{errors.link}</p>}
              </div>
            )}

            {/* Description — required for thoughts */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {isThought ? "Your Thought *" : "Description"}
              </label>
              <textarea
                name="description"
                id="description"
                rows={isThought ? 5 : 3}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none ${
                  errors.description ? "border-red-400" : "border-gray-300"
                }`}
                placeholder={isThought ? "Write your thought, idea, or note here..." : "Brief description..."}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="learning, productivity (comma separated)"
              />
            </div>
          </div>

          {apiError && (
            <div className="px-5 pb-3 text-red-600 text-sm">
              ⚠️ {apiError}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 p-5 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save to Brain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}