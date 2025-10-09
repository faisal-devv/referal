import React from 'react';
import Layout from '../components/Layout/Layout';
import AddLeadForm from '../components/Forms/AddLeadForm';

const AddLeadPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AddLeadForm />
        </div>
      </div>
    </Layout>
  );
};

export default AddLeadPage;
