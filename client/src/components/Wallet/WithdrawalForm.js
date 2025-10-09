import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, X } from 'lucide-react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import Modal from '../Common/Modal';

const WithdrawalForm = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'AED', label: 'AED (د.إ)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'SAR', label: 'SAR (ر.س)' }
  ];

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      // API call would go here
      console.log('Withdrawal data:', data);
      onSuccess?.();
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Withdrawal"
      size="large"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Amount and Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Amount *"
            type="number"
            step="0.01"
            min="1"
            {...register('amount', { 
              required: 'Amount is required',
              min: { value: 1, message: 'Minimum amount is 1' }
            })}
            error={errors.amount?.message}
            placeholder="Enter amount"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            <select
              {...register('currency', { required: 'Currency is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

        {/* Bank Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Account Holder Name *"
              {...register('accountHolderName', { 
                required: 'Account holder name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              error={errors.accountHolderName?.message}
              placeholder="Enter account holder name"
            />
            
            <Input
              label="Bank Name *"
              {...register('bankName', { 
                required: 'Bank name is required',
                minLength: { value: 2, message: 'Bank name must be at least 2 characters' }
              })}
              error={errors.bankName?.message}
              placeholder="Enter bank name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Account Number *"
              {...register('accountNumber', { 
                required: 'Account number is required',
                minLength: { value: 8, message: 'Account number must be at least 8 digits' }
              })}
              error={errors.accountNumber?.message}
              placeholder="Enter account number"
            />
            
            <Input
              label="Routing Number *"
              {...register('routingNumber', { 
                required: 'Routing number is required',
                minLength: { value: 6, message: 'Routing number must be at least 6 digits' }
              })}
              error={errors.routingNumber?.message}
              placeholder="Enter routing number"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="IBAN (Optional)"
              {...register('iban')}
              placeholder="Enter IBAN"
            />
            
            <Input
              label="SWIFT Code (Optional)"
              {...register('swiftCode')}
              placeholder="Enter SWIFT code"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Submit Request</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WithdrawalForm;
