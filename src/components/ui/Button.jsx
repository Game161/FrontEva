import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-4 py-2 rounded-lg font-bold transition-colors focus:ring-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-300",
        secondary: "text-white bg-secondary-600 hover:bg-secondary-700 focus:ring-secondary-300",
        outline: "text-primary-600 bg-transparent border-2 border-primary-600 hover:bg-primary-50 focus:ring-primary-200",
        danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-300",
        ghost: "text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-200"
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
