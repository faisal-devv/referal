import React, { useState } from 'react';
import { X, Save, MessageSquare } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadStatusModal = ({ lead, isOpen, onClose, onSuccess }) => {
  const [status, setStatus] = useState(lead?.status || 'submitted');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'submitted', label: 'Submitted', color: 'bg-gray-100 text-gray-800' },
    { value: 'trying_to_contact', label: 'Trying to Contact', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'proposal_submitted', label: 'Proposal Submitted', color: 'bg-purple-100 text-purple-800' },
    { value: 'negotiating', label: 'Negotiating', color: 'bg-blue-100 text-blue-800' },
    { value: 'deal_closed', label: 'Deal Closed', color: 'bg-green-100 text-green-800' },
    { value: 'deal_lost', label: 'Deal Lost', color: 'bg-red-100 text-red-800' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead) return;

    try {
      setIsSubmitting(true);
      await axios.put(`/api/leads/${lead._id}/status`, {
        status,
        note: note.trim() || undefined
      });
      
      toast.success('Lead status updated successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error(error.response?.data?.message || 'Failed to update lead status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Update Lead Status</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Lead Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{lead.companyName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Category:</span> {lead.category}
              </div>
              <div>
                <span className="font-medium">Value:</span> {lead.currency} {lead.value.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Contact:</span> {lead.contactPerson}
              </div>
              <div>
                <span className="font-medium">Email:</span> {lead.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {lead.phone}
              </div>
              <div>
                <span className="font-medium">Submitted by:</span> {lead.user.name}
              </div>
            </div>
            {lead.description && (
              <div className="mt-3">
                <span className="font-medium text-gray-700">Description:</span>
                <p className="text-sm text-gray-600 mt-1">{lead.description}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Lead Status *
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

            {/* Admin Note */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Note (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add a note about this status update..."
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                This note will be visible to the user who submitted the lead
              </p>
            </div>

            {/* Existing Notes */}
            {lead.notes && lead.notes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Previous Notes
                </label>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {lead.notes.map((note, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {note.addedBy?.name || 'Admin'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.addedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{note.note}</p>
                    </div>
                  ))}
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

export default LeadStatusModal;
