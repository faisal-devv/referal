import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'medium', className = '' }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const sizes = { small: 'max-w-md', medium: 'max-w-2xl', large: 'max-w-4xl', xlarge: 'max-w-6xl' };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl border border-slate-700 shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto ${className}`}
        style={{ background: '#0d1117' }}>
        {title && (
          <div className="sticky top-0 border-b border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl"
            style={{ background: '#0d1117' }}>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
