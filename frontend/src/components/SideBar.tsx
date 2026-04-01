import { useState } from "react";
import { TwitterIcon } from "./icons/Twitter";
import { YoutubeIcon } from "./icons/Youtube";
import { ArticleIcon } from "./icons/Article";
import { Logo } from "./icons/Logo";
import { Hamburger } from "./icons/Hamburger";
import { CloseIcon } from "./icons/Close";
import { Button } from "./ui/Button";
import axios from "axios";
import { logoutUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { ContentType } from "../types/type";

interface SideBarProps {
  activeFilter: ContentType | "all";
  onFilterChange: (filter: ContentType | "all") => void;
}

const NAV_ITEMS = [
  { label: "All Content", filter: "all" as const,      icon: null },
  { label: "Thoughts",    filter: "thought" as ContentType, icon: "💭" },
  { label: "Twitter",     filter: "twitter" as ContentType, icon: null, IconComp: TwitterIcon },
  { label: "YouTube",     filter: "youtube" as ContentType, icon: null, IconComp: YoutubeIcon },
  { label: "Articles",    filter: "article" as ContentType, icon: null, IconComp: ArticleIcon },
];

export const SideBar = ({ activeFilter, onFilterChange }: SideBarProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      dispatch(logoutUser());
      navigate("/");
    }
  };

  const handleFilterClick = (filter: ContentType | "all") => {
    onFilterChange(filter);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between p-4 md:hidden border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Logo size="md" />
          <h1 className="font-bold text-lg">Second Brain</h1>
        </div>
        <button onClick={() => setOpen(!open)}>
          {open ? <CloseIcon size="md" /> : <Hamburger size="md" />}
        </button>
      </div>

      {/* Sidebar panel */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg border-r border-gray-100
          transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:shadow-none
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo header */}
        <div className="flex items-center space-x-2 p-5 border-b border-gray-100">
          <Logo size="lg" />
          <h1 className="font-bold text-lg tracking-tight">Second Brain</h1>
        </div>

        <nav className="h-[calc(100%-73px)] flex flex-col justify-between p-4">
          <div className="space-y-1">
            {NAV_ITEMS.map(({ label, filter, icon, IconComp }) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150 text-left
                    ${isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  {icon && <span className="text-base">{icon}</span>}
                  {IconComp && <IconComp size="md" />}
                  {!icon && !IconComp && <Logo size="md" />}
                  <span>{label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>

          <div>
            <Button onClick={handleLogout} size="md" variant="danger" text="Logout" />
          </div>
        </nav>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black opacity-60 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};