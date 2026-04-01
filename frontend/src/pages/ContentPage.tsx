import { useEffect, useState } from "react";
import { Cards } from "../components/Cards";
import { CreateContentModal } from "../components/CreateContentModal";
import { PlusIcon } from "../components/icons/PlusIcon";
import { ShareIcon } from "../components/icons/ShareIcon";
import { Button } from "../components/ui/Button";
import type { Content, ContentType } from "../types/type";
import axios from "axios";
import { ShareModal } from "../components/ShareModal";

interface ContentPageProps {
  activeFilter: ContentType | "all";
}

const ContentPage = ({ activeFilter }: ContentPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contents, setContents] = useState<Content[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get("http://localhost:4000/content", {
          withCredentials: true,
        });
        setContents(res.data);
      } catch (error) {
        setError("Failed to fetch your content. Please try again later.");
        console.error(error);
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
      await axios.delete(`http://localhost:4000/content/${id}`, {
        withCredentials: true,
      });
      setContents((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Failed to delete content:", error);
    }
  };

  const filteredContents =
    activeFilter === "all"
      ? contents
      : contents.filter((c) => c.type === activeFilter);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="break-inside-avoid mb-6 bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-32 bg-gray-200 rounded mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

    if (filteredContents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p className="text-lg font-medium">
            {activeFilter === "all" ? "No content yet." : `No ${activeFilter} content.`}
          </p>
          <p className="text-sm mt-1">
            {activeFilter === "all" ? 'Click "Add Content" to get started!' : 'Try adding some or switch to "All Content".'}
          </p>
        </div>
      );
    }

    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
        {filteredContents.map((content) => (
          <div key={content._id} className="break-inside-avoid mb-6">
            <Cards {...content} onDelete={handleDelete} />
          </div>
        ))}
      </div>
    );
  };

  const filterLabel: Record<ContentType | "all", string> = {
    all: "All Content",
    thought: "Thoughts",
    twitter: "Twitter",
    youtube: "YouTube",
    article: "Articles",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">{filterLabel[activeFilter]}</h2>
        <div className="flex items-center space-x-3">
          <Button
            size="md"
            variant="secondary"
            text="Share Brain"
            startIcon={<ShareIcon size="sm" />}
            onClick={() => setIsShareModalOpen(true)}
          />
          <Button
            size="md"
            variant="primary"
            text="Add Content"
            startIcon={<PlusIcon size="sm" />}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      {renderContent()}

      <CreateContentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContentAdded={handleContentAdded}
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
