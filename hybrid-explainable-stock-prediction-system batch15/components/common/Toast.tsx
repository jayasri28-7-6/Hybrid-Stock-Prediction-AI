
import React from 'react';
import { useToast } from '../../context/ToastContext';

const Toast: React.FC = () => {
  const { toast, hideToast } = useToast();

  if (!toast.visible) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-4 animate-fade-in-up`}
    >
      <span>{toast.message}</span>
      <button onClick={hideToast} className="text-xl font-bold leading-none">&times;</button>
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
