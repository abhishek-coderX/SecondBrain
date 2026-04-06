import React, { useState } from "react";
import { SideBar } from "../components/SideBar";
import type { ContentType } from "../types/type";

interface MainLayoutProps {
  children: (activeFilter: ContentType | "all") => React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [activeFilter, setActiveFilter] = useState<ContentType | "all">("all");

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#faf8f2' }}>
      <SideBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#faf8f2' }}>
        {children(activeFilter)}
      </main>
    </div>
  );
};

export default MainLayout;
