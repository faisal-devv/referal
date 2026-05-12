import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AdminProtectedRoute from './components/Layout/AdminProtectedRoute';
import EmployeeProtectedRoute from './components/Layout/EmployeeProtectedRoute';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AppLayout from './components/Layout/AppLayout';
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
import ResetPasswordPage from './pages/ResetPasswordPage';
import FAQPage from './pages/FAQPage';
import ProfilePage from './pages/ProfilePage';
import BecomePartnerPage from './pages/BecomePartnerPage';

function App() {
  return (
    <Router>
      <CurrencyProvider>
        <AuthProvider>
          <Routes>
            {/* ── Standalone (no nav) ── */}
<Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/admin" element={
              <AdminProtectedRoute><AdminPage /></AdminProtectedRoute>
            } />
            <Route path="/employee" element={
              <EmployeeProtectedRoute><EmployeePage /></EmployeeProtectedRoute>
            } />

            {/* ── Authenticated app pages — sidebar layout ── */}
            <Route path="/dashboard" element={
              <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/leads" element={
              <ProtectedRoute><AppLayout><LeadsPage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute><AppLayout><WalletPage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute><AppLayout><ChatPage /></AppLayout></ProtectedRoute>
            } />
            <Route path="/add-lead" element={
              <ProtectedRoute><AppLayout><AddLeadPage /></AppLayout></ProtectedRoute>
            } />

            {/* ── Public pages — top nav + footer ── */}
            <Route path="/*" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/become-a-partner" element={<BecomePartnerPage />} />
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
              style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
              success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </CurrencyProvider>
    </Router>
  );
}

export default App;
