import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ToastProps {
  toast: {
    message: string;
    type?: 'success' | 'error' | 'info';
  } | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300 ${
      toast.type === 'error' 
        ? 'bg-red-50 text-red-800 border-red-200' 
        : toast.type === 'info' 
        ? 'bg-blue-50 text-blue-800 border-blue-200' 
        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }`}>
      {toast.type === 'error' ? (
        <ShieldAlert className="w-4 h-4 text-red-600" />
      ) : toast.type === 'info' ? (
        <AlertTriangle className="w-4 h-4 text-blue-600" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      )}
      <span>{toast.message}</span>
    </div>
  );
};
