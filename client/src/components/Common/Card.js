import React from 'react';

const Card = ({ children, className = '', padding = 'medium', shadow = 'medium', ...props }) => {
  const pad = { none: '', small: 'p-4', medium: 'p-6', large: 'p-8' };
  const shad = { none: '', small: 'shadow-sm', medium: 'shadow-md', large: 'shadow-xl' };

  return (
    <div
      className={`rounded-xl border border-slate-700/50 ${pad[padding]} ${shad[shadow]} ${className}`}
      style={{ background: '#161b22' }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
