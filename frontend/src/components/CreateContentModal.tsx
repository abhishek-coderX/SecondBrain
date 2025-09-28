import React, { useState, useEffect } from "react";
import axios from 'axios';
import { CloseIcon } from "./icons/Close";
import { Content, ContentType } from '../types/type';

// Defines the data structure for the form
interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onContentAdded: (newContent: Content) => void;
}

export function CreateContentModal({
  open,
  onClose,
  onContentAdded,
}: CreateContentModalProps) {
  const [formData, setFormData] = useState<Partial<Content>>({});

  const [errors, setErrors] = useState<Partial<Record<keyof Content, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Effect to reset the form when the modal is opened
  useEffect(() => {
    if (open) {
      setFormData({ type: "youtube" });
      setErrors({});
      setApiError(null);
    }
  }, [open]);

  // Effect to auto-detect content type from the link
  useEffect(() => {
    const { link } = formData;
    if (link) {
      if (link.includes("youtube.com") || link.includes("youtu.be")) {
        setFormData((prev) => ({ ...prev, type: "youtube" }));
      } else if (link.includes("twitter.com") || link.includes("x.com")) {
        setFormData((prev) => ({ ...prev, type: "twitter" }));
      } else {
        setFormData((prev) => ({ ...prev, type: "article" }));
      }
    }
  }, [formData.link]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Content, string>> = {};
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (!formData.link?.trim()) newErrors.link = "Link is required";
    try {
      if (formData.link?.trim()) new URL(formData.link);
    } catch {
      newErrors.link = "Please enter a valid URL";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Content]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError(null);

    const tagsArray = formData.tags ? (formData.tags as unknown as string).split(",").map((tag) => tag.trim()).filter(Boolean) : [];
    const submitData = { ...formData, tags: tagsArray };

    try {
      const response = await axios.post(
        'http://localhost:4000/content',
        submitData,
        { withCredentials: true }
      );
      
      onContentAdded(response.data); // Use the data from the server's response
      onClose();

    } catch (error: any) {
      setApiError(error.response?.data?.message || "An error occurred. Please try again.");
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Add New Content</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseIcon size={"md"} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 grid grid-cols-1 gap-4">
            {/* Form Fields (Link, Type, Title, etc.) */}
            {/* ... your input fields from the previous version go here ... */}
             <div>
               <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">Link *</label>
               <input type="url" name="link" id="link" value={formData.link || ''} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg ${errors.link ? "border-red-500" : "border-gray-300"}`} placeholder="https://example.com" />
               {errors.link && <p className="text-red-600 text-xs mt-1">{errors.link}</p>}
             </div>
             <div>
               <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
               <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg ${errors.title ? "border-red-500" : "border-gray-300"}`} placeholder="Enter content title..." />
               {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
             </div>
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" id="description" rows={3} value={formData.description || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Brief description..."></textarea>
            </div>
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input type="text" name="tags" id="tags" value={formData.tags || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="productivity, learning (comma separated)" />
            </div>
            {/* ... etc ... */}
          </div>
          
          {apiError && (
            <div className="px-6 pb-4 text-red-600 text-sm font-medium">
              <p>Error: {apiError}</p>
            </div>
          )}

          <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}