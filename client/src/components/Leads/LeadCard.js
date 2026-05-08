import React from 'react';
import { Calendar, User, Building2, CreditCard, Home, Wrench, Shield, Eye } from 'lucide-react';
import StatusBadge from '../Common/StatusBadge';

const CATEGORY_META = {
  IT:            { icon: Building2, bg: 'bg-blue-500/10',   text: 'text-blue-400'   },
  Banking:       { icon: CreditCard, bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  'Real Estate': { icon: Home,       bg: 'bg-violet-500/10', text: 'text-violet-400'  },
  Construction:  { icon: Wrench,     bg: 'bg-orange-500/10', text: 'text-orange-400'  },
  Insurance:     { icon: Shield,     bg: 'bg-teal-500/10',   text: 'text-teal-400'    },
};

const LeadCard = ({ lead, onView }) => {
  const meta = CATEGORY_META[lead.category] || CATEGORY_META.IT;
  const CatIcon = meta.icon;

  return (
    <div className="rounded-xl border border-slate-700/50 p-5 hover:border-slate-600 transition-all duration-200 hover:shadow-lg group"
      style={{ background: '#161b22' }}>

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white truncate">{lead.companyName}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.text}`}>
              <CatIcon size={11} />
              {lead.category}
            </span>
          </div>
          <StatusBadge status={lead.status} type="lead" />
        </div>
        {onView && (
          <button onClick={() => onView(lead)}
            className="text-slate-500 hover:text-emerald-400 transition-colors ml-2 opacity-0 group-hover:opacity-100">
            <Eye size={16} />
          </button>
        )}
      </div>

      <div className="space-y-1.5 text-xs text-slate-400 mb-4">
        <div className="flex items-center gap-1.5"><User size={12} /><span>{lead.contactPerson}</span></div>
        <div className="flex items-center gap-1.5"><Calendar size={12} /><span>Submitted {new Date(lead.createdAt).toLocaleDateString()}</span></div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <span className="text-sm font-semibold text-white">
          {lead.currency === 'USD' && '$'}
          {lead.currency === 'EUR' && '€'}
          {lead.currency === 'AED' && 'AED '}
          {lead.currency === 'SAR' && 'SAR '}
          {lead.value?.toLocaleString() || 'N/A'}
        </span>
        <span className="text-xs text-slate-500 truncate max-w-[120px]">{lead.email}</span>
      </div>

      {lead.description && (
        <p className="mt-3 text-xs text-slate-500 line-clamp-2 pt-3 border-t border-slate-700/50">
          {lead.description}
        </p>
      )}
    </div>
  );
};

export default LeadCard;
