import React from 'react';
import AddLeadForm from '../components/Forms/AddLeadForm';
import { useAppTheme } from '../context/AppThemeContext';

const AddLeadPage = () => {
  const { isDark } = useAppTheme();
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Submit a Lead</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Have a potential client in mind? Fill in their details below.</p>
      </div>
      <div
        className={`rounded-xl border p-6 sm:p-8 ${isDark ? 'border-slate-700/50' : 'border-gray-200'}`}
        style={{ background: isDark ? '#161b22' : '#ffffff' }}
      >
        <AddLeadForm />
      </div>
    </div>
  );
};

export default AddLeadPage;
