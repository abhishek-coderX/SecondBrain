import { useState } from "react";
import { FileText, LayoutGrid, LogOut, MessageSquareText, PanelLeftClose, PanelLeftOpen, Video, Twitter } from "lucide-react";
import api from "../utils/api";
import { logoutUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { ContentType } from "../types/type";

interface SideBarProps {
  activeFilter: ContentType | "all" | "chat";
  onFilterChange: (filter: ContentType | "all" | "chat") => void;
}

const navItems = [
  { label: "All", filter: "all" as const, icon: LayoutGrid },
  { label: "Thoughts", filter: "thought" as ContentType, icon: MessageSquareText },
  { label: "Twitter", filter: "twitter" as ContentType, icon: Twitter },
  { label: "YouTube", filter: "youtube" as ContentType, icon: Video },
  { label: "Articles", filter: "article" as ContentType, icon: FileText },
];

export const SideBar = ({ activeFilter, onFilterChange }: SideBarProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await api.post("/logout", {});
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      dispatch(logoutUser());
      navigate("/");
    }
  };

  const handleFilterClick = (filter: ContentType | "all" | "chat") => {
    onFilterChange(filter);
    setOpen(false);
  };

  const sidebarContent = (
    <div className="bento-card flex h-full flex-col p-4">
      <div className="px-2 py-2">
        <p className="text-xl font-semibold text-slate-900">SecondBrain</p>
      </div>

      <nav className="mt-4 flex-1 space-y-2">
        {navItems.map(({ label, filter, icon: Icon }) => {
          const isActive = activeFilter === filter;

          return (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              className={`flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-sm font-medium ${
                isActive
                  ? "bg-[rgba(240,169,120,0.18)] text-slate-900 ring-1 ring-[rgba(223,133,82,0.22)]"
                  : "text-slate-600"
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isActive ? "bg-white/80 text-[#9d5229]" : "bg-[rgba(128,161,193,0.1)] text-[#375e7b]"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => handleFilterClick("chat")}
        className={`mt-2 flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left ${
          activeFilter === "chat"
            ? "bg-slate-900 text-white"
            : "bg-[rgba(128,161,193,0.1)] text-slate-800"
        }`}
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${activeFilter === "chat" ? "bg-white/12 text-orange-200" : "bg-white/70 text-[#355a77]"}`}>
          <MessageSquareText className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Ask AI</p>
        </div>
      </button>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center justify-center gap-2 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );

  return (
    <>
      <div className="md:hidden">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="bento-card flex w-full items-center justify-between px-4 py-3"
        >
          <div>
            <p className="text-lg font-semibold text-slate-900">SecondBrain</p>
          </div>
          {open ? <PanelLeftClose className="h-5 w-5 text-slate-700" /> : <PanelLeftOpen className="h-5 w-5 text-slate-700" />}
        </button>
      </div>

      <div className="hidden md:flex md:w-64 md:flex-shrink-0 md:p-4">
        <div className="h-full w-full">{sidebarContent}</div>
      </div>

      {open ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-3 left-3 z-50 w-[calc(100%-24px)] max-w-[320px] md:hidden">{sidebarContent}</div>
        </>
      ) : null}
    </>
  );
};
