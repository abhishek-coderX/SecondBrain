import type { Content } from "../types/type";
import { YoutubeIcon } from "./icons/Youtube";
import { TwitterIcon } from "./icons/Twitter";
import { ArticleIcon } from "./icons/Article";
import { ExternalLink, Share, Trash2 } from "lucide-react";
import { Tweet } from "react-tweet";
import { useState } from "react";

interface CardsProps extends Content {
  onDelete?: (id: string) => void;
}

const TYPE_CONFIG = {
  youtube: {
    icon: YoutubeIcon,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    name: "YouTube Video",
  },
  twitter: {
    icon: TwitterIcon,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    name: "Twitter Post",
  },
  article: {
    icon: ArticleIcon,
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    name: "Article",
  },
  thought: {
    icon: () => <span className="text-xl">💭</span>,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    name: "Thought",
  },
};

export const Cards = ({ onDelete, ...props }: CardsProps) => {
  const {
    _id,
    title,
    link,
    type,
    description,
    tags = [],
    createdAt,
    thumbnail,
    userId,
    duration,
  } = props;

  const [confirmDelete, setConfirmDelete] = useState(false);

  const typeConfig = TYPE_CONFIG[type] ?? TYPE_CONFIG.article;
  const IconComponent = typeConfig.icon;

  const getEmbedContent = () => {
    switch (type) {
      case "thought":
        return description ? (
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{description}</p>
        ) : null;

      case "youtube": {
        const videoId = link?.includes("youtube.com/watch?v=")
          ? link.split("v=")[1]?.split("&")[0]
          : link?.includes("youtu.be/")
          ? link.split("youtu.be/")[1]?.split("?")[0]
          : null;
        if (videoId) {
          return (
            <div className="w-full relative">
              <iframe
                className="w-full h-48 rounded-lg"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              {duration && (
                <span className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 text-xs rounded">
                  {duration}
                </span>
              )}
            </div>
          );
        }
        break;
      }

      case "twitter": {
        const tweetId = link?.split("status/")[1]?.split("?")[0];
        if (tweetId) {
          return (
            <div className="w-full">
              <Tweet id={tweetId} />
            </div>
          );
        }
        return (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <IconComponent size="lg" />
              <p className="text-xs text-gray-400 mt-1">Click to view original</p>
            </div>
          </div>
        );
      }

      case "article":
        return (
          <div className="w-full">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-auto object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <IconComponent size="lg" />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <IconComponent size="lg" />
          </div>
        );
    }
  };

  const handleShare = async () => {
    if (link) {
      if (navigator.share) {
        try {
          await navigator.share({ title, url: link });
        } catch {
          navigator.clipboard.writeText(link);
        }
      } else {
        navigator.clipboard.writeText(link);
      }
    }
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete?.(_id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // reset after 3s
    }
  };

  return (
    <div
      className={`max-w-96 relative bg-white border-2 ${typeConfig.borderColor} shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all duration-200`}
    >
      {/* Card Header */}
      <div className={`flex p-3 justify-between items-center ${typeConfig.bgColor}`}>
        <div className="flex items-center gap-2">
          <IconComponent size="sm" />
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {typeConfig.name}
          </h2>
        </div>
        <div className="flex gap-1">
          {link && (
            <>
              <button
                onClick={() => window.open(link, "_blank", "noopener,noreferrer")}
                className="p-1 hover:bg-white/60 rounded transition-colors"
                title="Open original"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button
                onClick={handleShare}
                className="p-1 hover:bg-white/60 rounded transition-colors"
                title="Copy link"
              >
                <Share className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </>
          )}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className={`p-1 rounded transition-colors ${
                confirmDelete
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "hover:bg-white/60 text-gray-500"
              }`}
              title={confirmDelete ? "Click again to confirm delete" : "Delete"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <h1 className="text-base font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
          {title}
        </h1>

        {userId?.username && (
          <p className="text-xs text-gray-400 mb-3">by {userId.username}</p>
        )}

        {/* Embed / Media */}
        {type !== "thought" && description && (
          <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-3">
            {description}
          </p>
        )}

        <div className="mb-3">{getEmbedContent()}</div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {createdAt && (
          <div className="text-xs text-gray-400">
            {new Date(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        )}
      </div>

      {/* Confirm delete banner */}
      {confirmDelete && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-xs text-red-600 text-center animate-pulse">
          Click trash again to confirm delete
        </div>
      )}
    </div>
  );
};
