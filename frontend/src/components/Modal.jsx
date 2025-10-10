import React from 'react';

export const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
  // We Don't render the modal if it's not open
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"
        onClick={onClose}
      ></div>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md bg-rich-black-800 text-rich-black-5 z-50 p-6 rounded-lg border border-rich-black-600 flex flex-col gap-4">
        
        <p className="font-semibold text-2xl">{title}</p>
        <div className="text-rich-black-100">{children}</div>
        <div className="flex gap-4 mt-4 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 font-medium bg-rich-black-700 text-rich-black-50 rounded-lg hover:bg-rich-black-600 transition-colors duration-200"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2 font-medium bg-yellow-50 text-rich-black-900 rounded-lg hover:bg-yellow-100 transition-colors duration-200"
          >
            Confirm
          </button>
        </div>
      </div>
    </>
  );
};