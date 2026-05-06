import React, { useState, useRef } from 'react';
import { User, Building2, Mail, Phone, FileText, CheckCircle, Info } from 'lucide-react';
import ReactFlagsSelect from 'react-flags-select';
import { parsePhoneNumberFromString, AsYouType, getCountryCallingCode } from 'libphonenumber-js';
import toast from 'react-hot-toast';
import { ALL_COUNTRY_CODES } from '../../utils/countryCodes';
import Modal from '../Common/Modal';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const AddLeadForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    designation: '',
    email: '',
    mobile: '',
    country: 'US',
    industry: '',
    otherIndustry: '',
    referencePerson: '',
    useReference: '',
    details: ''
  });

  const COUNTRY_CODES = ALL_COUNTRY_CODES;

  const mobileInputRef = useRef(null);

  const COUNTRY_LABELS = COUNTRY_CODES.reduce((acc, code) => {
    acc[code] = code; // default label is ISO code
    if (code === 'AE') acc[code] = 'UAE';
    return acc;
  }, {});

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMobileChange = (e) => {
    const { value } = e.target;
    const calling = getCountryCallingCode(formData.country);
    const digitsOnly = value.replace(/\D/g, '');

    // If user cleared input, or input only represents the calling code, allow empty
    if (value.trim() === '' || digitsOnly === '' || digitsOnly === calling) {
      setFormData(prev => ({ ...prev, mobile: '' }));
      if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
      return;
    }

    // Remove leading calling code if present to get national digits
    let nationalDigits = digitsOnly;
    if (nationalDigits.startsWith(calling)) {
      nationalDigits = nationalDigits.slice(calling.length);
    }

    const formatter = new AsYouType();
    const formattedInternational = formatter.input(`+${calling}${nationalDigits}`);

    setFormData(prev => ({ ...prev, mobile: formattedInternational }));
    if (errors.mobile) {
      setErrors(prev => ({ ...prev, mobile: '' }));
    }
  };

  const handleMobileBlur = () => {
    const trimmed = (formData.mobile || '').trim();
    if (!trimmed) return;
    const parsed = parsePhoneNumberFromString(trimmed, formData.country);
    if (parsed) {
      setFormData(prev => ({ ...prev, mobile: parsed.formatInternational() }));
    } else if (!trimmed.startsWith('+')) {
      const calling = getCountryCallingCode(formData.country);
      const withoutLeadingZeros = trimmed.replace(/^0+/, '');
      setFormData(prev => ({ ...prev, mobile: `+${calling} ${withoutLeadingZeros}` }));
    }
  };

  const handleCountrySelect = (code) => {
    const calling = getCountryCallingCode(code);
    setFormData(prev => ({ ...prev, country: code, mobile: `+${calling} ` }));
    if (mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
    if (errors.mobile) {
      setErrors(prev => ({ ...prev, mobile: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else {
      const parsed = parsePhoneNumberFromString(formData.mobile, formData.country);
      if (!parsed || !parsed.isValid()) {
        newErrors.mobile = 'Please enter a valid mobile number';
      }
    }

    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }

    if (formData.industry === 'Other' && !formData.otherIndustry.trim()) {
      newErrors.otherIndustry = 'Please specify the industry';
    }

    if (!formData.useReference) {
      newErrors.useReference = 'Please select a reference option';
    }

    if (formData.useReference === 'use' && !formData.referencePerson.trim()) {
      newErrors.referencePerson = 'Please enter the reference person\'s name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare phone in E.164 format
      const parsed = parsePhoneNumberFromString(formData.mobile, formData.country);
      const e164Phone = parsed ? parsed.number : formData.mobile;

      // Fire Formspree notification — non-blocking, failure does not stop submission
      fetch('https://formspree.io/f/xkgqvjkw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          companyName: formData.companyName,
          designation: formData.designation,
          email: formData.email,
          mobile: e164Phone,
          industry: formData.industry === 'Other' ? formData.otherIndustry : formData.industry,
          hasReference: formData.useReference === 'use',
          referencePerson: formData.referencePerson,
          useReference: formData.useReference,
          details: formData.details,
          submissionType: 'Lead Referral',
          notificationEmail: 'shoaibfm1988@gmail.com',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      }).catch(() => {});

      // Save to database via API
      const apiResponse = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          category: formData.industry === 'Other' ? formData.otherIndustry : formData.industry,
          companyName: formData.companyName,
          contactPerson: formData.fullName,
          email: formData.email,
          phone: e164Phone,
          description: formData.details,
          hasReference: formData.useReference === 'use',
          referencePerson: formData.useReference === 'use' ? formData.referencePerson : '',
          value: 0,
          currency: 'USD'
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Database save failed');
      }

      // Notify other tabs/components that a new lead was submitted
      window.dispatchEvent(new CustomEvent('leadSubmitted'));

      setIsSubmitted(true);
      setFormData({
        fullName: '',
        companyName: '',
        designation: '',
        email: '',
        mobile: '',
        country: 'US',
        industry: '',
        otherIndustry: '',
        referencePerson: '',
        useReference: '',
        details: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('There was an error submitting your lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <Modal
        isOpen={isSubmitted}
        onClose={() => setIsSubmitted(false)}
        title="Lead submitted successfully"
        size="small"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-gray-600 mb-6">
            Your lead has been sent successfully. You can submit another lead if you have more referrals.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition duration-200 font-medium"
          >
            Submit Another Lead
          </button>
        </div>
      </Modal>
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          <span className="font-semibold">You are filling in your client's details — not your own.</span>{' '}
          Enter the information of the person or company you want to refer to us.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Client Information section header ── */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Client's Information</h3>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Client's Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                errors.fullName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g. John Smith"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Client's Company Name *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                errors.companyName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter company name"
            />
          </div>
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
          )}
        </div>

        {/* Designation */}
        <div>
          <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
            Client's Job Title / Designation
            <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            placeholder="e.g. CEO, Procurement Manager"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Client's Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="client@theircompany.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
            Client's Mobile Number *
          </label>
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
                searchPlaceholder="Search country…"
              />
            </div>
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                ref={mobileInputRef}
                onChange={handleMobileChange}
                onBlur={handleMobileBlur}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                  errors.mobile ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter mobile number"
              />
            </div>
          </div>
          {errors.mobile && (
            <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
          )}
        </div>

        {/* ── Lead Details section header ── */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Lead Details</h3>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Industry / Sector */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
            Industry / Sector *
          </label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
              errors.industry ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select Industry</option>
            <option value="Construction">Construction</option>
            <option value="IT / Software Development">IT / Software Development</option>
            <option value="Banking & Finance">Banking & Finance</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Insurance">Insurance</option>
            <option value="Other">Other</option>
          </select>
          {errors.industry && (
            <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
          )}
        </div>

        {/* Other Industry (shown only when "Other" is selected) */}
        {formData.industry === 'Other' && (
          <div>
            <label htmlFor="otherIndustry" className="block text-sm font-medium text-gray-700 mb-2">
              Please specify the industry *
            </label>
            <input
              type="text"
              id="otherIndustry"
              name="otherIndustry"
              value={formData.otherIndustry}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                errors.otherIndustry ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter the industry"
            />
            {errors.otherIndustry && (
              <p className="mt-1 text-sm text-red-600">{errors.otherIndustry}</p>
            )}
          </div>
        )}

        {/* ── Reference section header ── */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Reference</h3>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Reference options */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Should we mention someone's name as a reference when contacting this client?</p>

          <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
            formData.useReference === 'use' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="useReference"
              value="use"
              checked={formData.useReference === 'use'}
              onChange={handleInputChange}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div>
              <div className="text-sm font-medium text-gray-800">Yes, use a reference name when contacting the client</div>
            </div>
          </label>

          {formData.useReference === 'use' && (
            <div className="ml-4">
              <label htmlFor="referencePerson" className="block text-sm font-medium text-gray-700 mb-2">
                Reference Person's Name *
              </label>
              <input
                type="text"
                id="referencePerson"
                name="referencePerson"
                value={formData.referencePerson}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                  errors.referencePerson ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g. Ahmed Al-Rashid"
              />
              {errors.referencePerson && (
                <p className="mt-1 text-sm text-red-600">{errors.referencePerson}</p>
              )}
            </div>
          )}

          <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
            formData.useReference === 'dont_use' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="useReference"
              value="dont_use"
              checked={formData.useReference === 'dont_use'}
              onChange={handleInputChange}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div>
              <div className="text-sm font-medium text-gray-800">No, contact the client without any reference</div>
            </div>
          </label>

          {errors.useReference && (
            <p className="text-sm text-red-600">{errors.useReference}</p>
          )}
        </div>

        {/* Details Text Area */}
        <div>
          <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
            What is this client looking for?
            <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              rows={4}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
              placeholder="e.g. They need a 5-floor commercial building constructed by Q4. Budget ~AED 2M."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-800 transform hover:scale-105 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
    </div>
  );
};

export default AddLeadForm;
