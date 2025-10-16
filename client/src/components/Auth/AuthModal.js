import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthModal = ({ isOpen, onClose, defaultToRegister = false }) => {
  const [isLogin, setIsLogin] = useState(!defaultToRegister);

  // Reset the form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLogin(!defaultToRegister);
    }
  }, [isOpen, defaultToRegister]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition duration-200 z-10"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} onSuccess={onClose} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} onSuccess={onClose} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
