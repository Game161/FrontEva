import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-primary-600">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if unauthorized
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (user.role === 'EVALUATOR') return <Navigate to="/evaluator" replace />;
        if (user.role === 'EVALUATEE') return <Navigate to="/me" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
