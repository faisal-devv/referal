import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, CreditCard, Home, Wrench, Save, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const LeadForm = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const categories = [
    { value: 'IT', label: 'IT Services', icon: <Building2 className="h-5 w-5" />, color: 'bg-blue-500' },
    { value: 'Banking', label: 'Banking & Finance', icon: <CreditCard className="h-5 w-5" />, color: 'bg-green-500' },
    { value: 'Real Estate', label: 'Real Estate', icon: <Home className="h-5 w-5" />, color: 'bg-purple-500' },
    { value: 'Construction', label: 'Construction', icon: <Wrench className="h-5 w-5" />, color: 'bg-orange-500' }
  ];

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'AED', label: 'AED (د.إ)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'SAR', label: 'SAR (ر.س)' }
  ];

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}/leads`, data);
      toast.success('Lead submitted successfully!');
      onSuccess?.(response.data);
      reset();
      onClose?.();
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error(error.response?.data?.message || 'Failed to submit lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Submit New Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Industry Category *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <label
                  key={category.value}
                  className="relative flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-200"
                >
                  <input
                    type="radio"
                    value={category.value}
                    {...register('category', { required: 'Please select a category' })}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3 w-full">
                    <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                      {category.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="companyName"
                {...register('companyName', { 
                  required: 'Company name is required',
                  minLength: { value: 2, message: 'Company name must be at least 2 characters' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                id="contactPerson"
                {...register('contactPerson', { 
                  required: 'Contact person is required',
                  minLength: { value: 2, message: 'Contact person name must be at least 2 characters' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter contact person name"
              />
              {errors.contactPerson && (
                <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                id="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                {...register('phone', { 
                  required: 'Phone number is required',
                  minLength: { value: 10, message: 'Phone number must be at least 10 digits' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Deal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Deal Value *
              </label>
              <input
                type="number"
                id="value"
                {...register('value', { 
                  required: 'Deal value is required',
                  min: { value: 1000, message: 'Minimum deal value is $1,000' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="50000"
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency *
              </label>
              <select
                id="currency"
                {...register('currency', { required: 'Please select a currency' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select currency</option>
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 20, message: 'Description must be at least 20 characters' },
                maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe the project, requirements, timeline, and any other relevant details..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Provide as much detail as possible to increase conversion chances
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Submit Lead</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
