import type { ReactElement } from "react";

type variants = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

export interface ButtonProps {
  variant: variants;
  size: 'sm' | 'md' | 'lg';
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: () => void;
  disabled?: boolean;
}

const variantStyles = {
  primary: "bg-blue-400 hover:bg-blue-600 text-white",
  secondary: "bg-blue-100 hover:bg-blue-200 text-blue-900", 
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  outline: "bg-gray-800 hover:bg-gray-900 text-white"
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5"
};

export const Button = (props: ButtonProps) => {
  const { variant, size, text, startIcon, endIcon, onClick, disabled = false } = props;
  
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-md
        transition-all duration-150 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-[1.01] active:scale-[0.99]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && (
        <span className="transition-transform duration-150 hover:scale-105">
          {startIcon}
        </span>
      )}
      
      <span>{text}</span>
      
      {endIcon && (
        <span className="transition-transform duration-150 hover:scale-105">
          {endIcon}
        </span>
      )}
    </button>
  );
};