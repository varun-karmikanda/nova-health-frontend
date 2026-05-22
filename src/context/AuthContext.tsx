import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { api } from '../services/api';

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'lab_technician';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  role: UserRole;
  salary: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerUser: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inner provider that requires being inside <Router>
const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.success) {
        setUser(response.data.data);
      } else {
        doLogout();
      }
    } catch (err) {
      doLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { accessToken, refreshToken } = response.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Fetch full profile details (token already stored, interceptor will send it)
        const profileResponse = await api.get('/auth/me');
        if (profileResponse.data && profileResponse.data.success) {
          setUser(profileResponse.data.data);
          const origin = (location.state as any)?.from?.pathname || '/';
          navigate(origin, { replace: true });
        }
      }
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const doLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const logout = () => {
    doLogout();
    navigate('/login', { replace: true });
  };

  const registerUser = async (data: any) => {
    await api.post('/auth/register', data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Exported AuthProvider — wraps the inner one (Router must be outside this)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProviderInner>{children}</AuthProviderInner>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Route guard props
interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

// PrivateRoute — guards authenticated routes
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // App-level loader will show spinner
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Backwards compat alias
export const ProtectedRoute = PrivateRoute;
