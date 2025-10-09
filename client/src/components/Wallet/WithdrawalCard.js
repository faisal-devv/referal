import React from 'react';
import { Calendar, Building, CreditCard, User } from 'lucide-react';
import StatusBadge from '../Common/StatusBadge';
import Card from '../Common/Card';

const WithdrawalCard = ({ withdrawal, onView }) => {
  return (
    <Card className="hover:shadow-lg transition duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {withdrawal.currency} {withdrawal.amount.toLocaleString()}
            </h3>
            <StatusBadge status={withdrawal.status} type="withdrawal" />
          </div>
        </div>
        {onView && (
          <button
            onClick={() => onView(withdrawal)}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{withdrawal.user.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4" />
          <span>{withdrawal.bankDetails.bankName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4" />
          <span>****{withdrawal.bankDetails.accountNumber.slice(-4)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Requested {new Date(withdrawal.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {withdrawal.adminNotes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Admin Note:</span> {withdrawal.adminNotes}
          </p>
        </div>
      )}

      {withdrawal.processedAt && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Processed by {withdrawal.processedBy?.name || 'Admin'} on{' '}
            {new Date(withdrawal.processedAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WithdrawalCard;
