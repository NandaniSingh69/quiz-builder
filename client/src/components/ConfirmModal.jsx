import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: 'from-red-500 to-red-600',
      hover: 'from-red-600 to-red-700',
      border: 'border-red-300',
      text: 'text-red-700'
    },
    warning: {
      bg: 'from-yellow-500 to-yellow-600',
      hover: 'from-yellow-600 to-yellow-700',
      border: 'border-yellow-300',
      text: 'text-yellow-700'
    }
  };

  const color = colors[type] || colors.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-gray-200 animate-scale-in">
        <div className="p-6">
          {/* Icon */}
          <div className={`w-16 h-16 bg-gradient-to-br ${color.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-center text-stone-900 mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {title}
          </h3>

          {/* Message */}
          <p className="text-center text-stone-600 mb-6 leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-stone-700 rounded-xl font-bold transition-all border-2 border-gray-300"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${color.bg} hover:${color.hover} text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl`}
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
