import React, { useState } from 'react';
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
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ContactForm from '../components/Forms/ContactForm';
import AuthModal from '../components/Auth/AuthModal';

const HowItWorksPage = () => {
  const navigate = useNavigate();
  const [showContactForm, setShowContactForm] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleGetStartedClick = () => {
    // Open signup modal
    setIsAuthModalOpen(true);
  };

  const handleContactUsClick = () => {
    // Show contact form with smooth scroll
    setShowContactForm(true);
    // Smooth scroll to contact form after a brief delay
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
      number: "01",
      title: "Create Your Account",
      description: "Sign up for free with your email and basic information. No credit card required.",
      icon: <UserPlus className="h-8 w-8" />,
      details: [
        "Complete your profile in under 2 minutes",
        "Verify your email address",
        "Set up your payment preferences"
      ]
    },
    {
      number: "02",
      title: "Submit Qualified Leads",
      description: "Submit leads in IT, Banking, Real Estate, or Construction with detailed information.",
      icon: <FileText className="h-8 w-8" />,
      details: [
        "Provide company and contact information",
        "Describe the opportunity in detail",
        "Set estimated deal value and timeline"
      ]
    },
    {
      number: "03",
      title: "Track Your Progress",
      description: "Monitor lead status updates and communication in real-time.",
      icon: <Eye className="h-8 w-8" />,
      details: [
        "Real-time status updates",
        "Direct communication with our team",
        "Progress tracking dashboard"
      ]
    },
    {
      number: "04",
      title: "Get Paid",
      description: "Receive commissions when your leads convert into successful deals.",
      icon: <DollarSign className="h-8 w-8" />,
      details: [
        "Commission rates: 0.5-10% depending on industry",
        "Multiple payment methods",
        "Transparent fee structure"
      ]
    }
  ];

  const industries = [
    {
      icon: <Building2 className="h-12 w-12" />,
      title: "IT Services",
      description: "Software development, cloud solutions, cybersecurity, and tech consulting",
      commission: "5-10%",
      examples: [
        "Software development projects",
        "Cloud migration services",
        "Cybersecurity implementations",
        "IT consulting engagements"
      ]
    },
    {
      icon: <CreditCard className="h-12 w-12" />,
      title: "Banking & Finance",
      description: "Financial services, loans, investment products, and banking solutions",
      commission: "0.5-2%",
      examples: [
        "Business loan referrals",
        "Investment product sales",
        "Banking service implementations",
        "Financial consulting projects"
      ]
    },
    {
      icon: <Home className="h-12 w-12" />,
      title: "Real Estate",
      description: "Property sales, rentals, commercial real estate, and property management",
      commission: "1-3%",
      examples: [
        "Commercial property sales",
        "Residential property transactions",
        "Property management services",
        "Real estate development projects"
      ]
    },
    {
      icon: <Wrench className="h-12 w-12" />,
      title: "Construction",
      description: "Building projects, infrastructure, renovations, and construction services",
      commission: "5-10%",
      examples: [
        "Construction project management",
        "Infrastructure development",
        "Building renovations",
        "Construction consulting"
      ]
    }
  ];

  const faqs = [
    {
      question: "How quickly do you respond?",
      answer: "We typically respond to all inquiries within 24 hours during business days."
    },
    {
      question: "Is there a mobile app?",
      answer: "Currently, we offer a fully responsive web application that works perfectly on all mobile devices. A dedicated mobile app is in development and will be available soon."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              How It Works
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Turn your professional network into a revenue stream in four simple steps
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      {step.number}
                    </div>
                    <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h2>
                  <p className="text-xl text-gray-600 mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="bg-gray-50 rounded-xl p-8 h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        {step.icon}
                      </div>
                      <p className="text-gray-500">Step {step.number} Visualization</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Industries & Commission Rates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Submit leads across multiple high-value industries with competitive commission rates
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industries.map((industry, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                    {industry.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {industry.title}
                    </h3>
                    <p className="text-primary-600 font-medium">
                      Commission: {industry.commission}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  {industry.description}
                </p>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Common Opportunities:</h4>
                  <ul className="space-y-2">
                    {industry.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-gray-600">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Referus.co
            </p>
          </div>
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      {showContactForm && (
        <section id="contact-form-section" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ContactForm />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are already earning with Referus.co
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStartedClick}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-200 shadow-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={handleContactUsClick}
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition duration-200"
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
