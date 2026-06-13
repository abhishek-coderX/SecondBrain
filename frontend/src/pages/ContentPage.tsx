import { useEffect, useState } from "react";
import { Cards } from "../components/Cards";
import { CreateContentModal } from "../components/CreateContentModal";
import { ShareModal } from "../components/ShareModal";
import { SearchBar } from "../components/SearchBar";
import { LayoutGrid, Plus, Share2 } from "lucide-react";
import type { Content, ContentType } from "../types/type";
import api from "../utils/api";
import Masonry from "react-masonry-css";

interface ContentPageProps {
  activeFilter: ContentType | "all";
}

const FILTER_LABELS: Record<ContentType | "all", string> = {
  all: "All Content",
  thought: "Thoughts",
  twitter: "Twitter",
  youtube: "YouTube",
  article: "Articles",
};

const ContentPage = ({ activeFilter }: ContentPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [searchResults, setSearchResults] = useState<Content[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get("/content");
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
      await api.delete(`/content/${id}`);
      setContents((prev) => prev.filter((c) => c._id !== id));
    } catch {
      console.error("Failed to delete content");
    }
  };

  const handleUpdate = (updated: Content) => {
    setContents((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
  };

  const displayedContents = (searchResults !== null ? searchResults : contents).filter((c) =>
    activeFilter === "all" ? true : c.type === activeFilter
  );

  const renderContent = () => {
    if (isLoading || isSearching) {
      return (
        <Masonry
          breakpointCols={{
            default: 4,
            1280: 4,
            1024: 3,
            768: 2,
            640: 1
          }}
          className="flex w-full -ml-3"
          columnClassName="pl-3 bg-clip-padding flex flex-col"
        >
          {[220, 280, 190, 250, 170, 300, 210, 260].map((height, i) => (
            <div key={i} className="bento-skeleton mb-3" style={{ height }} />
          ))}
        </Masonry>
      );
    }

    if (error) {
      return (
        <div className="bento-card flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
          <p className="text-lg font-semibold text-red-500">{error}</p>
          <p className="mt-2 text-sm text-slate-500">The rest of the UI is still intact. Try refreshing after the backend is ready.</p>
        </div>
      );
    }

    if (displayedContents.length === 0) {
      const isSearchActive = searchResults !== null;

      return (
        <div className="bento-card flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[rgba(240,169,120,0.18)] text-[#9d5229]">
            <LayoutGrid className="h-7 w-7" />
          </div>
          <h3 className="bento-heading text-4xl text-slate-900">
            {isSearchActive ? "No semantic matches found." : activeFilter === "all" ? "Your board is empty." : `No ${activeFilter} items yet.`}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            {isSearchActive
              ? "Try a different concept or phrase."
              : activeFilter === "all"
                ? 'Use "Add Content" to create your first block.'
                : "Switch filters or capture something new into this category."}
          </p>
        </div>
      );
    }

    return (
      <Masonry
        breakpointCols={{
          default: 4,
          1280: 4,
          1024: 3,
          768: 2,
          640: 1
        }}
        className="flex w-full -ml-3"
        columnClassName="pl-3 bg-clip-padding flex flex-col"
      >
        {displayedContents.map((content) => (
          <div key={content._id} className="mb-3">
            <Cards
              {...content}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </div>
        ))}
      </Masonry>
    );
  };

  return (
    <div className="page-enter">
      <section className="mb-5 rounded-[24px] border border-[rgba(125,105,86,0.16)] bg-white/75 p-5 shadow-[0_18px_45px_rgba(99,73,48,0.08)] backdrop-blur-[18px]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">{FILTER_LABELS[activeFilter]}</h2>
            {!isLoading ? (
              <p className="mt-1 text-sm text-slate-500">
                {displayedContents.length} item{displayedContents.length !== 1 ? "s" : ""} in this view
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[520px] lg:flex-row lg:items-center lg:justify-end">
            <SearchBar onSearch={setSearchResults} onSearchStateChange={setIsSearching} />
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button className="bento-button bento-button-secondary" onClick={() => setIsShareModalOpen(true)}>
                <Share2 className="h-4 w-4" />
                Share Brain
              </button>
              <button className="bento-button bento-button-primary" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Content
              </button>
            </div>
          </div>
        </div>
      </section>

      {renderContent()}

      <CreateContentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContentAdded={handleContentAdded}
        defaultType={activeFilter === "all" ? "youtube" : activeFilter}
      />
      <ShareModal open={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} contents={contents} />
    </div>
  );
};

export default ContentPage;
