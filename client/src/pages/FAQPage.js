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
        a: 'Anyone can join! Whether you\'re a freelancer, professional, business owner, or simply someone with a wide network, you can sign up and start submitting leads. No industry-specific background is required.',
      },
    ],
  },
  {
    category: 'Submitting Leads',
    items: [
      {
        q: 'What information do I need to submit a lead?',
        a: 'You\'ll need the prospect\'s full name, company name, email address, mobile number, industry, and a brief description of their requirements. The more detail you provide, the higher the chance of a successful deal.',
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
        a: 'Commission rates vary by industry. IT & Software leads earn 5–10% of the project value. Construction leads earn 5–10% of the labor cost. Real Estate leads earn 1–3% of the transaction value. Banking & Finance leads earn 0.5–2% depending on the product. Insurance leads vary based on policy value. Contact us for exact rates on your specific lead.',
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
        a: 'You can view and manage your leads from the My Leads page. Contact our support team if you need to update critical details on an already-submitted lead.',
      },
    ],
  },
  {
    category: 'Account & Security',
    items: [
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot password?" on the login screen and enter your email address. You\'ll receive a password reset link valid for 1 hour. If you don\'t receive the email, check your spam folder.',
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
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-900 pr-4">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white">
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

const FAQPage = () => {
  const [minWithdrawal, setMinWithdrawal] = useState(10);
  const [processingDays, setProcessingDays] = useState('3-5');

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
  <div className="min-h-screen bg-gray-50">
    {/* Hero */}
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <HelpCircle className="h-7 w-7 text-blue-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-500">
          Everything you need to know about Referus.co. Can't find what you're looking for?{' '}
          <a href="/contact" className="text-blue-700 hover:underline">Contact us</a>.
        </p>
      </div>
    </div>

    {/* FAQ sections */}
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {faqs.map(section => (
        <div key={section.category}>
          <h2 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-4">
            {section.category}
          </h2>
          <div className="space-y-2">
            {section.items.map(item => (
              <FAQItem key={item.q} q={item.q} a={resolveAnswer(item.a)} />
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* CTA */}
    <div className="bg-blue-700 mt-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Still have questions?</h3>
        <p className="text-blue-200 mb-6">Our team is happy to help you get started.</p>
        <a
          href="/contact"
          className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Get in Touch
        </a>
      </div>
    </div>
  </div>
  );
};

export default FAQPage;
