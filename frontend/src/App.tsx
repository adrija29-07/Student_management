import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

import { DashboardLayout } from './components/DashboardLayout';

import { MentorHome } from './pages/mentor/MentorHome';
import { ReviewQueue } from './pages/mentor/ReviewQueue';
import { ReviewActivity } from './pages/mentor/ReviewActivity';
import { MyStudents } from './pages/mentor/MyStudents';
import { StudentProfile } from './pages/mentor/StudentProfile';
import { MentorReports } from './pages/mentor/MentorReports';
import { MentorSettings } from './pages/mentor/MentorSettings';
import { DepartmentInsights } from './pages/mentor/DepartmentInsights';
import { ClubsAndTeams } from './pages/mentor/ClubsAndTeams';
import { ActivityVerification } from './pages/mentor/ActivityVerification';
import { HackathonTeamBuilder } from './pages/mentor/HackathonTeamBuilder';
import { ClubManagement } from './pages/mentor/ClubManagement';
import { ApprovedActivities } from './pages/mentor/ApprovedActivities';
import { RejectedActivities } from './pages/mentor/RejectedActivities';
import { MentorNotifications } from './pages/mentor/MentorNotifications';

import { MyActivities } from './pages/student/MyActivities';
import { UploadActivity } from './pages/student/UploadActivity';
import { ProgressTracking } from './pages/student/ProgressTracking';
import { MyReports } from './pages/student/MyReports';
import { Notifications } from './pages/student/Notifications';
import { Settings } from './pages/student/Settings';
import { ActivityDetail } from './pages/student/ActivityDetail';
import { StudentClubs } from './pages/student/Clubs';

// Wrapper for general authentication checks
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-650 border-t-transparent"></div>
      </div>
    );
  }

  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Wrapper for role-based authorization check
const RoleProtectedRoute: React.FC<{ children: React.ReactNode; roles: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-650 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    // Dynamic fallback based on what role they are
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'MENTOR') return <Navigate to="/mentor/dashboard" replace />;

    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root route handler that forwards users dynamically based on role
const RootRedirect: React.FC = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-650 border-t-transparent"></div>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'MENTOR') return <Navigate to="/mentor/dashboard" replace />;

  return <Navigate to="/student/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={<Navigate to="/student/dashboard" replace />} 
          />

          <Route 
            path="/student/*" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute roles={['STUDENT']}>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<StudentDashboard />} />
                      <Route path="activities" element={<MyActivities />} />
                      <Route path="activities/:id" element={<ActivityDetail />} />
                      <Route path="upload" element={<UploadActivity />} />
                      <Route path="progress" element={<ProgressTracking />} />
                      <Route path="reports" element={<MyReports />} />
                      <Route path="notifications" element={<Notifications />} />
                      <Route path="clubs" element={<StudentClubs />} />
                      <Route path="settings" element={<Settings />} />
                    </Routes>
                  </DashboardLayout>
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/mentor/*" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute roles={['MENTOR']}>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<MentorHome />} />
                      <Route path="review-queue" element={<ReviewQueue />} />
                      <Route path="review/:id" element={<ReviewActivity />} />
                      <Route path="my-students" element={<MyStudents />} />
                      <Route path="students/:id" element={<StudentProfile />} />
                      {/* Removed: verification, clubs-teams, insights, events per request */}
                      <Route path="approved" element={<ApprovedActivities />} />
                      <Route path="rejected" element={<RejectedActivities />} />
                      <Route path="hackathon" element={<HackathonTeamBuilder />} />
                      <Route path="clubs" element={<ClubManagement />} />
                      <Route path="notifications" element={<MentorNotifications />} />
                      <Route path="reports" element={<MentorReports />} />
                      <Route path="settings" element={<MentorSettings />} />
                    </Routes>
                  </DashboardLayout>
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />


          
          <Route 
            path="/admin" 
            element={<Navigate to="/admin/dashboard" replace />} 
          />

          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <RoleProtectedRoute roles={['ADMIN']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </RoleProtectedRoute>
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
