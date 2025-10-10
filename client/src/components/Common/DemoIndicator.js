import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { isDemoMode } from '../../utils/demoData';

const DemoIndicator = ({ onClose }) => {
  if (!isDemoMode()) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <strong>Demo Mode:</strong> You are currently using a demo account with sample data. 
            This is for demonstration purposes only and does not connect to a real server.
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onClose}
                className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoIndicator;
