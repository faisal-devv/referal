import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is Referus.co and how does it work?',
        a: 'Referus.co is a referral platform that lets you earn money by connecting businesses with the services they need. You submit a lead — a potential client looking for IT, real estate, construction, finance, or insurance services — and when that lead converts into a successful deal, you earn a commission.',
      },
      {
        q: 'Is it free to join Referus.co?',
        a: 'Yes, creating an account on Referus.co is completely free. There are no subscription fees or hidden charges. You only earn — you never pay.',
      },
      {
        q: 'Who can join as a referrer?',
        a: "Anyone can join! Whether you're a freelancer, professional, business owner, or simply someone with a wide network, you can sign up and start submitting leads. No industry-specific background is required.",
      },
    ],
  },
  {
    category: 'Submitting Leads',
    items: [
      {
        q: 'What information do I need to submit a lead?',
        a: "You'll need the prospect's full name, company name, email address, mobile number, industry, and a brief description of their requirements. The more detail you provide, the higher the chance of a successful deal.",
      },
      {
        q: 'Can I submit leads from any country?',
        a: 'Yes. Referus.co operates globally. You can submit leads from any country, and our team will follow up with the prospect regardless of their location.',
      },
      {
        q: 'How many leads can I submit?',
        a: 'There is no limit. You can submit as many leads as you like. The more quality leads you submit, the more you can potentially earn.',
      },
      {
        q: 'What happens after I submit a lead?',
        a: 'Our team reviews your lead and reaches out to the prospect. You can track the status of each lead in real time on your dashboard — statuses include Pending, Contacted, Proposal Submitted, Deal Closed, and Client Refused.',
      },
    ],
  },
  {
    category: 'Earnings & Commissions',
    items: [
      {
        q: 'How much can I earn per referral?',
        a: 'Earnings depend on the type of product or service and the sector of the referral. There is no fixed amount or percentage, as rewards may vary based on the referral category, partner structure, and successful deal closure.',
      },
      {
        q: 'When do I get paid?',
        a: 'Your earnings are credited to your wallet once a deal is successfully closed and confirmed by our team. You can then request a withdrawal at any time through the Wallet page.',
      },
      {
        q: 'What currencies are supported for withdrawals?',
        a: 'We support withdrawals in USD, AED, EUR, and SAR. Your wallet tracks balances in all four currencies. You can also view your total balance in any of 150+ world currencies using the currency selector in the top navigation.',
      },
      {
        q: 'Is there a minimum withdrawal amount?',
        a: '__WITHDRAWAL_DYNAMIC__',
      },
    ],
  },
  {
    category: 'Lead Status & Tracking',
    items: [
      {
        q: 'What do the different lead statuses mean?',
        a: 'Pending — your lead has been received and is awaiting review. Contacted — our team has reached out to the prospect. Proposal Submitted — a formal proposal has been sent to the prospect. Deal Closed — the deal was successfully completed and your commission is being processed. Client Refused — the prospect declined to proceed.',
      },
      {
        q: 'Can I edit or delete a lead after submitting it?',
        a: 'Yes. Users have the option to edit their submitted leads directly from the platform whenever required.',
      },
    ],
  },
  {
    category: 'Account & Security',
    items: [
      {
        q: 'How do I reset my password?',
        a: "Click \"Forgot password?\" on the login screen and enter your email address. You'll receive a password reset link valid for 1 hour. If you don't receive the email, check your spam folder.",
      },
      {
        q: 'Is my personal data safe?',
        a: 'Yes. We take data security seriously. All data is encrypted in transit (HTTPS) and at rest. We never share your personal information with third parties without your consent.',
      },
      {
        q: 'Can I have multiple accounts?',
        a: 'No. Each person is permitted one account. Duplicate accounts may be suspended. If you need to update your email address, please contact our support team.',
      },
    ],
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-medium text-slate-900 pr-4">{q}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-all duration-200 ${
            open ? 'rotate-180 text-emerald-400' : 'text-slate-400'
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100">
          <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

const FAQPage = () => {
  const [minWithdrawal, setMinWithdrawal] = useState(10);
  const [processingDays, setProcessingDays] = useState('2-3');

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/settings/public`)
      .then(r => r.json())
      .then(d => {
        if (d.minWithdrawalUSD) setMinWithdrawal(d.minWithdrawalUSD);
        if (d.withdrawalProcessingDays) setProcessingDays(d.withdrawalProcessingDays);
      })
      .catch(() => {});
  }, []);

  const resolveAnswer = (a) =>
    a === '__WITHDRAWAL_DYNAMIC__'
      ? `Yes, the minimum withdrawal amount is $${minWithdrawal} USD (or equivalent). Withdrawal requests are typically processed within ${processingDays} business days.`
      : a;

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden" style={{ background: '#080d18' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Help Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about Referus.co. Can't find what you're looking for?{' '}
            <a href="/contact" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors">
              Contact us
            </a>
            .
          </p>
        </div>
      </section>

      {/* FAQ Body */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {faqs.map(section => (
            <div key={section.category}>
              <div className="flex items-center gap-3 mb-5">
                <HelpCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="text-emerald-600 text-xs font-bold uppercase tracking-widest">
                  {section.category}
                </span>
              </div>
              <div className="space-y-2">
                {section.items.map(item => (
                  <FAQItem key={item.q} q={item.q} a={resolveAnswer(item.a)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bar */}
      <section className="py-14" style={{ background: '#0d1117' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-slate-400 mb-7">Our team is happy to help you get started.</p>
          <a
            href="/contact"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-7 py-3 rounded-lg transition-colors duration-200"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
