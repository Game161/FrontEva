import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageEvaluations from './pages/admin/ManageEvaluations';
import ManageEvaluationDetails from './pages/admin/ManageEvaluationDetails';
import ManageAssignments from './pages/admin/ManageAssignments';

import AdminReports from './pages/admin/AdminReports';
import EvaluatorDashboard from './pages/evaluator/EvaluatorDashboard';
import EvaluationForm from './pages/evaluator/EvaluationForm';
import EvaluateeDashboard from './pages/evaluatee/EvaluateeDashboard';
import EvaluateeDetails from './pages/evaluatee/EvaluateeDetails';

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />

        {/* Home Redirect based on role */}
        <Route path="/" element={
          !user ? <Navigate to="/login" /> :
            user.role === 'ADMIN' ? <Navigate to="/admin" /> :
              user.role === 'EVALUATOR' ? <Navigate to="/evaluator" /> :
                <Navigate to="/me" />
        } />

        {/* Protected Routes: ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/evaluations" element={<ManageEvaluations />} />
          <Route path="/admin/evaluations/:id" element={<ManageEvaluationDetails />} />
          <Route path="/admin/assignments" element={<ManageAssignments />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

        {/* Protected Routes: EVALUATOR */}
        <Route element={<ProtectedRoute allowedRoles={['EVALUATOR']} />}>
          <Route path="/evaluator" element={<EvaluatorDashboard />} />
          <Route path="/evaluator/assignment/:id/result" element={<EvaluationForm />} />
        </Route>

        {/* Protected Routes: EVALUATEE */}
        <Route element={<ProtectedRoute allowedRoles={['EVALUATEE']} />}>
          <Route path="/me" element={<EvaluateeDashboard />} />
          <Route path="/me/evaluations/:id" element={<EvaluateeDetails />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
