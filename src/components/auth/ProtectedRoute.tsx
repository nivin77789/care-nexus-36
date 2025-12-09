import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/store/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, role, loading } = useAuthStore();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!user || !role) {
        // Redirect to the appropriate login page based on the path user was trying to access
        if (location.pathname.includes('/superadmin')) {
            return <Navigate to="/superadmin/login" state={{ from: location }} replace />;
        }
        if (location.pathname.includes('/admin')) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        if (location.pathname.includes('/client')) {
            return <Navigate to="/client/login" state={{ from: location }} replace />;
        }
        if (location.pathname.includes('/carer') || location.pathname.includes('/caretaker')) {
            return <Navigate to="/carer/login" state={{ from: location }} replace />;
        }
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(role)) {
        // Redirect to their appropriate dashboard if they are logged in but unauthorized
        switch (role) {
            case 'superadmin':
                return <Navigate to="/superadmin/dashboard" replace />;
            case 'admin':
            case 'manager':
                return <Navigate to="/admin/dashboard" replace />;
            case 'client':
                return <Navigate to="/client/dashboard" replace />;
            case 'caretaker':
                return <Navigate to="/caretaker/my-day" replace />;
            default:
                return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};
