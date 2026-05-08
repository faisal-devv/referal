import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  FileText,
  Eye,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Building2,
  CreditCard,
  Home,
  Wrench,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/Auth/AuthModal';

const HowItWorksPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    if (isAuthenticated) navigate('/dashboard');
    else setIsAuthModalOpen(true);
  };

  const handleContactUsClick = () => {
    setTimeout(() => {
      const contactFormElement = document.getElementById('contact-form-section');
      if (contactFormElement) {
        contactFormElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description: 'Sign up for free with your email and basic information. No credit card required.',
      icon: <UserPlus className="h-6 w-6" />,
      details: [
        'Complete your profile in under 2 minutes',
        'Verify your email address',
        'Set up your payment preferences'
      ]
    },
    {
      number: '02',
      title: 'Submit Qualified Leads',
      description: 'Submit leads in IT, Banking, Real Estate, Construction, or Insurance with detailed information.',
      icon: <FileText className="h-6 w-6" />,
      details: [
        'Provide company and contact information',
        'Describe the opportunity in detail',
        'Set estimated deal value and timeline'
      ]
    },
    {
      number: '03',
      title: 'Track Your Progress',
      description: 'Monitor lead status updates and communication in real-time.',
      icon: <Eye className="h-6 w-6" />,
      details: [
        'Real-time status updates',
        'Direct communication with our team',
        'Progress tracking dashboard'
      ]
    },
    {
      number: '04',
      title: 'Get Paid',
      description: 'Receive commissions when your leads convert into successful deals.',
      icon: <DollarSign className="h-6 w-6" />,
      details: [
        'Commission rates: 0.5–10% depending on industry',
        'Multiple payment methods',
        'Transparent fee structure'
      ]
    }
  ];

  const industries = [
    {
      icon: <Building2 className="h-6 w-6" />,
      iconColor: 'bg-blue-500/10 text-blue-600',
      title: 'IT & ERP Services',
      description: 'Software development, ERP implementation, cloud solutions, cybersecurity, digital transformation.',
      examples: [
        'Software development projects',
        'ERP implementation',
        'Cloud migration and cybersecurity',
        'Digital transformation consulting'
      ]
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      iconColor: 'bg-emerald-500/10 text-emerald-600',
      title: 'Banking & Finance',
      description: 'Credit cards, personal loans, business financing, home mortgages, mutual funds, and more.',
      examples: [
        'Personal and business loans',
        'Home mortgages',
        'Credit cards and mutual funds',
        'Business financing solutions'
      ]
    },
    {
      icon: <Home className="h-6 w-6" />,
      iconColor: 'bg-violet-500/10 text-violet-600',
      title: 'Real Estate',
      description: 'Property buying, selling, rentals, commercial spaces, investments, and mortgage solutions.',
      examples: [
        'Property buying and selling',
        'Residential and commercial rentals',
        'Real estate investments',
        'Mortgage-related solutions'
      ]
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      iconColor: 'bg-orange-500/10 text-orange-600',
      title: 'Construction & Interior Design',
      description: 'Construction, renovation, architecture, fit-out, interior design, project management.',
      examples: [
        'Construction and renovations',
        'Architecture and fit-out',
        'Interior design projects',
        'Project management services'
      ]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      iconColor: 'bg-rose-500/10 text-rose-600',
      title: 'Insurance',
      description: 'Health, life, motor, travel, business insurance, and other protection solutions.',
      examples: [
        'Health and life insurance',
        'Motor and travel insurance',
        'Business insurance',
        'Other protection solutions'
      ]
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
            Channel Partner Program
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            How It Works
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Turn your professional network into a revenue stream in four simple steps. No experience required — just your connections.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Four Simple Steps</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              From sign-up to your first commission payout — here's exactly how it works.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 relative overflow-hidden"
              >
                {/* Large background number */}
                <span className="absolute top-4 right-6 text-5xl font-bold text-emerald-500/20 leading-none select-none">
                  {step.number}
                </span>
                {/* Icon badge */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500 text-white mb-5">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 mb-5 leading-relaxed">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, di) => (
                    <li key={di} className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-500 text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Industries We Cover
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Submit leads across multiple high-value industries and grow your earnings
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0 ${industry.iconColor}`}>
                    {industry.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{industry.title}</h3>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">{industry.description}</p>
                <div className="mt-auto">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Common Opportunities</h4>
                  <ul className="space-y-2">
                    {industry.examples.map((example, ei) => (
                      <li key={ei} className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="text-slate-500 text-sm">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 py-20 overflow-hidden relative">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of professionals already earning commissions by referring clients through Referus.co.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-xl hover:-translate-y-0.5"
              >
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <button
                onClick={handleGetStartedClick}
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-xl hover:-translate-y-0.5"
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleContactUsClick}
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 hover:border-white/80 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultToRegister={true}
      />
    </div>
  );
};

export default HowItWorksPage;
