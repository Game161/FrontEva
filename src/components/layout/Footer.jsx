import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-primary-700 text-primary-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} Performance Evaluation System. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
