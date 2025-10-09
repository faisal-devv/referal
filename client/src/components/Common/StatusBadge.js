import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Pause,
  DollarSign
} from 'lucide-react';

const StatusBadge = ({ status, type = 'lead' }) => {
  const getStatusConfig = (status, type) => {
    if (type === 'lead') {
      switch (status) {
        case 'submitted':
          return {
            icon: <Clock className="h-3 w-3" />,
            text: 'Submitted',
            className: 'bg-gray-100 text-gray-800'
          };
        case 'trying_to_contact':
          return {
            icon: <AlertCircle className="h-3 w-3" />,
            text: 'Trying to Contact',
            className: 'bg-yellow-100 text-yellow-800'
          };
        case 'proposal_submitted':
          return {
            icon: <Clock className="h-3 w-3" />,
            text: 'Proposal Submitted',
            className: 'bg-purple-100 text-purple-800'
          };
        case 'negotiating':
          return {
            icon: <AlertCircle className="h-3 w-3" />,
            text: 'Negotiating',
            className: 'bg-blue-100 text-blue-800'
          };
        case 'deal_closed':
          return {
            icon: <CheckCircle className="h-3 w-3" />,
            text: 'Deal Closed',
            className: 'bg-green-100 text-green-800'
          };
        case 'deal_lost':
          return {
            icon: <XCircle className="h-3 w-3" />,
            text: 'Deal Lost',
            className: 'bg-red-100 text-red-800'
          };
        case 'on_hold':
          return {
            icon: <Pause className="h-3 w-3" />,
            text: 'On Hold',
            className: 'bg-orange-100 text-orange-800'
          };
        default:
          return {
            icon: <Clock className="h-3 w-3" />,
            text: 'Unknown',
            className: 'bg-gray-100 text-gray-800'
          };
      }
    } else if (type === 'withdrawal') {
      switch (status) {
        case 'pending':
          return {
            icon: <Clock className="h-3 w-3" />,
            text: 'Pending',
            className: 'bg-yellow-100 text-yellow-800'
          };
        case 'approved':
          return {
            icon: <CheckCircle className="h-3 w-3" />,
            text: 'Approved',
            className: 'bg-green-100 text-green-800'
          };
        case 'rejected':
          return {
            icon: <XCircle className="h-3 w-3" />,
            text: 'Rejected',
            className: 'bg-red-100 text-red-800'
          };
        case 'processed':
          return {
            icon: <DollarSign className="h-3 w-3" />,
            text: 'Processed',
            className: 'bg-blue-100 text-blue-800'
          };
        default:
          return {
            icon: <Clock className="h-3 w-3" />,
            text: 'Unknown',
            className: 'bg-gray-100 text-gray-800'
          };
      }
    }
  };

  const config = getStatusConfig(status, type);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
};

export default StatusBadge;
