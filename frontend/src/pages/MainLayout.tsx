import React, { useState } from "react";
import { SideBar } from "../components/SideBar";
import type { ContentType } from "../types/type";

interface MainLayoutProps {
  children: (activeFilter: ContentType | "all") => React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [activeFilter, setActiveFilter] = useState<ContentType | "all">("all");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <main className="flex-1 p-6 overflow-auto">
        {children(activeFilter)}
      </main>
    </div>
  );
};

export default MainLayout;
