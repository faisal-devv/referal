import React from 'react';
import { Users, Target, Award, Globe } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '$2M+', label: 'Commissions Paid' },
    { number: '5,000+', label: 'Successful Deals' },
    { number: '50+', label: 'Countries' }
  ];

  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community First",
      description: "We believe in building a strong community where everyone can succeed together."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Results Driven",
      description: "Our platform is designed to deliver real results for both referrers and businesses."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Excellence",
      description: "We maintain the highest standards in everything we do, from technology to customer service."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Reach",
      description: "Connect with opportunities worldwide and expand your professional network globally."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Referus.co
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              We're revolutionizing how professionals monetize their networks through 
              technology, trust, and transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Referus.co was born from a simple observation: professionals have 
                  extensive networks but limited ways to monetize them effectively. 
                  Traditional referral programs are fragmented, unreliable, and often 
                  lack transparency.
                </p>
                <p>
                  We set out to change that by creating a unified platform that connects 
                  businesses with qualified leads while ensuring referrers are fairly 
                  compensated for their efforts.
                </p>
                <p>
                  Today, we're proud to serve thousands of professionals across multiple 
                  industries, helping them turn their networks into sustainable revenue streams.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold">2020</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Founded</h3>
                    <p className="text-gray-600">Started with a vision to connect professionals</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold">2021</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">First 1000 Users</h3>
                    <p className="text-gray-600">Reached our first major milestone</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold">2023</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Global Expansion</h3>
                    <p className="text-gray-600">Expanded to 50+ countries worldwide</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold">2024</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">$2M+ Paid</h3>
                    <p className="text-gray-600">Over $2 million in commissions paid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-6 group-hover:bg-primary-600 group-hover:text-white transition duration-200">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
