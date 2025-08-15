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
// 1. Import useDispatch
import { useDispatch } from "react-redux";

export const SideBar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  // 2. Initialize useDispatch
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.post(
        // 3. Add the correct logout URL
        'http://localhost:4000/logout',
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      // This block runs whether the API call succeeds or fails
      dispatch(logoutUser());
      // 4. Navigate to the auth page
      navigate("/");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 md:hidden">
        <div className="flex items-center space-x-2">
          <Logo size="md" />
          <h1 className="font-bold text-lg">Second Brain</h1>
        </div>
        <button onClick={() => setOpen(!open)}>
          {open ? <CloseIcon size="md" /> : <Hamburger size="md" />}
        </button>
      </div>

      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg
          transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:shadow-none
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center space-x-2 p-4 border-b">
          <Logo size="lg" />
          <h1 className="font-bold text-lg">Second Brain</h1>
        </div>

        <nav className="h-full flex flex-col justify-between p-4">
          <div>
            {/* Navigation Links */}
            <a
              href="#"
              className="flex items-center space-x-2 text-gray-700 hover:text-black mb-4"
            >
              <TwitterIcon size="md" />
              <span className="hidden md:block">Twitter</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-2 text-gray-700 hover:text-black mb-4"
            >
              <YoutubeIcon size="md" />
              <span className="hidden md:block">YouTube</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-2 text-gray-700 hover:text-black"
            >
              <ArticleIcon size="md" />
              <span className="hidden md:block">Docs</span>
            </a>
          </div>
          
          <div>
            <Button onClick={handleLogout} size="md" variant="danger" text="Logout" />
          </div>
        </nav>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black opacity-60 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};