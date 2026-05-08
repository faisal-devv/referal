import React, { useState, useRef } from 'react';
import { User, Building2, Mail, Phone, FileText, CheckCircle, Info } from 'lucide-react';
import ReactFlagsSelect from 'react-flags-select';
import { parsePhoneNumberFromString, AsYouType, getCountryCallingCode } from 'libphonenumber-js';
import toast from 'react-hot-toast';
import { ALL_COUNTRY_CODES } from '../../utils/countryCodes';
import Modal from '../Common/Modal';
import { useAppTheme } from '../../context/AppThemeContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const AddLeadForm = () => {
  const { isDark } = useAppTheme();

  const [formData, setFormData] = useState({
    fullName: '', companyName: '', designation: '',
    email: '', mobile: '', country: 'US',
    industry: '', otherIndustry: '',
    referencePerson: '', useReference: '', details: '',
  });

  const COUNTRY_CODES = ALL_COUNTRY_CODES;
  const mobileInputRef = useRef(null);
  const COUNTRY_LABELS = COUNTRY_CODES.reduce((acc, code) => {
    acc[code] = code;
    if (code === 'AE') acc[code] = 'UAE';
    return acc;
  }, {});

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ── Theme tokens ──────────────────────────────────────────────
  const headingCls  = isDark ? 'text-white'     : 'text-gray-900';
  const subCls      = isDark ? 'text-slate-400'  : 'text-gray-600';
  const labelCls    = isDark ? 'block text-sm font-medium text-slate-300 mb-2' : 'block text-sm font-medium text-gray-700 mb-2';
  const optLabelCls = isDark ? 'text-xs font-normal text-slate-500' : 'text-xs font-normal text-gray-400';
  const dividerCls  = isDark ? 'bg-slate-700' : 'bg-gray-200';
  const iconCls     = isDark ? 'text-slate-500' : 'text-gray-400';

  const baseInput = isDark
    ? 'w-full border rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none transition duration-200 bg-slate-800/60 text-white placeholder-slate-500'
    : 'w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200 bg-white text-gray-900 placeholder-gray-400';

  const inputCls = (err) =>
    `${baseInput} px-4 py-3 ${err ? (isDark ? 'border-red-500/60' : 'border-red-400') : (isDark ? 'border-slate-700' : 'border-gray-300')}`;

  const withIconCls = (err) =>
    `${baseInput} pl-10 pr-4 py-3 ${err ? (isDark ? 'border-red-500/60' : 'border-red-400') : (isDark ? 'border-slate-700' : 'border-gray-300')}`;

  const selectCls = (err) =>
    `${baseInput} px-4 py-3 ${err ? (isDark ? 'border-red-500/60' : 'border-red-400') : (isDark ? 'border-slate-700' : 'border-gray-300')}`;

  const radioCard = (selected) =>
    `flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
      selected
        ? isDark ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-blue-500 bg-blue-50'
        : isDark ? 'border-slate-700 hover:bg-slate-800/60' : 'border-gray-300 hover:bg-gray-50'
    }`;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMobileChange = (e) => {
    const { value } = e.target;
    const calling = getCountryCallingCode(formData.country);
    const digitsOnly = value.replace(/\D/g, '');
    if (value.trim() === '' || digitsOnly === '' || digitsOnly === calling) {
      setFormData(prev => ({ ...prev, mobile: '' }));
      if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
      return;
    }
    let nationalDigits = digitsOnly;
    if (nationalDigits.startsWith(calling)) nationalDigits = nationalDigits.slice(calling.length);
    const formatter = new AsYouType();
    setFormData(prev => ({ ...prev, mobile: formatter.input(`+${calling}${nationalDigits}`) }));
    if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
  };

  const handleMobileBlur = () => {
    const trimmed = (formData.mobile || '').trim();
    if (!trimmed) return;
    const parsed = parsePhoneNumberFromString(trimmed, formData.country);
    if (parsed) {
      setFormData(prev => ({ ...prev, mobile: parsed.formatInternational() }));
    } else if (!trimmed.startsWith('+')) {
      const calling = getCountryCallingCode(formData.country);
      setFormData(prev => ({ ...prev, mobile: `+${calling} ${trimmed.replace(/^0+/, '')}` }));
    }
  };

  const handleCountrySelect = (code) => {
    const calling = getCountryCallingCode(code);
    setFormData(prev => ({ ...prev, country: code, mobile: `+${calling} ` }));
    if (mobileInputRef.current) mobileInputRef.current.focus();
    if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim())      newErrors.fullName = 'Full name is required';
    if (!formData.companyName.trim())   newErrors.companyName = 'Company name is required';
    if (!formData.email.trim())         newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else {
      const parsed = parsePhoneNumberFromString(formData.mobile, formData.country);
      if (!parsed || !parsed.isValid()) newErrors.mobile = 'Please enter a valid mobile number';
    }
    if (!formData.industry.trim()) newErrors.industry = 'Industry is required';
    if (formData.industry === 'Other' && !formData.otherIndustry.trim()) newErrors.otherIndustry = 'Please specify the industry';
    if (!formData.useReference)         newErrors.useReference = 'Please select a reference option';
    if (formData.useReference === 'use' && !formData.referencePerson.trim()) newErrors.referencePerson = "Please enter the reference person's name";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const parsed = parsePhoneNumberFromString(formData.mobile, formData.country);
      const e164Phone = parsed ? parsed.number : formData.mobile;

      fetch('https://formspree.io/f/xkgqvjkw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName, companyName: formData.companyName,
          designation: formData.designation, email: formData.email, mobile: e164Phone,
          industry: formData.industry === 'Other' ? formData.otherIndustry : formData.industry,
          hasReference: formData.useReference === 'use',
          referencePerson: formData.referencePerson, useReference: formData.useReference,
          details: formData.details, submissionType: 'Lead Referral',
          notificationEmail: 'shoaibfm1988@gmail.com',
          timestamp: new Date().toISOString(), userAgent: navigator.userAgent, url: window.location.href,
        }),
      }).catch(() => {});

      const apiResponse = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          category: formData.industry === 'Other' ? formData.otherIndustry : formData.industry,
          companyName: formData.companyName, contactPerson: formData.fullName,
          email: formData.email, phone: e164Phone, description: formData.details,
          hasReference: formData.useReference === 'use',
          referencePerson: formData.useReference === 'use' ? formData.referencePerson : '',
          value: 0, currency: 'USD',
        }),
      });

      if (!apiResponse.ok) throw new Error('Database save failed');

      window.dispatchEvent(new CustomEvent('leadSubmitted'));
      setIsSubmitted(true);
      setFormData({ fullName: '', companyName: '', designation: '', email: '', mobile: '', country: 'US', industry: '', otherIndustry: '', referencePerson: '', useReference: '', details: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('There was an error submitting your lead. Please try again.');
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
          <label htmlFor="mobile" className={labelCls}>Client's Mobile Number *</label>
          <div className="flex items-stretch gap-3">
            <div className="w-28">
              <ReactFlagsSelect
                selected={formData.country}
                onSelect={handleCountrySelect}
                countries={COUNTRY_CODES}
                customLabels={COUNTRY_LABELS}
                selectedSize={14}
                className="w-full"
                placeholder="Country"
                searchable
                searchPlaceholder="Search country..."
              />
            </div>
            <div className="relative flex-1">
              <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${iconCls}`} />
              <input type="tel" id="mobile" name="mobile" value={formData.mobile} ref={mobileInputRef}
                onChange={handleMobileChange} onBlur={handleMobileBlur}
                className={withIconCls(errors.mobile)} placeholder="Enter mobile number" />
            </div>
          </div>
          <ErrorMsg msg={errors.mobile} />
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

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
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
