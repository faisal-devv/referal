import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Building2,
  CreditCard,
  Home,
  Wrench,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LeadForm from '../components/Leads/LeadForm';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  // Listen for storage changes and custom events to refresh leads automatically
  useEffect(() => {
    const handleStorageChange = () => {
      fetchLeads();
    };

    const handleLeadSubmitted = () => {
      fetchLeads();
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom lead submitted event
    window.addEventListener('leadSubmitted', handleLeadSubmitted);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('leadSubmitted', handleLeadSubmitted);
    };
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, categoryFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      // Load leads from localStorage (same as Dashboard)
      const localLeads = JSON.parse(localStorage.getItem('userLeads') || '[]');
      setLeads(localLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Industry filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(lead => lead.industry === categoryFilter);
    }

    setFilteredLeads(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'deal_closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'deal_lost':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'negotiating':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'proposal_submitted':
        return <Clock className="h-4 w-4 text-purple-500" />;
      case 'trying_to_contact':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'deal_closed':
        return 'text-green-600 bg-green-100';
      case 'deal_lost':
        return 'text-red-600 bg-red-100';
      case 'negotiating':
        return 'text-blue-600 bg-blue-100';
      case 'proposal_submitted':
        return 'text-purple-600 bg-purple-100';
      case 'trying_to_contact':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryIcon = (industry) => {
    switch (industry) {
      case 'IT / Software Development':
        return <Building2 className="h-4 w-4" />;
      case 'Banking & Finance':
        return <CreditCard className="h-4 w-4" />;
      case 'Real Estate':
        return <Home className="h-4 w-4" />;
      case 'Construction':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (industry) => {
    switch (industry) {
      case 'IT / Software Development':
        return 'bg-blue-100 text-blue-600';
      case 'Banking & Finance':
        return 'bg-green-100 text-green-600';
      case 'Real Estate':
        return 'bg-purple-100 text-purple-600';
      case 'Construction':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleLeadSubmit = (newLead) => {
    // This function is not used since leads are submitted via AddLeadForm
    // which handles localStorage and dispatches the leadSubmitted event
    setShowLeadForm(false);
    // Refresh leads from localStorage
    fetchLeads();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
              <p className="text-gray-600 mt-2">
                Track and manage your referral leads
              </p>
            </div>
            <button
              onClick={() => setShowLeadForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Submit Lead
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search leads..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="trying_to_contact">Trying to Contact</option>
                <option value="proposal_submitted">Proposal Submitted</option>
                <option value="negotiating">Negotiating</option>
                <option value="deal_closed">Deal Closed</option>
                <option value="deal_lost">Deal Lost</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Industries</option>
                <option value="IT / Software Development">IT / Software Development</option>
                <option value="Banking & Finance">Banking & Finance</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Construction">Construction</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredLeads.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {lead.companyName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(lead.industry)}`}>
                          <span className="mr-1">{getCategoryIcon(lead.industry)}</span>
                          {lead.industry}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          <span className="mr-1">{getStatusIcon(lead.status)}</span>
                          {getStatusText(lead.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Contact:</span> {lead.fullName}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {lead.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {lead.mobile}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            <span className="font-medium">Designation:</span> {lead.designation || 'N/A'}
                          </span>
                          <span>
                            <span className="font-medium">Submitted:</span> {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="text-gray-400 hover:text-gray-600 transition duration-200"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {lead.details && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {lead.details}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {leads.length === 0 ? 'No leads yet' : 'No leads match your filters'}
              </h3>
              <p className="text-gray-500 mb-6">
                {leads.length === 0 
                  ? 'Start earning by submitting your first lead'
                  : 'Try adjusting your search criteria'
                }
              </p>
              {leads.length === 0 && (
                <button
                  onClick={() => setShowLeadForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Submit Your First Lead
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lead Form Modal */}
      {showLeadForm && (
        <LeadForm
          onClose={() => setShowLeadForm(false)}
          onSuccess={handleLeadSubmit}
        />
      )}
    </div>
  );
};

export default LeadsPage;
