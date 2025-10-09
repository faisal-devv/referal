import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Shield, 
  MessageCircle,
  Building2,
  CreditCard,
  Home,
  Wrench,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ContactForm from '../components/Forms/ContactForm';
import AuthModal from '../components/Auth/AuthModal';

const HomePage = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleIndustryClick = (industry) => {
    setSelectedIndustry(industry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIndustry(null);
  };

  const handleReferNow = () => {
    // Close modal and redirect to signup/login
    setIsModalOpen(false);
    setSelectedIndustry(null);
    navigate('/register');
  };

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

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const features = [
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Earn Commissions",
      description: "Get paid for successful referrals in multiple industries"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Build Network",
      description: "Connect with businesses and expand your professional network"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Track Progress",
      description: "Monitor your leads and earnings with real-time updates"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Platform",
      description: "Your data and transactions are protected with enterprise-grade security"
    }
  ];

  const industries = [
    {
      icon: <Building2 className="h-12 w-12" />,
      title: "IT Services Leads",
      description: "Software development, cloud solutions, cybersecurity, and tech consulting",
      color: "bg-blue-500",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <CreditCard className="h-12 w-12" />,
      title: "Banking & Finance Leads",
      description: "Financial services, loans, investment products, and banking solutions",
      color: "bg-green-500",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <Home className="h-12 w-12" />,
      title: "Real Estate Leads",
      description: "Property sales, rentals, commercial real estate, and property management",
      color: "bg-purple-500",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <Wrench className="h-12 w-12" />,
      title: "Construction Leads",
      description: "Building projects, infrastructure, renovations, and construction services",
      color: "bg-orange-500",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Create your free account in minutes with just your email and basic information"
    },
    {
      number: "02",
      title: "Submit Leads",
      description: "Submit qualified leads in IT, Banking, Real Estate, or Construction sectors"
    },
    {
      number: "03",
      title: "Track Progress",
      description: "Monitor your leads through our platform with real-time status updates"
    },
    {
      number: "04",
      title: "Get Paid",
      description: "Receive commissions when your leads convert into successful deals"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Turn Your Network Into
                <span className="text-yellow-300"> Revenue</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Connect businesses with opportunities and earn commissions for successful referrals. 
                Join thousands of professionals already earning with Referus.co.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStartedClick}
                  className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-blue-900 font-semibold rounded-lg hover:bg-yellow-300 transition duration-200 shadow-lg"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-700 transition duration-200"
                >
                  Learn More
                </Link>
              </div>
              <div className="flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>No monthly fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Instant payouts</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Total Earnings</span>
                    <span className="text-2xl font-bold">$12,450</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-100">Active Leads</span>
                      <span className="text-lg">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-100">Successful Deals</span>
                      <span className="text-lg">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-100">Commission Rate</span>
                      <span className="text-lg">0.5-10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Referus.co?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need to turn your professional network into a revenue stream
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-6 group-hover:bg-primary-600 group-hover:text-white transition duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
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
              Industries We Cover
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Submit leads across multiple high-value industries and maximize your earning potential
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industries.map((industry, index) => (
              <div 
                key={index} 
                onClick={() => handleIndustryClick(industry)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-200 group overflow-hidden cursor-pointer transform hover:scale-105"
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={industry.image} 
                    alt={industry.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {industry.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {industry.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Details Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Commission Structure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Earn competitive commissions based on industry and project value
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* IT / Software Development */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">IT / Software Development</h3>
                  <p className="text-lg font-semibold text-blue-600">5–10% Commission</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Earn 5–10% commission on the total amount of the project successfully closed.
              </p>
              <button
                onClick={handleContactUsClick}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              >
                For more info, contact us
              </button>
            </div>

            {/* Construction */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Construction</h3>
                  <p className="text-lg font-semibold text-orange-600">5–10% Commission</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Earn 5–10% commission on the labor cost of the project. Commission will not be calculated on material costs.
              </p>
              <button
                onClick={handleContactUsClick}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-200 font-medium"
              >
                For more info, contact us
              </button>
            </div>

            {/* Real Estate */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Real Estate</h3>
                  <p className="text-lg font-semibold text-purple-600">1–3% Commission</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Earn 1–3% commission on property transactions successfully closed.
              </p>
              <button
                onClick={handleContactUsClick}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
              >
                For more info, contact us
              </button>
            </div>

            {/* Banking & Finance */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Banking & Finance</h3>
                  <p className="text-lg font-semibold text-green-600">0.5–2% Commission</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Earn 0.5–2% commission depending on the financial product sold.
              </p>
              <button
                onClick={handleContactUsClick}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
              >
                For more info, contact us
              </button>
            </div>
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
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are already earning with Referus.co. 
            Start your first referral today.
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
              <MessageCircle className="mr-2 h-5 w-5" />
              Contact Sales
            </button>
          </div>
        </div>
      </section>


      {/* Industry Modal */}
      {isModalOpen && selectedIndustry && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-200">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition duration-200"
              >
                <X className="h-6 w-6" />
              </button>
              
              {/* Industry Icon and Title */}
              <div className="flex items-center space-x-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${selectedIndustry.color} text-white rounded-full shadow-lg`}>
                  {selectedIndustry.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedIndustry.title}
                  </h3>
                  <p className="text-gray-600">
                    Referral Opportunity
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed text-lg">
                  Through the Referus Platform, you can provide leads from this industry. 
                  When your referred lead is successfully closed, you'll earn a handsome incentive. 
                  Start referring today and grow with us!
                </p>
              </div>

              {/* Refer Now Button */}
              <button
                onClick={handleReferNow}
                className="w-full bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-800 transform hover:scale-105 transition duration-200 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Refer Now</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        defaultToRegister={true}
      />
    </div>
  );
};

export default HomePage;
