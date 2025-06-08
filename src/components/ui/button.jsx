import React from 'react';
export function Button({ variant = 'default', size = 'md', className = '', children, ...props }) {
  const base = 'px-4 py-2 rounded flex items-center';
  const variants = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    destructive: 'bg-red-500 text-white hover:bg-red-600'
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
