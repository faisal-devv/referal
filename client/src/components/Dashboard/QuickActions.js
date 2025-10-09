import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, DollarSign, MessageCircle, Settings } from 'lucide-react';
import Card from '../Common/Card';

const QuickActions = ({ user }) => {
  const actions = [
    {
      icon: <Plus className="h-5 w-5" />,
      title: 'Submit New Lead',
      description: 'Submit a new referral lead',
      href: '/leads/new',
      color: 'text-primary-600 bg-primary-50 hover:bg-primary-100'
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: 'View All Leads',
      description: 'Track your submitted leads',
      href: '/leads',
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: 'Check Wallet',
      description: 'View your earnings',
      href: '/wallet',
      color: 'text-green-600 bg-green-50 hover:bg-green-100'
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: 'Contact Support',
      description: 'Get help from our team',
      href: '/chat',
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
    }
  ];

  if (user?.role === 'admin') {
    actions.push({
      icon: <Settings className="h-5 w-5" />,
      title: 'Admin Panel',
      description: 'Manage leads and users',
      href: '/admin',
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
    });
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.href}
            className={`flex items-center p-3 rounded-lg transition duration-200 ${action.color}`}
          >
            <div className="flex-shrink-0 mr-3">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {action.title}
              </p>
              <p className="text-xs text-gray-500">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;
