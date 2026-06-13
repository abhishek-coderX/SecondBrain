import React, { useState } from "react";
import { SideBar } from "../components/SideBar";
import type { ContentType } from "../types/type";

interface MainLayoutProps {
  children: (activeFilter: ContentType | "all" | "chat") => React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [activeFilter, setActiveFilter] = useState<ContentType | "all" | "chat">("all");

  return (
    <div className="bento-shell flex h-screen overflow-hidden">
      <SideBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
        {children(activeFilter)}
      </main>
    </div>
  );
};

export default MainLayout;
