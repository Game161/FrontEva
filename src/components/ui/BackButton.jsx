import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ className = '' }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors ${className}`}
        >
            <ArrowLeft size={16} />
            ย้อนกลับ
        </button>
    );
};

export default BackButton;
