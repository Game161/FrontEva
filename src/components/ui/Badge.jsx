import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
        primary: "bg-primary-100 text-primary-800",
        secondary: "bg-secondary-100 text-secondary-800",
        success: "bg-green-100 text-green-800",
        danger: "bg-red-100 text-red-800",
        warning: "bg-yellow-100 text-yellow-800",
        gray: "bg-gray-100 text-gray-800"
    };

    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
