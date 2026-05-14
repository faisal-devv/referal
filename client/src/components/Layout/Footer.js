import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';

const Footer = () => (
  <footer style={{ background: '#0d1117' }} className="border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Referus.co</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
            Connect businesses with opportunities. Earn rewards for successful referrals in IT, Banking,
            Real Estate, Construction, and Insurance.
          </p>
          <div className="flex gap-4">
            {[
              { href: 'https://www.facebook.com/share/1GkZwYU4kt/?mibextid=wwXIfr', Icon: Facebook, hover: 'hover:text-blue-400' },
              { href: 'https://www.linkedin.com/company/referus-co/', Icon: Linkedin, hover: 'hover:text-blue-400' },
              { href: 'https://www.instagram.com/referus.co?igsh=MXBhOG1lcnB4OHl3MQ==', Icon: Instagram, hover: 'hover:text-pink-400' },
              { href: 'https://www.youtube.com/@ReferusPortal', Icon: Youtube, hover: 'hover:text-red-400' },
            ].map(({ href, Icon, hover }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className={`text-slate-500 ${hover} transition-colors`}>
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Platform</h3>
          <ul className="space-y-2.5">
            {[['/', 'Home'], ['/how-it-works', 'How It Works'], ['/about', 'About Us'], ['/faq', 'FAQ'], ['/contact', 'Contact']].map(([to, label]) => (
              <li key={to}><Link to={to} className="text-slate-400 hover:text-white text-sm transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Industries</h3>
          <ul className="space-y-2.5">
            {['IT & Software', 'Banking & Finance', 'Real Estate', 'Construction', 'Insurance'].map(name => (
              <li key={name}><span className="text-slate-400 text-sm">{name}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">© 2026 Referus.co. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="text-slate-500 hover:text-white text-sm transition-colors">Privacy Policy</Link>
          <Link to="/terms"   className="text-slate-500 hover:text-white text-sm transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
