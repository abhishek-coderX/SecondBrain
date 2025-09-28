
import React, { useState } from 'react';
import { CloseIcon } from './icons/Close';
import { Content } from '../types/type';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  contents: Content[];
}

export const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, contents }) => {
  const [selectedContents, setSelectedContents] = useState<string[]>([]);
  const [generatedLink, setGeneratedLink] = useState<string>('');

  const handleSelectContent = (contentId: string) => {
    setSelectedContents(prev =>
      prev.includes(contentId)
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const handleGenerateLink = async () => {
    // In a real application, you would make an API call to the backend
    // to create a shared link and get a unique URL.
    // For this example, we'll simulate it.
    const shareId = Math.random().toString(36).substr(2, 9);
    const link = `${window.location.origin}/share/${shareId}`;
    setGeneratedLink(link);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Share Your Content</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon size="md" />
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-md font-semibold text-gray-700 mb-4">Select content to share:</h3>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {contents.map(content => (
              <div key={content._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-gray-800">{content.title}</span>
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={selectedContents.includes(content._id)}
                  onChange={() => handleSelectContent(content._id)}
                />
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button
              onClick={handleGenerateLink}
              disabled={selectedContents.length === 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
            >
              Generate Share Link
            </button>
          </div>
          {generatedLink && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-700">Share this link with others:</p>
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(generatedLink)}
                  className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
