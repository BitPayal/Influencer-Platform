import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-24 right-4 md:right-8 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
        type === 'success' 
          ? 'bg-white border-green-100 text-green-800' 
          : 'bg-white border-red-100 text-red-800'
      }`}>
        <div className={`p-1 rounded-full ${
          type === 'success' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {type === 'success' ? (
            <CheckCircle className={`w-4 h-4 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
        </div>
        
        <p className="text-sm font-medium">{message}</p>
        
        <button 
          onClick={onClose}
          className={`ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors ${
             type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
