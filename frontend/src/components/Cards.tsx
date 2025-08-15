import { ArticleIcon } from "./icons/Article";
import { TwitterIcon } from "./icons/Twitter";
import { YoutubeIcon } from "./icons/Youtube";
import { ExternalLink, Share } from "lucide-react";
import { Tweet } from "react-tweet";

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
};

export type ContentType = keyof typeof TYPE_CONFIG;
interface Tag {
  _id: string;
  name: string;
}
interface CardsProp {
  title: string;
  link: string;
  type: ContentType;
  description?: string;
  tags?: Tag[];
  dateAdded?: string;
  thumbnail?: string;
  author?: string;
  duration?: string;
}

export const Cards = (props: CardsProp) => {
  const {
    title,
    link,
    type,
    description,
    tags = [],
    dateAdded,
    thumbnail,
    author,
    duration,
  } = props;

  const typeConfig = TYPE_CONFIG[type];
  const IconComponent = typeConfig.icon;

  const getEmbedContent = () => {
    switch (type) {
      case "youtube": {
        const videoId = link.includes("youtube.com/watch?v=")
          ? link.split("v=")[1]?.split("&")[0]
          : link.includes("youtu.be/")
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
        const tweetId = link.split("status/")[1]?.split("?")[0];
        if (tweetId) {
          return (
            <div className="w-full">
              <Tweet id={tweetId} />
            </div>
          );
        }
        return (
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <IconComponent size="lg" />
              <p className="text-sm text-gray-500 mt-2">Twitter Post</p>
              <p className="text-xs text-gray-400 mt-1">
                Click to view original
              </p>
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
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            ) : (
              <div className="w-full h-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <IconComponent size="lg" />
              </div>
            )}
           
          </div>
        );

      default:
        return (
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <IconComponent size="lg" />
          </div>
        );
    }
  };

  const handleLinkClick = () => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: link,
        });
      } catch (err) {
        navigator.clipboard.writeText(link);
      }
    } else {
      navigator.clipboard.writeText(link);
    }
  };

  return (
    <div
      className={`max-w-96 relative bg-white border-2 ${typeConfig.borderColor} shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
    >
      <div className={`flex p-4 justify-between ${typeConfig.bgColor}`}>
        <div className="flex items-center gap-2">
          <IconComponent size="sm" />
          <h2 className="text-sm font-medium text-gray-700">
            {typeConfig.name}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLinkClick}
            className="p-1 hover:bg-white/50 rounded transition-colors"
            title="Open original"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleShare}
            className="p-1 hover:bg-white/50 rounded transition-colors"
            title="Share"
          >
            <Share className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2">
          {title}
        </h1>

        {author && <p className="text-sm text-gray-500 mb-3">by {author}</p>}

        {description && (
          <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
            {description}
          </p>
        )}

        <div className="mb-4">{getEmbedContent()}</div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag._id} 
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium ..."
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {dateAdded && (
          <div className="text-xs text-gray-400 font-medium">
            Added on {dateAdded}
          </div>
        )}
      </div>
    </div>
  );
};
