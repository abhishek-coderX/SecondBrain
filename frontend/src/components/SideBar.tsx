import { useState } from "react";
import { TwitterIcon } from "./icons/Twitter";
import { YoutubeIcon } from "./icons/Youtube";
import { ArticleIcon } from "./icons/Article";
import { Logo } from "./icons/Logo";
import { Hamburger } from "./icons/Hamburger";
import { CloseIcon } from "./icons/Close";
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
  { label: "All Logs",    filter: "all" as const,           emoji: "🗺️", IconComp: null },
  { label: "Thoughts",   filter: "thought" as ContentType,  emoji: "💭", IconComp: null },
  { label: "Twitter",    filter: "twitter" as ContentType,  emoji: null, IconComp: TwitterIcon },
  { label: "YouTube",    filter: "youtube" as ContentType,  emoji: null, IconComp: YoutubeIcon },
  { label: "Articles",   filter: "article" as ContentType,  emoji: null, IconComp: ArticleIcon },
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
      <div className="flex items-center justify-between p-4 md:hidden"
        style={{ backgroundColor: '#fffdf7', borderBottom: '2px solid #e8d9b0' }}>
        <div className="flex items-center gap-2">
          <Logo size="md" />
          <span style={{ fontFamily: "'Cinzel', serif", color: '#b8860b', fontWeight: 700 }}>SecondBrain</span>
        </div>
        <button onClick={() => setOpen(!open)} style={{ color: '#b8860b' }}>
          {open ? <CloseIcon size="md" /> : <Hamburger size="md" />}
        </button>
      </div>

      {/* Sidebar panel */}
      <div className={`
          fixed inset-y-0 left-0 z-40 w-64 transform
          transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:shadow-none
          ${open ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
        style={{ backgroundColor: '#fffdf7', borderRight: '2px solid #e8d9b0', boxShadow: '4px 0 20px rgba(180,140,20,0.08)' }}>

        {/* Logo header */}
        <div className="flex items-center gap-3 p-5" style={{ borderBottom: '1px solid #e8d9b0' }}>
          <Logo size="lg" />
          <div>
            <h1 style={{ fontFamily: "'Cinzel', serif", color: '#b8860b', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
              SecondBrain
            </h1>
            <p style={{ color: '#b8a070', fontSize: '0.65rem', fontFamily: "'Cinzel', serif", letterSpacing: '0.12em' }}>
              YOUR LOG POSE
            </p>
          </div>
        </div>

        {/* Nav label */}
        <div className="px-4 pt-5 pb-2">
          <p style={{ color: '#b8a070', fontSize: '0.6rem', fontFamily: "'Cinzel', serif", letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Navigation
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, filter, emoji, IconComp }) => {
            const isActive = activeFilter === filter;
            return (
              <button key={filter} onClick={() => handleFilterClick(filter)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left"
                style={{
                  backgroundColor: isActive ? '#d4a01718' : 'transparent',
                  border: isActive ? '1.5px solid #d4a01750' : '1.5px solid transparent',
                  color: isActive ? '#b8860b' : '#7a6e5a',
                  fontFamily: "'Crimson Text', serif",
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = '#d4a0170a'; e.currentTarget.style.color = '#1a2840'; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#7a6e5a'; } }}
              >
                {emoji && <span className="text-base">{emoji}</span>}
                {IconComp && <IconComp size="sm" />}
                <span>{label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#b8860b' }} />}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-3" style={{ height: '1px', backgroundColor: '#e8d9b0' }} />

        {/* Logout */}
        <div className="p-4">
          <button onClick={handleLogout}
            className="w-full py-2.5 rounded-xl font-bold tracking-wide transition-all"
            style={{ backgroundColor: '#fff5f5', border: '1.5px solid #fca5a5', color: '#b91c1c', fontFamily: "'Cinzel', serif", fontSize: '0.7rem', letterSpacing: '0.08em', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff5f5')}>
            🏴‍☠️ Abandon Ship
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
};