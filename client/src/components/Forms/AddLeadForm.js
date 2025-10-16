import React, { useState, useRef } from 'react';
import { User, Building2, Mail, Phone, FileText, CheckCircle } from 'lucide-react';
import ReactFlagsSelect from 'react-flags-select';
import { parsePhoneNumberFromString, AsYouType, getCountryCallingCode, isPossiblePhoneNumber } from 'libphonenumber-js';
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
    hasReference: false,
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

    if (formData.hasReference && !formData.referencePerson.trim()) {
      newErrors.referencePerson = 'Reference person name is required when checkbox is checked';
    }

    if (!formData.useReference) {
      newErrors.useReference = 'Please select a reference option';
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

      // First, submit to Formspree for email notification
      const formspreeResponse = await fetch('https://formspree.io/f/xkgqvjkw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          companyName: formData.companyName,
          designation: formData.designation,
          email: formData.email,
          mobile: e164Phone,
          industry: formData.industry === 'Other' ? formData.otherIndustry : formData.industry,
          hasReference: formData.hasReference,
          referencePerson: formData.referencePerson,
          useReference: formData.useReference,
          details: formData.details,
          submissionType: 'Lead Referral',
          notificationEmail: 'shoaibfm1988@gmail.com',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      });

      if (!formspreeResponse.ok) {
        throw new Error('Formspree submission failed');
      }

      // Show success popup immediately after external submission succeeds
      setIsSubmitted(true);

      // Then, save to database via API (non-blocking for success UI)
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
          hasReference: !!formData.hasReference,
          referencePerson: formData.hasReference ? formData.referencePerson : '',
          value: 0, // Default value, can be updated later
          currency: 'USD' // Default currency
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Database save failed');
      }

      const savedLead = await apiResponse.json();

      if (true) {
        // Store lead locally for dashboard display (backup)
        const newLead = {
          id: savedLead._id,
          fullName: formData.fullName,
          companyName: formData.companyName,
          designation: formData.designation,
          email: formData.email,
          mobile: e164Phone,
          industry: formData.industry === 'Other' ? formData.otherIndustry : formData.industry,
          hasReference: formData.hasReference,
          referencePerson: formData.referencePerson,
          useReference: formData.useReference,
          details: formData.details,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };

        // Get existing leads from localStorage
        const existingLeads = JSON.parse(localStorage.getItem('userLeads') || '[]');
        existingLeads.unshift(newLead); // Add new lead to beginning
        localStorage.setItem('userLeads', JSON.stringify(existingLeads));

        // Dispatch custom event to notify dashboard of new lead
        // window.dispatchEvent(new CustomEvent('leadSubmitted'));

        setIsSubmitted(true);
        // Reset form
        setFormData({
          fullName: '',
          companyName: '',
          designation: '',
          email: '',
          mobile: '',
          country: 'US',
          industry: '',
          otherIndustry: '',
          hasReference: false,
          referencePerson: '',
          useReference: '',
          details: ''
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // If external submission failed, inform the user; otherwise, we've already shown success
      if (!isSubmitted) {
        alert('There was an error submitting your lead. Please try again.');
      }
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
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Help us connect with potential clients and earn rewards for successful referrals
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name of the person being referred *
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
              placeholder="Enter full name"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
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
            Designation
          </label>
          <input
            type="text"
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            placeholder="Enter designation/position"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
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
              placeholder="Enter email address"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number *
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

        {/* Reference Checkbox */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="hasReference"
              name="hasReference"
              checked={formData.hasReference}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hasReference" className="ml-2 text-sm font-medium text-gray-700">
              Do you want to mention someone's reference for this lead?
            </label>
          </div>

          {/* Dynamic Reference Person Field */}
          {formData.hasReference && (
            <div className="mb-4">
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
                placeholder="Enter reference person's name"
              />
              {errors.referencePerson && (
                <p className="mt-1 text-sm text-red-600">{errors.referencePerson}</p>
              )}
            </div>
          )}

          {/* Reference Radio Options */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="useReference"
                name="useReference"
                value="use"
                checked={formData.useReference === 'use'}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="useReference" className="ml-2 text-sm font-medium text-gray-700">
                Use reference
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="dontUseReference"
                name="useReference"
                value="dont_use"
                checked={formData.useReference === 'dont_use'}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="dontUseReference" className="ml-2 text-sm font-medium text-gray-700">
                Don't use any reference
              </label>
            </div>
            {errors.useReference && (
              <p className="text-sm text-red-600">{errors.useReference}</p>
            )}
          </div>
        </div>

        {/* Details Text Area */}
        <div>
          <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
            Details about the lead
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
              placeholder="Explain what this person or company is looking for, or any extra details you'd like to share."
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
