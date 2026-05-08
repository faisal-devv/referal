import React from 'react';
import { Users, Target, Award, Globe } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { number: '10,000+', label: 'Active Partners' },
    { number: '$2M+', label: 'Commissions Paid' },
    { number: '5,000+', label: 'Deals Closed' },
    { number: '50+', label: 'Countries' }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Founded',
      description: 'Started with a vision to connect professionals and monetize networks.'
    },
    {
      year: '2021',
      title: 'First 1,000 Users',
      description: 'Reached our first major milestone with partners across 10 countries.'
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description: 'Expanded operations to 50+ countries with multi-currency support.'
    },
    {
      year: '2024',
      title: '$2M+ Paid',
      description: 'Surpassed two million dollars in commissions paid to our partner network.'
    }
  ];

  const values = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Community First',
      description: 'We believe in building a strong community where everyone can succeed together.'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Results Driven',
      description: 'Our platform is designed to deliver real results for both referrers and businesses.'
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Excellence',
      description: 'We maintain the highest standards in everything we do, from technology to customer service.'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Global Reach',
      description: 'Connect with opportunities worldwide and expand your professional network globally.'
    }
  ];

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden" style={{ background: '#080d18' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Our Mission
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            About Referus.co
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            We're revolutionizing how professionals monetize their networks through technology, trust, and transparency — connecting the right people to the right opportunities.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-slate-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <span className="text-4xl font-bold text-emerald-600 mb-2">{stat.number}</span>
                  <span className="text-slate-500 text-sm text-center">{stat.label}</span>
                </div>
                <div className="hidden md:block w-px bg-slate-200 self-stretch my-4" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Story text */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Our Story</h2>
              <div className="space-y-5">
                <p className="text-slate-500 leading-relaxed">
                  Referus.co was born from a simple observation: professionals have extensive networks but limited ways to monetize them effectively. Traditional referral programs are fragmented, unreliable, and often lack transparency.
                </p>
                <p className="text-slate-500 leading-relaxed">
                  We set out to change that by creating a unified platform that connects businesses with qualified leads while ensuring referrers are fairly compensated for their efforts. Every deal closed is a partnership built on mutual trust.
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Today, we're proud to serve thousands of professionals across multiple industries, helping them turn their networks into sustainable revenue streams with full visibility at every step.
                </p>
              </div>
            </div>

            {/* Right: Timeline card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-8">Our Journey</h3>
              <div className="relative">
                {/* Vertical connecting line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-8">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="relative flex items-start gap-5 pl-2">
                      {/* Year badge circle */}
                      <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="pt-0.5">
                        <div className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-xs font-bold mb-1">
                          {milestone.year}
                        </div>
                        <h4 className="text-slate-900 font-semibold text-sm mb-1">{milestone.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              The principles that guide everything we do — from how we build our platform to how we treat our partners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col items-start hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-400 mb-5">
                  {value.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
