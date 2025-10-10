import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import DemoIndicator from '../Common/DemoIndicator';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <DemoIndicator />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
