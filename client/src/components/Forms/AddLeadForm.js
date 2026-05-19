import React, { useState, useRef, useEffect } from 'react';
import { User, Building2, Mail, FileText, CheckCircle, Info, ChevronDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import Modal from '../Common/Modal';
import { useAppTheme } from '../../context/AppThemeContext';

const HCAPTCHA_SITE_KEY = process.env.REACT_APP_HCAPTCHA_SITE_KEY;

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/* ─── Country codes ─────────────────────────────────────────────── */
const COUNTRY_CODES = [
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+30',  flag: '🇬🇷', name: 'Greece' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgium' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+36',  flag: '🇭🇺', name: 'Hungary' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+40',  flag: '🇷🇴', name: 'Romania' },
  { code: '+41',  flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43',  flag: '🇦🇹', name: 'Austria' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+45',  flag: '🇩🇰', name: 'Denmark' },
  { code: '+46',  flag: '🇸🇪', name: 'Sweden' },
  { code: '+47',  flag: '🇳🇴', name: 'Norway' },
  { code: '+48',  flag: '🇵🇱', name: 'Poland' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+51',  flag: '🇵🇪', name: 'Peru' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+62',  flag: '🇮🇩', name: 'Indonesia' },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines' },
  { code: '+64',  flag: '🇳🇿', name: 'New Zealand' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea' },
  { code: '+84',  flag: '🇻🇳', name: 'Vietnam' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+93',  flag: '🇦🇫', name: 'Afghanistan' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+95',  flag: '🇲🇲', name: 'Myanmar' },
  { code: '+98',  flag: '🇮🇷', name: 'Iran' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia & Herzegovina' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+960', flag: '🇲🇻', name: 'Maldives' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+970', flag: '🇵🇸', name: 'Palestine' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
];

const UAE = COUNTRY_CODES.find(c => c.code === '+971');

/* ─── CountryCodePicker ─────────────────────────────────────────── */
const CountryCodePicker = ({ value, onChange, isDark, hasError }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  );

  const errorBorder = hasError
    ? (isDark ? 'border-red-500/60' : 'border-red-400')
    : (isDark ? 'border-slate-700' : 'border-gray-300');

  const btn = isDark
    ? `flex items-center gap-1.5 px-3 py-3 h-full rounded-l-lg border border-r-0 ${errorBorder} bg-slate-800/60 text-white text-sm hover:bg-slate-700/60 transition-colors whitespace-nowrap`
    : `flex items-center gap-1.5 px-3 py-3 h-full rounded-l-lg border border-r-0 ${errorBorder} bg-gray-50 text-gray-900 text-sm hover:bg-gray-100 transition-colors whitespace-nowrap`;

  const dropdownBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const itemHover  = isDark ? 'hover:bg-slate-700/60 text-slate-300 hover:text-white' : 'hover:bg-gray-50 text-gray-700';
  const searchCls  = isDark
    ? 'w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
    : 'w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button type="button" onClick={() => { setOpen(o => !o); setSearch(''); }} className={btn}>
        <span className="text-base">{value.flag}</span>
        <span className="font-medium">{value.code}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
      </button>

      {open && (
        <div className={`absolute left-0 top-full mt-1 w-64 rounded-xl border shadow-2xl z-50 overflow-hidden ${dropdownBg}`}>
          <div className="p-2 border-b border-inherit">
            <div className="relative">
              <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country..."
                className={`${searchCls} pl-7`}
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <p className={`px-4 py-3 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>No results</p>
            )}
            {filtered.map((c) => (
              <button
                key={`${c.code}-${c.name}`}
                type="button"
                onClick={() => { onChange(c); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${itemHover} ${value.code === c.code && value.name === c.name ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
              >
                <span className="text-base flex-shrink-0">{c.flag}</span>
                <span className="flex-1 text-left text-xs truncate">{c.name}</span>
                <span className={`text-xs flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── AddLeadForm ───────────────────────────────────────────────── */
const AddLeadForm = () => {
  const { isDark } = useAppTheme();
  const mobileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '', companyName: '', designation: '',
    email: '', industry: '', otherIndustry: '',
    referencePerson: '', useReference: '', details: '',
  });
  const [countryCode, setCountryCode] = useState(UAE);
  const [phoneNumber, setPhoneNumber] = useState(UAE.code + ' ');

  const [errors, setErrors]         = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const [isSubmitted, setIsSubmitted]   = useState(false);

  // ── Theme tokens ──────────────────────────────────────────────
  const headingCls  = isDark ? 'text-white'     : 'text-gray-900';
  const subCls      = isDark ? 'text-slate-400'  : 'text-gray-600';
  const labelCls    = isDark ? 'block text-sm font-medium text-slate-300 mb-2' : 'block text-sm font-medium text-gray-700 mb-2';
  const optLabelCls = isDark ? 'text-xs font-normal text-slate-500' : 'text-xs font-normal text-gray-400';
  const dividerCls  = isDark ? 'bg-slate-700' : 'bg-gray-200';
  const iconCls     = isDark ? 'text-slate-500' : 'text-gray-400';

  const baseInput = isDark
    ? 'w-full border rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none transition duration-200 bg-slate-800/60 text-white placeholder-slate-500'
    : 'w-full border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition duration-200 bg-white text-gray-900 placeholder-gray-400';

  const inputCls = (err) =>
    `${baseInput} px-4 py-3 ${err ? (isDark ? 'border-red-500/60' : 'border-red-400') : (isDark ? 'border-slate-700' : 'border-gray-300')}`;

  const withIconCls = (err) =>
    `${baseInput} pl-10 pr-4 py-3 ${err ? (isDark ? 'border-red-500/60' : 'border-red-400') : (isDark ? 'border-slate-700' : 'border-gray-300')}`;

  const selectCls = (err) =>
    `${baseInput} px-4 py-3 ${err ? (isDark ? 'border-red-500/60' : 'border-red-400') : (isDark ? 'border-slate-700' : 'border-gray-300')}`;

  const phoneInputCls = (err) => isDark
    ? `w-full px-4 py-3 rounded-r-lg border ${err ? 'border-red-500/60' : 'border-slate-700'} bg-slate-800/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition duration-200 text-sm`
    : `w-full px-4 py-3 rounded-r-lg border ${err ? 'border-red-400' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 text-sm`;

  const radioCard = (selected) =>
    `flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
      selected
        ? isDark ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-500 bg-emerald-50'
        : isDark ? 'border-slate-700 hover:bg-slate-800/60' : 'border-gray-300 hover:bg-gray-50'
    }`;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCountryChange = (c) => {
    setCountryCode(c);
    setPhoneNumber(c.code + ' ');
    if (mobileInputRef.current) {
      mobileInputRef.current.focus();
      // Place cursor at end
      setTimeout(() => {
        const len = (c.code + ' ').length;
        mobileInputRef.current.setSelectionRange(len, len);
      }, 0);
    }
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/[^\d\s+\-().]/g, '');
    setPhoneNumber(cleaned);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim())    newErrors.fullName    = 'Full name is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.email.trim())       newErrors.email       = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (phoneNumber.trim() === countryCode.code || !phoneNumber.trim()) newErrors.phone = 'Mobile number is required';
    if (!formData.industry.trim())    newErrors.industry    = 'Industry is required';
    if (formData.industry === 'Other' && !formData.otherIndustry.trim()) newErrors.otherIndustry = 'Please specify the industry';
    if (!formData.useReference)       newErrors.useReference = 'Please select a reference option';
    if (formData.useReference === 'use' && !formData.referencePerson.trim()) newErrors.referencePerson = "Please enter the reference person's name";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!captchaToken) { toast.error('Please complete the CAPTCHA'); return; }
    setIsSubmitting(true);

    const fullPhone = phoneNumber.trim();

    try {
      const apiResponse = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          category: formData.industry === 'Other' ? formData.otherIndustry : formData.industry,
          companyName: formData.companyName, contactPerson: formData.fullName,
          email: formData.email, phone: fullPhone, description: formData.details,
          hasReference: formData.useReference === 'use',
          referencePerson: formData.useReference === 'use' ? formData.referencePerson : '',
          value: 0, currency: 'USD',
          hcaptchaToken: captchaToken,
        }),
      });

      if (!apiResponse.ok) throw new Error('Database save failed');

      window.dispatchEvent(new CustomEvent('leadSubmitted'));
      setIsSubmitted(true);
      setFormData({ fullName: '', companyName: '', designation: '', email: '', industry: '', otherIndustry: '', referencePerson: '', useReference: '', details: '' });
      setCountryCode(UAE);
      setPhoneNumber(UAE.code + ' ');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('There was an error submitting your lead. Please try again.');
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionHeader = ({ num, label }) => (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
        {num}
      </div>
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${headingCls}`}>{label}</h3>
      <div className={`flex-1 h-px ${dividerCls}`} />
    </div>
  );

  const ErrorMsg = ({ msg }) => msg ? <p className="mt-1.5 text-xs text-red-400">{msg}</p> : null;

  return (
    <>
      <Modal
        isOpen={isSubmitted}
        onClose={() => setIsSubmitted(false)}
        title="Lead submitted successfully"
        size="small"
      >
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-emerald-500/15' : 'bg-green-100'}`}>
            <CheckCircle className={`h-8 w-8 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
          </div>
          <p className={`mb-6 text-sm ${subCls}`}>
            Your lead has been sent successfully. You can submit another lead if you have more referrals.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition duration-200 font-medium text-sm"
          >
            Submit Another Lead
          </button>
        </div>
      </Modal>

      {/* Info banner */}
      <div className={`flex items-start gap-3 rounded-xl px-4 py-3 mb-6 border ${
        isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
      }`}>
        <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
          <span className="font-semibold">You are filling in your client's details, not your own.</span>{' '}
          Enter the information of the person or company you want to refer to us.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <SectionHeader num="1" label="Client's Information" />

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className={labelCls}>Client's Full Name *</label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${iconCls}`} />
            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange}
              className={withIconCls(errors.fullName)} placeholder="e.g. John Smith" />
          </div>
          <ErrorMsg msg={errors.fullName} />
        </div>

        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className={labelCls}>Client's Company Name *</label>
          <div className="relative">
            <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${iconCls}`} />
            <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange}
              className={withIconCls(errors.companyName)} placeholder="Enter company name" />
          </div>
          <ErrorMsg msg={errors.companyName} />
        </div>

        {/* Designation */}
        <div>
          <label htmlFor="designation" className={labelCls}>
            Client's Job Title / Designation <span className={`ml-1 ${optLabelCls}`}>(optional)</span>
          </label>
          <input type="text" id="designation" name="designation" value={formData.designation} onChange={handleInputChange}
            className={inputCls(false)} placeholder="e.g. CEO, Procurement Manager" />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelCls}>Client's Email Address *</label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${iconCls}`} />
            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange}
              className={withIconCls(errors.email)} placeholder="client@theircompany.com" />
          </div>
          <ErrorMsg msg={errors.email} />
        </div>

        {/* Mobile */}
        <div>
          <label className={labelCls}>
            Client's Mobile Number *
          </label>
          <div className="flex">
            <CountryCodePicker
              value={countryCode}
              onChange={handleCountryChange}
              isDark={isDark}
              hasError={!!errors.phone}
            />
            <input
              ref={mobileInputRef}
              type="text"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="e.g. 50 123 4567"
              className={phoneInputCls(errors.phone)}
            />
          </div>
          <ErrorMsg msg={errors.phone} />
        </div>

        <SectionHeader num="2" label="Lead Details" />

        {/* Industry */}
        <div>
          <label htmlFor="industry" className={labelCls}>Industry / Sector *</label>
          <select id="industry" name="industry" value={formData.industry} onChange={handleInputChange} className={selectCls(errors.industry)}>
            <option value="">Select Industry</option>
            <option value="Construction">Construction</option>
            <option value="IT / Software Development">IT / Software Development</option>
            <option value="Banking &amp; Finance">Banking &amp; Finance</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Insurance">Insurance</option>
            <option value="Other">Other</option>
          </select>
          <ErrorMsg msg={errors.industry} />
        </div>

        {formData.industry === 'Other' && (
          <div>
            <label htmlFor="otherIndustry" className={labelCls}>Please specify the industry *</label>
            <input type="text" id="otherIndustry" name="otherIndustry" value={formData.otherIndustry} onChange={handleInputChange}
              className={inputCls(errors.otherIndustry)} placeholder="Enter the industry" />
            <ErrorMsg msg={errors.otherIndustry} />
          </div>
        )}

        <SectionHeader num="3" label="Reference" />

        <div className="space-y-3">
          <p className={`text-sm ${subCls}`}>Should we mention someone's name as a reference when contacting this client?</p>

          <label className={radioCard(formData.useReference === 'use')}>
            <input type="radio" name="useReference" value="use"
              checked={formData.useReference === 'use'} onChange={handleInputChange}
              className="mt-0.5 h-4 w-4 accent-emerald-500" />
            <div className={`text-sm font-medium ${headingCls}`}>Yes, use a reference name when contacting the client</div>
          </label>

          {formData.useReference === 'use' && (
            <div className="ml-4">
              <label htmlFor="referencePerson" className={labelCls}>Reference Person's Name *</label>
              <input type="text" id="referencePerson" name="referencePerson" value={formData.referencePerson} onChange={handleInputChange}
                className={inputCls(errors.referencePerson)} placeholder="e.g. Ahmed Al-Rashid" />
              <ErrorMsg msg={errors.referencePerson} />
            </div>
          )}

          <label className={radioCard(formData.useReference === 'dont_use')}>
            <input type="radio" name="useReference" value="dont_use"
              checked={formData.useReference === 'dont_use'} onChange={handleInputChange}
              className="mt-0.5 h-4 w-4 accent-emerald-500" />
            <div className={`text-sm font-medium ${headingCls}`}>No, contact the client without any reference</div>
          </label>

          <ErrorMsg msg={errors.useReference} />
        </div>

        {/* Details */}
        <div>
          <label htmlFor="details" className={labelCls}>
            What is this client looking for? <span className={`ml-1 ${optLabelCls}`}>(optional)</span>
          </label>
          <div className="relative">
            <FileText className={`absolute left-3 top-3 h-5 w-5 ${iconCls}`} />
            <textarea id="details" name="details" value={formData.details} onChange={handleInputChange} rows={4}
              className={`${baseInput} pl-10 pr-4 py-3 border resize-none ${isDark ? 'border-slate-700' : 'border-gray-300'}`}
              placeholder="e.g. They need a 5-floor commercial building constructed by Q4. Budget ~AED 2M." />
          </div>
        </div>

        {/* CAPTCHA */}
        <div className="flex justify-center pt-2">
          <HCaptcha
            sitekey={HCAPTCHA_SITE_KEY}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            ref={captchaRef}
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !captchaToken}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 px-6 rounded-lg transition duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Lead</span>
                <CheckCircle className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default AddLeadForm;
