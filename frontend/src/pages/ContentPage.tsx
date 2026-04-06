import { useEffect, useState } from "react";
import { Cards } from "../components/Cards";
import { CreateContentModal } from "../components/CreateContentModal";
import { ShareModal } from "../components/ShareModal";
import type { Content, ContentType } from "../types/type";
import axios from "axios";

interface ContentPageProps {
  activeFilter: ContentType | "all";
}

const FILTER_LABELS: Record<ContentType | "all", string> = {
  all: "⚓ All Content",
  thought: "💭 Thoughts",
  twitter: "🐦 Twitter",
  youtube: "📺 YouTube",
  article: "📜 Articles",
};

const ContentPage = ({ activeFilter }: ContentPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contents, setContents] = useState<Content[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get("http://localhost:4000/content", { withCredentials: true });
        setContents(res.data);
      } catch {
        setError("Failed to fetch your content. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleContentAdded = (newContent: Content) => {
    setContents((prev) => [newContent, ...prev]);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:4000/content/${id}`, { withCredentials: true });
      setContents((prev) => prev.filter((c) => c._id !== id));
    } catch {
      console.error("Failed to delete content");
    }
  };

  const filteredContents = activeFilter === "all" ? contents : contents.filter((c) => c.type === activeFilter);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="break-inside-avoid mb-5 rounded-xl op-skeleton"
              style={{ height: [220, 160, 280, 200, 240, 170, 300, 190][i] + "px", border: '2px solid #e8d9b0' }} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-4xl mb-3">⚓</p>
          <p style={{ color: '#b91c1c', fontFamily: "'Crimson Text', serif", fontSize: '1rem' }}>{error}</p>
        </div>
      );
    }

    if (filteredContents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-5xl mb-4">🗺️</p>
          <p style={{ color: '#b8860b', fontFamily: "'Cinzel', serif", fontSize: '1rem', fontWeight: 600 }}>
            {activeFilter === "all" ? "No content yet." : `No ${activeFilter} content.`}
          </p>
          <p style={{ color: '#7a6e5a', fontFamily: "'Crimson Text', serif", marginTop: '6px', fontSize: '0.95rem' }}>
            {activeFilter === "all" ? 'Click "Add Content" to get started.' : 'Try adding some or switch to All Content.'}
          </p>
        </div>
      );
    }

    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
        {filteredContents.map((content) => (
          <div key={content._id} className="break-inside-avoid mb-5">
            <Cards {...content} onDelete={handleDelete} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", color: '#b8860b', fontWeight: 700, fontSize: '1.3rem' }}>
            {FILTER_LABELS[activeFilter]}
          </h2>
          {!isLoading && (
            <p style={{ color: '#7a6e5a', fontFamily: "'Crimson Text', serif", fontSize: '0.9rem', marginTop: '2px' }}>
              {filteredContents.length} item{filteredContents.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Share Brain — original label */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: '#fffdf7', border: '1.5px solid #e8d9b0', color: '#7a6e5a', fontFamily: "'Cinzel', serif", fontSize: '0.7rem', letterSpacing: '0.05em', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#b8860b'; e.currentTarget.style.color = '#b8860b'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8d9b0'; e.currentTarget.style.color = '#7a6e5a'; }}
          >
            Share Brain
          </button>

          {/* Add Content — original label */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ backgroundColor: '#b8860b', color: '#fffdf7', fontFamily: "'Cinzel', serif", fontSize: '0.7rem', letterSpacing: '0.05em', border: 'none', cursor: 'pointer', boxShadow: '0 3px 12px rgba(184,134,11,0.25)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d4a017')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#b8860b')}
          >
            + Add Content
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-6" style={{ height: '1px', backgroundColor: '#e8d9b0' }} />

      {renderContent()}

      <CreateContentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContentAdded={handleContentAdded}
        defaultType={activeFilter === "all" ? "youtube" : activeFilter}
      />
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        contents={contents}
      />
    </div>
  );
};

export default ContentPage;
