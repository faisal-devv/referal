import React from 'react';
import { Calendar, User, Building2, CreditCard, Home, Wrench, Eye } from 'lucide-react';
import StatusBadge from '../Common/StatusBadge';
import Card from '../Common/Card';

const LeadCard = ({ lead, onView }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'IT':
        return <Building2 className="h-4 w-4" />;
      case 'Banking':
        return <CreditCard className="h-4 w-4" />;
      case 'Real Estate':
        return <Home className="h-4 w-4" />;
      case 'Construction':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'IT':
        return 'bg-blue-100 text-blue-600';
      case 'Banking':
        return 'bg-green-100 text-green-600';
      case 'Real Estate':
        return 'bg-purple-100 text-purple-600';
      case 'Construction':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card className="hover:shadow-lg transition duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {lead.companyName}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(lead.category)}`}>
              <span className="mr-1">{getCategoryIcon(lead.category)}</span>
              {lead.category}
            </span>
          </div>
          <StatusBadge status={lead.status} type="lead" />
        </div>
        {onView && (
          <button
            onClick={() => onView(lead)}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{lead.contactPerson}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Submitted {new Date(lead.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium text-gray-900">
            {lead.currency === 'USD' && '$'}
            {lead.currency === 'EUR' && '€'}
            {lead.currency === 'AED' && 'د.إ '}
            {lead.currency === 'SAR' && 'ر.س '}
            {lead.value?.toLocaleString() || 'N/A'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {lead.email}
        </div>
      </div>

      {lead.description && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 line-clamp-2">
            {lead.description}
          </p>
        </div>
      )}
    </Card>
  );
};

export default LeadCard;
