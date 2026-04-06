import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────
interface FeatureCard {
  icon: string;
  title: string;
  desc: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

// ── Data ───────────────────────────────────────────────────────────
const NAV_LINKS = ['Home', 'Features', 'Pricing', 'About', 'Sign In'];

const FEATURES: FeatureCard[] = [
  {
    icon: '🧠',
    title: 'Capture Everything',
    desc: 'Save links, tweets, videos, docs, and raw thoughts in one unified space — no friction, no tabs lost forever.',
  },
  {
    icon: '🔗',
    title: 'Connect Knowledge',
    desc: 'Surface hidden connections between your ideas automatically. Your second brain grows smarter as you do.',
  },
  {
    icon: '🔍',
    title: 'Find Anything Instantly',
    desc: 'Semantic search across all your saved content. Find that article from six months ago in seconds, not hours.',
  },
  {
    icon: '✍️',
    title: 'Distill to Insights',
    desc: 'Refine raw captures into structured thoughts, notes, and frameworks. Turn consumption into creation.',
  },
  {
    icon: '🌐',
    title: 'Share Selectively',
    desc: 'Publish a single card or a curated collection with a private link. Share exactly what you want, nothing more.',
  },
  {
    icon: '⚡',
    title: 'Built for Speed',
    desc: 'Keyboard-first, distraction-free interface that gets out of your way. Add a thought in under three seconds.',
  },
];

const PRICING: PricingPlan[] = [
  {
    name: 'Explorer',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect for getting started and building your first knowledge base.',
    features: [
      'Up to 100 cards',
      'Web & tweet capture',
      'Full-text search',
      'Public share links',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Thinker',
    price: '₹299',
    period: 'per month',
    desc: 'For creators and researchers who need unlimited knowledge storage.',
    features: [
      'Unlimited cards',
      'All content types',
      'AI-powered connections',
      'Private collections',
      'Priority support',
    ],
    cta: 'Begin Journey',
    highlighted: true,
  },
  {
    name: 'Studio',
    price: '₹799',
    period: 'per month',
    desc: 'For teams building a shared intelligence layer for deep work.',
    features: [
      'Everything in Thinker',
      'Team workspaces',
      'Shared knowledge graphs',
      'Custom integrations',
      'Dedicated support',
    ],
    cta: 'Contact Us',
    highlighted: false,
  },
];

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4';

// ── Micro-interaction hook ─────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('revealed');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ── Component ──────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal();

  // Glassmorphic nav on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="relative"
      style={{ background: 'hsl(201 100% 13%)', minHeight: '100vh' }}
    >
      {/* ── Sticky Nav ─────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(0,18,36,0.72)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(18px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          {/* Logo */}
          <span
            className="text-2xl tracking-tight cursor-pointer select-none"
            style={{ fontFamily: "'Instrument Serif', serif", color: '#fff' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            SecondBrain<sup className="text-xs ml-0.5">®</sup>
          </span>

          {/* Links */}
          <ul className="hidden md:flex items-center gap-7 list-none m-0 p-0">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase().replace(' ', '-')}`}
                  className="text-sm no-underline transition-all duration-200 relative group"
                  style={{ color: 'hsl(240 4% 66%)' }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = '#fff')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      'hsl(240 4% 66%)')
                  }
                  onClick={(e) => {
                    if (link === 'Sign In') {
                      e.preventDefault();
                      navigate('/auth');
                    }
                  }}
                >
                  {link}
                  <span
                    className="absolute -bottom-0.5 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"
                    style={{ display: 'block' }}
                  />
                </a>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            className="liquid-glass rounded-full px-6 py-2.5 text-sm cursor-pointer transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
            style={{
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
            }}
            onClick={() => navigate('/auth')}
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col overflow-hidden"
      >
        {/* Video */}
        <video
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />

        {/* Subtle bottom fade so sections below have a gradual transition */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent, hsl(201 100% 13%))',
            zIndex: 1,
          }}
        />

        {/* Hero content */}
        <div
          className="relative flex flex-col items-center justify-center text-center flex-1 px-6"
          style={{ zIndex: 10, paddingTop: 120, paddingBottom: 100 }}
        >
          <h1
            className="animate-fade-rise font-normal leading-[0.95] max-w-6xl"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(3rem, 9vw, 6rem)',
              letterSpacing: '-2.46px',
              color: '#fff',
              margin: 0,
            }}
          >
            Where{' '}
            <em className="not-italic" style={{ color: 'hsl(240 4% 66%)' }}>
              dreams
            </em>{' '}
            rise{' '}
            <em className="not-italic" style={{ color: 'hsl(240 4% 66%)' }}>
              through the silence.
            </em>
          </h1>

          <p
            className="animate-fade-rise-delay max-w-2xl leading-relaxed"
            style={{
              color: 'hsl(240 4% 66%)',
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              marginTop: '2rem',
              marginBottom: 0,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            We're designing tools for deep thinkers, bold creators, and quiet
            rebels. Amid the chaos, we build digital spaces for sharp focus and
            inspired work.
          </p>

          <div className="animate-fade-rise-delay-2 flex items-center gap-4 mt-12 flex-wrap justify-center">
            <button
              className="liquid-glass rounded-full cursor-pointer transition-all duration-200 hover:scale-[1.05] active:scale-[0.97] hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]"
              style={{
                paddingLeft: '3.5rem',
                paddingRight: '3.5rem',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
                fontSize: '1rem',
                color: '#fff',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
              }}
              onClick={() => navigate('/auth')}
            >
              Begin Journey
            </button>
            <button
              className="rounded-full cursor-pointer transition-all duration-200 hover:scale-[1.05] active:scale-[0.97]"
              style={{
                paddingLeft: '2rem',
                paddingRight: '2rem',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
                fontSize: '1rem',
                color: 'hsl(240 4% 66%)',
                background: 'transparent',
                border: 'none',
                fontFamily: "'Inter', sans-serif",
              }}
              onClick={() =>
                document
                  .getElementById('features')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              See how it works ↓
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ─────────────────────────────────────── */}
      <section
        id="features"
        className="relative px-6 py-32"
        style={{ background: 'hsl(201 100% 13%)' }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20 reveal">
            <span
              className="text-xs uppercase tracking-[0.3em] mb-4 block"
              style={{ color: 'hsl(240 4% 66%)', fontFamily: "'Inter', sans-serif" }}
            >
              Everything you need
            </span>
            <h2
              className="font-normal leading-tight"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                color: '#fff',
                letterSpacing: '-1px',
                margin: 0,
              }}
            >
              Your knowledge, finally{' '}
              <em className="not-italic" style={{ color: 'hsl(240 4% 66%)' }}>
                organized.
              </em>
            </h2>
            <p
              className="max-w-xl mx-auto mt-5"
              style={{
                color: 'hsl(240 4% 66%)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                lineHeight: 1.7,
              }}
            >
              Stop losing ideas across browser tabs, apps, and notebooks.
              SecondBrain is one place where everything you learn lives and connects.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FeatureCardItem key={f.title} feature={f} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ─────────────────────────────────────── */}
      <section
        id="pricing"
        className="relative px-6 py-32"
        style={{ background: 'hsl(201 100% 10%)' }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20 reveal">
            <span
              className="text-xs uppercase tracking-[0.3em] mb-4 block"
              style={{ color: 'hsl(240 4% 66%)', fontFamily: "'Inter', sans-serif" }}
            >
              Simple pricing
            </span>
            <h2
              className="font-normal leading-tight"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                color: '#fff',
                letterSpacing: '-1px',
                margin: 0,
              }}
            >
              Invest in your{' '}
              <em className="not-italic" style={{ color: 'hsl(240 4% 66%)' }}>
                thinking.
              </em>
            </h2>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PRICING.map((plan, i) => (
              <PricingCardItem key={plan.name} plan={plan} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ──────────────────────────────────────────── */}
      <section
        className="relative px-6 py-28 text-center"
        style={{ background: 'hsl(201 100% 13%)' }}
      >
        <div className="reveal max-w-3xl mx-auto">
          <h2
            className="font-normal mb-6 leading-tight"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              color: '#fff',
              letterSpacing: '-1px',
              margin: 0,
              marginBottom: '1.5rem',
            }}
          >
            Ready to build your second brain?
          </h2>
          <p
            style={{
              color: 'hsl(240 4% 66%)',
              fontFamily: "'Inter', sans-serif",
              marginBottom: '2.5rem',
            }}
          >
            Join thinkers who've stopped losing ideas and started building knowledge.
          </p>
          <button
            className="liquid-glass rounded-full cursor-pointer transition-all duration-200 hover:scale-[1.05] active:scale-[0.97] hover:shadow-[0_0_60px_rgba(255,255,255,0.06)]"
            style={{
              paddingLeft: '3rem',
              paddingRight: '3rem',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              fontSize: '1rem',
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
            }}
            onClick={() => navigate('/auth')}
          >
            Start for Free →
          </button>
        </div>

        <div
          className="mt-16 pt-10 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            maxWidth: '64rem',
            margin: '4rem auto 0',
          }}
        >
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              color: '#fff',
              fontSize: '1.1rem',
            }}
          >
            SecondBrain<sup className="text-xs">®</sup>
          </span>
          <span
            style={{
              color: 'hsl(240 4% 50%)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
            }}
          >
            © 2026 SecondBrain. All rights reserved.
          </span>
        </div>
      </section>

      {/* ── Scroll-reveal styles ──────────────────────────────── */}
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .revealed {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

// ── Feature Card ───────────────────────────────────────────────────
const FeatureCardItem = ({
  feature,
  delay,
}: {
  feature: FeatureCard;
  delay: number;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="reveal rounded-2xl p-7 cursor-default transition-all duration-300"
      style={{
        transitionDelay: `${delay}s`,
        background: hovered
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 60px rgba(0,0,0,0.3)'
          : '0 0 0 rgba(0,0,0,0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="text-3xl mb-4 transition-transform duration-300"
        style={{ transform: hovered ? 'scale(1.15)' : 'scale(1)', display: 'inline-block' }}
      >
        {feature.icon}
      </div>
      <h3
        className="font-normal mb-2"
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '1.25rem',
          color: '#fff',
          margin: 0,
          marginBottom: '0.5rem',
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          color: 'hsl(240 4% 66%)',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.9rem',
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {feature.desc}
      </p>
    </div>
  );
};

// ── Pricing Card ───────────────────────────────────────────────────
const PricingCardItem = ({
  plan,
  delay,
}: {
  plan: PricingPlan;
  delay: number;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="reveal rounded-2xl p-8 transition-all duration-300 relative overflow-hidden"
      style={{
        transitionDelay: `${delay}s`,
        background: plan.highlighted
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(255,255,255,0.025)',
        border: plan.highlighted
          ? '1px solid rgba(255,255,255,0.2)'
          : '1px solid rgba(255,255,255,0.07)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 30px 80px rgba(0,0,0,0.35)'
          : plan.highlighted
          ? '0 8px 40px rgba(0,0,0,0.2)'
          : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {plan.highlighted && (
        <div
          className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.05em',
          }}
        >
          Popular
        </div>
      )}

      <div
        className="text-sm mb-1"
        style={{ color: 'hsl(240 4% 66%)', fontFamily: "'Inter', sans-serif" }}
      >
        {plan.name}
      </div>

      <div className="flex items-baseline gap-1 my-3">
        <span
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '2.5rem',
            color: '#fff',
            lineHeight: 1,
          }}
        >
          {plan.price}
        </span>
        <span
          style={{
            color: 'hsl(240 4% 66%)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.8rem',
          }}
        >
          /{plan.period}
        </span>
      </div>

      <p
        className="mb-6"
        style={{
          color: 'hsl(240 4% 60%)',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.875rem',
          lineHeight: 1.6,
        }}
      >
        {plan.desc}
      </p>

      <ul className="space-y-3 mb-8 list-none p-0 m-0">
        {plan.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-sm"
            style={{ color: 'hsl(240 4% 75%)', fontFamily: "'Inter', sans-serif" }}
          >
            <span style={{ color: '#fff', marginTop: '1px', flexShrink: 0 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        className="w-full rounded-full py-3 text-sm cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: plan.highlighted
            ? 'rgba(255,255,255,0.12)'
            : 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff',
          fontFamily: "'Inter', sans-serif",
          backdropFilter: 'blur(4px)',
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            'rgba(255,255,255,0.18)')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = plan.highlighted
            ? 'rgba(255,255,255,0.12)'
            : 'rgba(255,255,255,0.05)')
        }
        onClick={() => (plan.name !== 'Studio' ? navigate('/auth') : undefined)}
      >
        {plan.cta}
      </button>
    </div>
  );
};

export default LandingPage;