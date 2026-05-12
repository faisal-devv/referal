import React, { useState, useRef, useEffect } from 'react';
import {
  Building2, Globe, Phone, MapPin, Calendar, Users,
  User, Briefcase, Linkedin, Mail, CheckCircle,
  ChevronDown, X, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const INDUSTRIES = [
  'IT & ERP Services',
  'Banking & Finance',
  'Real Estate',
  'Construction & Interior Design',
  'Insurance',
];

const COMPANY_SIZES = [
  '1 – 10 employees',
  '11 – 50 employees',
  '51 – 200 employees',
  '201 – 500 employees',
  '500+ employees',
];

const FREE_DOMAINS = [
  'gmail.com','yahoo.com','hotmail.com','outlook.com','live.com','icloud.com',
  'aol.com','mail.com','protonmail.com','zoho.com','yandex.com','gmx.com',
  'inbox.com','fastmail.com','me.com','msn.com','yahoo.co.uk','yahoo.in',
];

const isFreeEmail = (email) => {
  const domain = (email || '').split('@')[1]?.toLowerCase();
  return FREE_DOMAINS.includes(domain);
};

/* ─── Multi-select dropdown ─────────────────────────────────────── */
const MultiSelect = ({ value, onChange, options, placeholder, hasError }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt));
    else onChange([...value, opt]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-sm bg-white text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
          hasError ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        <span className={value.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
          {value.length === 0
            ? placeholder
            : value.length === 1
              ? value[0]
              : `${value.length} industries selected`}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {options.map(opt => {
            const selected = value.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                  selected ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{opt}</span>
                {selected && <Check className="h-4 w-4 text-indigo-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected pills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map(v => (
            <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {v}
              <button type="button" onClick={() => toggle(v)} className="hover:text-indigo-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── BecomePartnerPage ─────────────────────────────────────────── */
const BecomePartnerPage = () => {
  const [form, setForm] = useState({
    companyName: '', websiteUrl: '', companyPhone: '',
    country: '', city: '', industryService: '',
    yearEstablished: '', companySize: '',
    contactFullName: '', designation: '', linkedIn: '',
    contactEmail: '', businessPhone: '',
  });
  const [industries, setIndustries] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const numericOnly = (val) => val.replace(/[^\d\s+\-().]/g, '');

  const validate = () => {
    const e = {};
    if (!form.companyName.trim())    e.companyName    = 'Company name is required';
    if (!form.websiteUrl.trim())     e.websiteUrl     = 'Website URL is required';
    if (!form.companyPhone.trim())   e.companyPhone   = 'Company phone is required';
    if (!form.country.trim())        e.country        = 'Country is required';
    if (!form.city.trim())           e.city           = 'City is required';
    if (!form.industryService.trim()) e.industryService = 'Industry / Service is required';
    if (!form.yearEstablished)       e.yearEstablished = 'Year established is required';
    else {
      const y = parseInt(form.yearEstablished);
      if (isNaN(y) || y < 1800 || y > new Date().getFullYear()) e.yearEstablished = 'Enter a valid year';
    }
    if (!form.contactFullName.trim()) e.contactFullName = 'Full name is required';
    if (!form.designation.trim())     e.designation     = 'Designation is required';
    if (!form.contactEmail.trim())    e.contactEmail    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.contactEmail)) e.contactEmail = 'Enter a valid email address';
    else if (isFreeEmail(form.contactEmail)) e.contactEmail = 'Please use your company email, not a personal address (e.g. Gmail)';
    if (industries.length === 0) e.industries = 'Please select at least one industry';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/partners/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          yearEstablished: parseInt(form.yearEstablished),
          interestedIndustries: industries,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const serverErrors = {};
        (data.errors || []).forEach(err => { serverErrors[err.path] = err.msg; });
        if (Object.keys(serverErrors).length) { setErrors(serverErrors); return; }
        throw new Error(data.message || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (field) =>
    `w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
      errors[field] ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-300'
    }`;

  const withIconCls = (field) =>
    `w-full border rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
      errors[field] ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-300'
    }`;

  const emailCls = () => {
    const freeErr = form.contactEmail && isFreeEmail(form.contactEmail);
    return `w-full border rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition-colors ${
      freeErr || errors.contactEmail
        ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
    }`;
  };

  const ErrorMsg = ({ field }) => errors[field]
    ? <p className="mt-1.5 text-xs text-red-500">{errors[field]}</p>
    : null;

  const SectionHeader = ({ num, title, subtitle }) => (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg shadow-indigo-500/30">
        {num}
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Application Received!</h1>
          <p className="text-slate-300 mb-2">
            Thank you for your interest in partnering with Referus.co.
          </p>
          <p className="text-slate-300 mb-8">
            Our team will review your application and reach out to <strong className="text-emerald-400">{form.contactEmail}</strong> within 2–3 business days.
          </p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <div className="bg-slate-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-widest mb-4">
            Partner Program
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Become a Partner
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Join our network of verified service providers and receive high-quality, pre-qualified leads directly to your business.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1 — Company Information */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <SectionHeader
              num="1"
              title="Company Information"
              subtitle="Tell us about your business"
            />

            <div className="space-y-5">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)}
                    className={withIconCls('companyName')} placeholder="Acme Corp" />
                </div>
                <ErrorMsg field="companyName" />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Website URL *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={form.websiteUrl} onChange={e => set('websiteUrl', e.target.value)}
                    className={withIconCls('websiteUrl')} placeholder="https://www.yourcompany.com" />
                </div>
                <ErrorMsg field="websiteUrl" />
              </div>

              {/* Company Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Official Company Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.companyPhone}
                    onChange={e => set('companyPhone', numericOnly(e.target.value))}
                    className={withIconCls('companyPhone')}
                    placeholder="+971 4 123 4567"
                  />
                </div>
                <ErrorMsg field="companyPhone" />
              </div>

              {/* Country + City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={form.country} onChange={e => set('country', e.target.value)}
                      className={withIconCls('country')} placeholder="United Arab Emirates" />
                  </div>
                  <ErrorMsg field="country" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                      className={withIconCls('city')} placeholder="Dubai" />
                  </div>
                  <ErrorMsg field="city" />
                </div>
              </div>

              {/* Industry / Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry / Service *</label>
                <input type="text" value={form.industryService} onChange={e => set('industryService', e.target.value)}
                  className={inputCls('industryService')} placeholder="e.g. ERP Software, Real Estate Brokerage, Construction" />
                <ErrorMsg field="industryService" />
              </div>

              {/* Year Established + Company Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Year Established *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={form.yearEstablished}
                      onChange={e => set('yearEstablished', e.target.value)}
                      className={withIconCls('yearEstablished')}
                      placeholder={String(new Date().getFullYear())}
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <ErrorMsg field="yearEstablished" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company Size <span className="text-xs font-normal text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select value={form.companySize} onChange={e => set('companySize', e.target.value)}
                      className={`${withIconCls('companySize')} appearance-none`}>
                      <option value="">Select size</option>
                      {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Contact Person */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <SectionHeader
              num="2"
              title="Contact Person Information"
              subtitle="Who should we reach out to?"
            />

            <div className="space-y-5">
              {/* Full Name + Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={form.contactFullName} onChange={e => set('contactFullName', e.target.value)}
                      className={withIconCls('contactFullName')} placeholder="John Smith" />
                  </div>
                  <ErrorMsg field="contactFullName" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Designation *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={form.designation} onChange={e => set('designation', e.target.value)}
                      className={withIconCls('designation')} placeholder="CEO, Sales Director, etc." />
                  </div>
                  <ErrorMsg field="designation" />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  LinkedIn Profile <span className="text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={form.linkedIn} onChange={e => set('linkedIn', e.target.value)}
                    className={withIconCls('linkedIn')} placeholder="https://linkedin.com/in/yourprofile" />
                </div>
              </div>

              {/* Company Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={e => { set('contactEmail', e.target.value); }}
                    className={emailCls()}
                    placeholder="john@yourcompany.com"
                  />
                </div>
                {form.contactEmail && isFreeEmail(form.contactEmail) && !errors.contactEmail && (
                  <p className="mt-1.5 text-xs text-red-500">Please use your company email address, not a personal address (e.g. Gmail)</p>
                )}
                <ErrorMsg field="contactEmail" />
              </div>

              {/* Business Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Business Contact Number <span className="text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.businessPhone}
                    onChange={e => set('businessPhone', numericOnly(e.target.value))}
                    className={withIconCls('businessPhone')}
                    placeholder="+971 50 123 4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Industries multi-select */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900">Industries You Serve *</h2>
              <p className="text-sm text-gray-500 mt-0.5">Select all industries your company operates in</p>
            </div>
            <MultiSelect
              value={industries}
              onChange={setIndustries}
              options={INDUSTRIES}
              placeholder="Select industries…"
              hasError={!!errors.industries}
            />
            {errors.industries && <p className="mt-1.5 text-xs text-red-500">{errors.industries}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Submit Partner Application
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            By submitting, you agree that our team may contact you using the information provided.
          </p>
        </form>
      </div>
    </div>
  );
};

export default BecomePartnerPage;
