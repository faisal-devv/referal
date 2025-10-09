import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AdminProtectedRoute from './components/Layout/AdminProtectedRoute';
import EmployeeProtectedRoute from './components/Layout/EmployeeProtectedRoute';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import FloatingChatButton from './components/Chat/FloatingChatButton';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import AddLeadPage from './pages/AddLeadPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import WalletPage from './pages/WalletPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import EmployeePage from './pages/EmployeePage';
import AdminLoginPage from './pages/AdminLoginPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Admin Login Route - No Header/Footer */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          {/* All Other Routes - With Header/Footer */}
          <Route path="/*" element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/add-lead" element={<AddLeadPage />} />
          
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/leads" element={
                    <ProtectedRoute>
                      <LeadsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/wallet" element={
                    <ProtectedRoute>
                      <WalletPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <AdminProtectedRoute>
                      <AdminPage />
                    </AdminProtectedRoute>
                  } />
                  <Route path="/employee" element={
                    <EmployeeProtectedRoute>
                      <EmployeePage />
                    </EmployeeProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
              <FloatingChatButton />
            </div>
          } />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
