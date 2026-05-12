import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  DollarSign,
  Users,
  Shield,
  MessageCircle,
  Building2,
  CreditCard,
  Home,
  Wrench,
  X,
  Globe,
  BarChart3,
  Zap,
  ChevronRight,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ContactForm from '../components/Forms/ContactForm';
import AuthModal from '../components/Auth/AuthModal';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/* ─── hooks ─────────────────────────────────────────────────────── */

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const useCountUp = (target, inView, duration = 1800) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView || !target) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return val;
};

/* ─── static data ────────────────────────────────────────────────── */

const HOW_IT_WORKS = [
  {
    number: '01',
    icon: <Users className="h-5 w-5" />,
    title: 'Create Your Free Account',
    description: 'Sign up in under 2 minutes. No credit card, no monthly fee. Completely free.',
  },
  {
    number: '02',
    icon: <ArrowRight className="h-5 w-5" />,
    title: 'Submit a Lead',
    description: "Know someone who needs IT, real estate, banking, or construction services? Submit their contact.",
  },
  {
    number: '03',
    icon: <DollarSign className="h-5 w-5" />,
    title: 'Get Paid When It Closes',
    description: 'Our team handles the entire sales process. Once the deal closes, your commission hits your wallet.',
  },
];

const INDUSTRIES = [
  {
    icon: <Building2 className="h-7 w-7" />,
    title: 'IT & ERP Services',
    description: 'Software development, ERP implementation, cloud solutions, cybersecurity, digital transformation.',
    modalDescription: 'Connect businesses with trusted IT and ERP service providers for software development, ERP implementation, cloud solutions, cybersecurity, digital transformation, website development, and technology consulting.',
    color: 'bg-blue-500',
    badge: 'bg-blue-500/10 text-blue-400',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
  {
    icon: <CreditCard className="h-7 w-7" />,
    title: 'Banking & Finance',
    description: 'Credit cards, personal loans, business financing, home mortgages, mutual funds, and more.',
    modalDescription: 'Refer people or businesses for banking and financial solutions through verified partners. Services may include credit cards, personal loans, business financing, home mortgages, insurance, mutual funds, and other financial products depending on country availability and partner network.',
    color: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-400',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
  {
    icon: <Home className="h-7 w-7" />,
    title: 'Real Estate',
    description: 'Property buying, selling, rentals, commercial spaces, investments, and mortgage solutions.',
    modalDescription: 'Refer individuals or companies looking for real estate opportunities including property buying, selling, rentals, commercial spaces, real estate investments, and mortgage-related solutions through verified partners.',
    color: 'bg-violet-500',
    badge: 'bg-violet-500/10 text-violet-400',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
  {
    icon: <Wrench className="h-7 w-7" />,
    title: 'Construction & Interior Design',
    description: 'Construction, renovation, architecture, fit-out, interior design, project management.',
    modalDescription: 'Refer clients for construction, renovation, architecture, fit-out, interior design, and project management services through verified partners.',
    color: 'bg-orange-500',
    badge: 'bg-orange-500/10 text-orange-400',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
  {
    icon: <Shield className="h-7 w-7" />,
    title: 'Insurance',
    description: 'Health, life, motor, travel, business insurance, and other protection solutions.',
    modalDescription: 'Help individuals and businesses connect with verified insurance providers for health insurance, life insurance, motor insurance, travel insurance, business insurance, and other protection solutions.',
    color: 'bg-teal-500',
    badge: 'bg-teal-500/10 text-teal-400',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
];

const WHY_US = [
  {
    icon: <Globe className="h-6 w-6 text-emerald-400" />,
    title: 'Multi-Currency Payouts',
    description: 'Receive your earnings in USD, AED, EUR, or SAR. Whichever works for you.',
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-emerald-400" />,
    title: 'Real-Time Lead Tracking',
    description: 'See exactly where your lead is in the sales pipeline, updated live.',
  },
  {
    icon: <Zap className="h-6 w-6 text-emerald-400" />,
    title: 'Zero Upfront Cost',
    description: 'No subscription, no setup fee. You only earn. We never charge you.',
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-emerald-400" />,
    title: 'Dedicated Support',
    description: 'Our team is on live chat to answer any question about a lead you submitted.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'I referred a tech startup and earned $2,400 within 3 weeks. The platform made the whole process completely effortless.',
    name: 'Ahmed K.',
    role: 'IT Consultant',
    location: 'Dubai, UAE',
    earned: '$2,400',
    stars: 5,
  },
  {
    quote: "Never thought my real estate contacts could earn me passive income. This is the smartest side income I've ever set up.",
    name: 'Sarah M.',
    role: 'Property Manager',
    location: 'Abu Dhabi, UAE',
    earned: 'AED 15,000',
    stars: 5,
  },
  {
    quote: "The dashboard is incredibly clear. I can track every lead and know exactly when I am getting paid.",
    name: 'James R.',
    role: 'Financial Advisor',
    location: 'London, UK',
    earned: '$890',
    stars: 5,
  },
];

/* ─── component ──────────────────────────────────────────────────── */

const HomePage = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen]   = useState(false);
  const [userStats, setUserStats]               = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Scroll animation observers
  const [statsRef,    statsInView]    = useInView(0.3);
  const [howRef,      howInView]      = useInView(0.1);
  const [indRef,      indInView]      = useInView(0.1);
  const [whyRef,      whyInView]      = useInView(0.1);
  const [testiRef,    testiInView]    = useInView(0.1);
  const [ctaRef,      ctaInView]      = useInView(0.2);

  // Count-up for stats (static baseline values)
  const leadsCount  = useCountUp(2400, statsInView);
  const dealsCount  = useCountUp(840,  statsInView);
  const earnedCount = useCountUp(890,  statsInView);

  useEffect(() => {
    if (!isAuthenticated) { setUserStats(null); return; }
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    Promise.all([
      fetch(`${API_BASE_URL}/leads`,  { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE_URL}/wallet`, { headers }).then(r => r.ok ? r.json() : {}),
    ]).then(([leads, wallet]) => {
      const activeLeads     = leads.filter(l => ['Pending','Contacted','Proposal Submitted'].includes(l.status)).length;
      const successfulDeals = leads.filter(l => l.status === 'Deal Closed').length;
      const totalEarnings   = (wallet.usd || 0) + (wallet.aed || 0) + (wallet.euro || 0) + (wallet.sar || 0);
      setUserStats({ totalEarnings, activeLeads, successfulDeals });
    }).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    const handleEscape = e => { if (e.key === 'Escape' && isModalOpen) handleCloseModal(); };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleIndustryClick = industry => { setSelectedIndustry(industry); setIsModalOpen(true); };
  const handleCloseModal    = () => { setIsModalOpen(false); setSelectedIndustry(null); };
  const handleReferNow      = () => {
    handleCloseModal();
    if (isAuthenticated) navigate('/dashboard');
    else setIsAuthModalOpen(true);
  };
  const handleGetStarted    = () => setIsAuthModalOpen(true);
  const scrollToContact     = () =>
    document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="min-h-screen bg-white">

      {/* ── TICKER BANNER ────────────────────────────────────────── */}
      <div className="bg-emerald-500 overflow-hidden py-2.5">
        <div className="flex w-max animate-marquee">
          {[0, 1].map(group => (
            <div key={group} className="flex shrink-0">
              {[...Array(8)].map((_, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-white text-sm font-semibold px-10">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  The first global lead referral platform
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── 1. HERO ──────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 overflow-hidden">

        {/* Background photo — dark fiber optics with green/blue glow */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1488229297570-58520851e868?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")' }}
        />

        {/* Heavy dark overlay so image provides texture without clashing */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,13,24,0.92) 0%, rgba(8,13,24,0.85) 50%, rgba(8,13,24,0.93) 100%)' }} />

        {/* Glow orbs layered on top for extra depth */}
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Pill tag */}
          <div className="flex justify-center mb-8">
            <span
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium px-4 py-1.5 rounded-full animate-bounce-slight"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Earn commissions, free to join
            </span>
          </div>

          {/* Animated headline, word by word */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight max-w-4xl mx-auto mb-6">
            {[
              { text: 'Every Business Starts With a Connection.', cls: 'text-white' },
              { text: 'We Just Made It Pay.',      cls: 'text-emerald-400' },
            ].map((part, i) => (
              <span
                key={i}
                className={`${part.cls} inline-block animate-word-reveal`}
                style={{ animationDelay: `${0.05 + i * 0.17}s` }}
              >
                {part.text}{i < 3 ? ' ' : ''}
              </span>
            ))}
          </h1>

          {/* Sub-headline */}
          <p
            className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.75s' }}
          >
            Referus connects referrers with businesses looking for leads. Submit a contact,
            our channel partners close the deal, and you earn a commission. Zero risk, zero cost.
          </p>

          {/* 3-step mini flow */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            {HOW_IT_WORKS.map((step, i) => (
              <React.Fragment key={i}>
                <div
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3.5 w-full sm:w-auto animate-fade-in-up"
                  style={{ animationDelay: `${0.9 + i * 0.1}s` }}
                >
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-emerald-500/30">
                    {i + 1}
                  </div>
                  <span className="text-slate-200 text-sm font-medium whitespace-nowrap">
                    {['Submit a Lead', 'Channel Partners Close the Deal', 'You Get Paid'][i]}
                  </span>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ChevronRight className="hidden sm:block text-slate-600 h-4 w-4 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in-up"
            style={{ animationDelay: '1.15s' }}
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 text-base"
              >
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 text-base"
                >
                  Start Referring Free <ArrowRight className="h-5 w-5" />
                </button>
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-base"
                >
                  See How It Works
                </Link>
              </>
            )}
          </div>

          {/* Trust chips */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 animate-fade-in-up"
            style={{ animationDelay: '1.3s' }}
          >
            {['Free to join', 'No monthly fees', 'Multi-currency payouts', 'Instant wallet deposits'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. STATS BAR ─────────────────────────────────────────── */}
      <section ref={statsRef} className="bg-white border-b border-slate-100 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              {
                value: userStats ? userStats.activeLeads    : `${leadsCount.toLocaleString()}+`,
                label: 'Leads Submitted',
              },
              {
                value: userStats ? userStats.successfulDeals : `${dealsCount}+`,
                label: 'Deals Closed',
              },
              {
                value: userStats
                  ? `$${userStats.totalEarnings.toFixed(0)}`
                  : `$${earnedCount}K+`,
                label: 'Total Paid Out',
              },
              { value: '5', label: 'Industries Covered' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p className="text-3xl sm:text-4xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ──────────────────────────────────────── */}
      <section ref={howRef} className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className={`text-center mb-16 transition-all duration-700 ${howInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-emerald-500 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Simple. Transparent. Rewarding.</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              No complicated forms, no chasing payments. Three steps from first referral to earning.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            <div className="hidden lg:block absolute top-10 left-[33%] right-[33%] h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={i}
                className={`relative flex flex-col items-center text-center bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-700 ${howInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${200 + i * 150}ms` }}
              >
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 relative z-10">
                  <span className="text-white font-bold text-xl">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className={`text-center mt-12 transition-all duration-700 delay-700 ${howInView ? 'opacity-100' : 'opacity-0'}`}>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors group"
            >
              Read the full guide
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. INDUSTRIES ────────────────────────────────────────── */}
      <section ref={indRef} className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className={`text-center mb-16 transition-all duration-700 ${indInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-emerald-500 font-semibold text-sm uppercase tracking-widest mb-3">Industries</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Five High-Value Industries</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Click any industry to learn more and submit your first lead in that sector.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((industry, i) => (
              <button
                key={i}
                onClick={() => handleIndustryClick(industry)}
                className={`text-left group border border-slate-100 rounded-2xl p-6 hover:shadow-xl hover:border-slate-200 cursor-pointer transition-all duration-500 hover:-translate-y-1 ${indInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${150 + i * 80}ms` }}
              >
                <div className={`w-12 h-12 ${industry.color} rounded-xl flex items-center justify-center text-white mb-5 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  {industry.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{industry.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{industry.description}</p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${industry.badge}`}>
                  Submit a lead <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. WHY REFERUS ───────────────────────────────────────── */}
      <section ref={whyRef} className="bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className={`text-center mb-16 transition-all duration-700 ${whyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-emerald-400 font-semibold text-sm uppercase tracking-widest mb-3">Why Referus</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for Referrers, Not Salespeople
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              You don't need sales skills. You just need to know the right people.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item, i) => (
              <div
                key={i}
                className={`bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all duration-500 ${whyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${150 + i * 100}ms` }}
              >
                <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. TESTIMONIALS ──────────────────────────────────────── */}
      <section ref={testiRef} className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className={`text-center mb-16 transition-all duration-700 ${testiInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-emerald-500 font-semibold text-sm uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Real People. Real Earnings.</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Referrers across the UAE, UK, and beyond are already earning with Referus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`bg-white border border-slate-100 rounded-2xl p-7 shadow-sm flex flex-col hover:shadow-md transition-all duration-500 ${testiInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${150 + i * 120}ms` }}
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role} · {t.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Earned</p>
                    <p className="font-bold text-emerald-600 text-sm">{t.earned}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FINAL CTA ─────────────────────────────────────────── */}
      <section ref={ctaRef} className="bg-gradient-to-br from-emerald-600 to-emerald-700 py-24 overflow-hidden relative">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full pointer-events-none" />

        <div
          className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-700 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Turn Your Network Into Income?
          </h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of professionals already submitting leads and earning commissions across five high-value industries.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-xl hover:-translate-y-0.5 text-base"
              >
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-xl hover:-translate-y-0.5 text-base"
                >
                  Submit Your First Lead Free <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={scrollToContact}
                  className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white/80 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-base"
                >
                  <MessageCircle className="h-5 w-5" />
                  Talk to Us
                </button>
              </>
            )}
          </div>
          <p className="text-emerald-200 text-sm mt-6">No credit card required · Takes 2 minutes · Free forever</p>
        </div>
      </section>

      {/* ── 8. CONTACT ───────────────────────────────────────────── */}
      <section id="contact-form-section" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactForm />
        </div>
      </section>

      {/* ── INDUSTRY MODAL ───────────────────────────────────────── */}
      {isModalOpen && selectedIndustry && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={selectedIndustry.image}
                alt={selectedIndustry.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-4 left-5 flex items-center gap-3">
                <div className={`w-10 h-10 ${selectedIndustry.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  {selectedIndustry.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">{selectedIndustry.title}</h3>
                  <p className="text-white/70 text-xs">Referral Opportunity</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-600 leading-relaxed mb-6">
                {selectedIndustry.modalDescription}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReferNow}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  Refer Now <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { handleCloseModal(); scrollToContact(); }}
                  className="flex-1 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-3 px-5 rounded-xl transition-colors"
                >
                  Ask a Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultToRegister={true}
      />
    </div>
  );
};

export default HomePage;
