
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-6 py-3 font-bold text-lg rounded-lg shadow-lg transform transition-transform duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50 flex items-center justify-center gap-2';

  const variantStyles = {
    primary: 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300 active:scale-95 focus:ring-yellow-400',
    secondary: 'bg-sky-500 text-white hover:bg-sky-400 active:scale-95 focus:ring-sky-500',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
