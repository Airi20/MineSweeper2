// src/components/ui/button.jsx
import React from 'react';

export const Button = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {children}
    </button>
  );
};
