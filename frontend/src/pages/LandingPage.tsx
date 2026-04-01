import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen text-slate-100 bg-cover bg-center"
      // TODO: Replace with an actual background image URL
      style={{ backgroundImage: "url('https://source.unsplash.com/random/1920x1080?abstract')" }}
    >
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400" />
            <span className="text-lg font-semibold tracking-tight">
              SecondBrain
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm">
           
            <button
              onClick={() => navigate("/auth")}
              className="text-slate-300 hover:text-white"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-950 hover:bg-white transition-colors"
            >
              Get started
            </button>
          </nav>

          {/* Mobile auth button */}
          <button
            onClick={() => navigate("/auth")}
            className="md:hidden text-sm px-3 py-1.5 rounded-full border border-slate-700 text-slate-200"
          >
            Get started
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20">
        <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: text */}
          <div className="w-full lg:w-1/2">
            <p className="text-xs tracking-[0.35em] text-slate-400 uppercase">
              Personal knowledge
            </p>

            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight font-serif">
              Your second brain
              <span className="block">for everything you think.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-xl">
              Second Brain is your personal knowledge system where ideas,
              notes, links, and highlights live together. Capture anything,
              connect concepts, and retrieve them in seconds&mdash;without
              searching through endless tabs and documents.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate("/auth")}
                className="px-6 py-3 rounded-full text-sm sm:text-base font-medium bg-slate-100 text-slate-950 hover:bg-white transition-colors"
              >
                Start your second brain
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="text-sm sm:text-base text-slate-300 hover:text-white"
              >
                Already have an account? <span className="underline">Sign in</span>
              </button>
            </div>
          </div>

          {/* Right: simple visual block */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-[4/3] w-full rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.45),transparent_60%),radial-gradient(circle_at_bottom,_rgba(244,114,182,0.35),transparent_60%)]" />

              <div className="relative h-full flex flex-col justify-between p-6 sm:p-8">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300/80">
                    Today &mdash; 2025
                  </p>
                  <p className="text-2xl sm:text-3xl font-serif leading-snug">
                    A quiet space
                    <br />
                    for your loudest ideas.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3">
                    <p className="text-slate-400">Saved this week</p>
                    <p className="mt-1 text-lg font-semibold">37 items</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3">
                    <p className="text-slate-400">Collections</p>
                    <p className="mt-1 text-lg font-semibold">Ideas • Reading • Build</p>
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-400">
                  Notes, links, tweets, highlights &mdash; all stitched into one
                  searchable memory.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;