import React, { useState } from "react";
import Twitter from "../components/icons/Twitter";
import Youtube from "../components/icons/Youtube";
import Article from "../components/icons/Article";

type Tab = "twitter" | "youtube" | "article";

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("twitter");

  const renderContent = () => {
    switch (activeTab) {
      case "twitter":
        return <div>Twitter Content</div>;
      case "youtube":
        return <div>Youtube Content</div>;
      case "article":
        return <div>Article Content</div>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setActiveTab("twitter")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            activeTab === "twitter"
              ? "bg-blue-500 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          <Twitter className="h-5 w-5" />
          <span>Twitter</span>
        </button>
        <button
          onClick={() => setActiveTab("youtube")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            activeTab === "youtube"
              ? "bg-red-500 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          <Youtube className="h-5 w-5" />
          <span>Youtube</span>
        </button>
        <button
          onClick={() => setActiveTab("article")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            activeTab === "article"
              ? "bg-green-500 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          <Article className="h-5 w-5" />
          <span>Article</span>
        </button>
      </div>

      <div className="mt-8">{renderContent()}</div>
    </div>
  );
};

export default HomePage;
