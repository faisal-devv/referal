import React, { useState } from 'react';
import { X, Save, DollarSign, User, Building, CreditCard } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const WithdrawalModal = ({ withdrawal, isOpen, onClose, onSuccess }) => {
  const [status, setStatus] = useState(withdrawal?.status || 'pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'processed', label: 'Processed', color: 'bg-blue-100 text-blue-800' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawal) return;

    try {
      setIsSubmitting(true);
      await axios.put(`/api/wallet/admin/withdrawals/${withdrawal._id}`, {
        status,
        adminNotes: adminNotes.trim() || undefined
      });
      
      toast.success('Withdrawal status updated successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      toast.error(error.response?.data?.message || 'Failed to update withdrawal status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !withdrawal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Review Withdrawal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Withdrawal Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {withdrawal.currency} {withdrawal.amount.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600">
                  Requested by {withdrawal.user.name}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Requested:</span> {new Date(withdrawal.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Current Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  statusOptions.find(opt => opt.value === withdrawal.status)?.color || 'bg-gray-100 text-gray-800'
                }`}>
                  {statusOptions.find(opt => opt.value === withdrawal.status)?.label || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Bank Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Account Holder:</span>
                <p className="text-gray-600">{withdrawal.bankDetails.accountHolderName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Bank Name:</span>
                <p className="text-gray-600">{withdrawal.bankDetails.bankName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Account Number:</span>
                <p className="text-gray-600 font-mono">{withdrawal.bankDetails.accountNumber}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Routing Number:</span>
                <p className="text-gray-600 font-mono">{withdrawal.bankDetails.routingNumber}</p>
              </div>
              {withdrawal.bankDetails.iban && (
                <div>
                  <span className="font-medium text-gray-700">IBAN:</span>
                  <p className="text-gray-600 font-mono">{withdrawal.bankDetails.iban}</p>
                </div>
              )}
              {withdrawal.bankDetails.swiftCode && (
                <div>
                  <span className="font-medium text-gray-700">SWIFT Code:</span>
                  <p className="text-gray-600 font-mono">{withdrawal.bankDetails.swiftCode}</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Withdrawal Status *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition duration-200 ${
                      status === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(e) => setStatus(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3 w-full">
                      <div className={`w-3 h-3 rounded-full ${
                        status === option.value ? 'bg-primary-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">
                        {option.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add notes about this withdrawal decision..."
              />
              <p className="mt-1 text-sm text-gray-500">
                These notes will be visible to the user and help explain the decision
              </p>
            </div>

            {/* Existing Admin Notes */}
            {withdrawal.adminNotes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Previous Admin Notes
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{withdrawal.adminNotes}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Added by {withdrawal.processedBy?.name || 'Admin'} on {new Date(withdrawal.processedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

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
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Update Status</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
