import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Link2,
  Search,
  Share2,
  Youtube,
} from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "Capture from anywhere",
    description: "Drop in articles, videos, tweets, and private notes without changing the way you already work.",
  },
  {
    icon: Search,
    title: "Retrieve by meaning",
    description: "Semantic search turns scattered saves into a library you can actually interrogate later.",
  },
  {
    icon: Bot,
    title: "Ask your brain",
    description: "Get grounded answers based on your saved context instead of vague summaries from the open web.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bento-shell min-h-screen py-5 md:py-8">
      <div className="bento-container">
        <header className="bento-card bento-shadow-hover px-5 py-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-2xl font-semibold text-slate-900">SecondBrain</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="bento-button bento-button-primary" onClick={() => navigate("/auth")}>
                Open App
              </button>
            </div>
          </div>
        </header>

        <main className="mt-5 grid gap-5 lg:grid-cols-12">
          <section className="bento-card bento-card-strong lg:col-span-7">
            <div className="grid gap-8 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bento-pill bg-[rgba(128,161,193,0.14)] text-[#345b78]">Grounded AI answers</span>
              </div>

              <div className="max-w-2xl">
                <h1 className="text-5xl font-semibold leading-none text-slate-900 md:text-7xl">
                  Build a calmer home for everything worth remembering.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                  SecondBrain turns scattered saves into a modular personal knowledge base with search, AI recall, and a dashboard that feels intentionally organized.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="bento-button bento-button-primary" onClick={() => navigate("/auth")}>
                  Start capturing
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button className="bento-button bento-button-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  See the system
                </button>
              </div>
            </div>
          </section>

          <section className="bento-card overflow-hidden pb-4 lg:col-span-5">
            <div className="grid gap-4 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Live preview</p>
                <span className="rounded-full bg-[rgba(22,163,74,0.12)] px-3 py-1 text-xs font-semibold text-[#166534]">
                  Synced
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[rgba(125,105,86,0.14)] bg-white/80 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(255,0,0,0.08)] text-[#b91c1c]">
                    <Youtube className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">System design lecture</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Captured from YouTube with notes and tags.</p>
                </div>

                <div className="rounded-[22px] border border-[rgba(125,105,86,0.14)] bg-[rgba(128,161,193,0.12)] p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-[#335b77]">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Find by concept</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">Search for “caching” and retrieve relevant memories instantly.</p>
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-900 p-5 text-[#fff8ef]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Ask Brain</p>
                  <Share2 className="h-4 w-4 text-orange-200" />
                </div>
                <p className="mt-4 text-sm text-slate-200">“What did I save last month about vector databases?”</p>
                <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-100">
                  You saved three articles and one note about embeddings, retrieval quality, and hybrid search trade-offs.
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="lg:col-span-12">
            <div className="grid gap-5 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <article key={title} className="bento-card bento-shadow-hover p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(240,169,120,0.16)] text-[#9a4f23]">
                    <Icon className="h-5 w-5" />
                  </div>
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="bento-card lg:col-span-12">
            <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
              <div>
                <span className="bento-pill mb-4">Workflow</span>
                <h2 className="text-4xl font-semibold text-slate-900 md:text-5xl">A dashboard that stays scannable even when your brain gets busy.</h2>
              </div>
              <div className="grid gap-3">
                {[
                  "Capture content in a few seconds with structured fields and tags.",
                  "Browse a modular board with dedicated surfaces for each content type.",
                  "Share selected notes with a link when you want others to see your curated context.",
                ].map((item) => (
                  <div key={item} className="rounded-[22px] border border-[rgba(125,105,86,0.14)] bg-white/70 p-4">
                    <div className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#df8552]" />
                      <p className="text-sm leading-6 text-slate-700">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>



        </main>
      </div>
    </div>
  );
};

export default LandingPage;
