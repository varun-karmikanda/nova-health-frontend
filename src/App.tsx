import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme';
import { AuthProvider, PrivateRoute } from './context/AuthContext';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Appointments } from './pages/Appointments';
import { Encounters } from './pages/Encounters';
import { Invoices } from './pages/Invoices';
import { Audit } from './pages/Audit';
import { Staff } from './pages/Staff';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const activeTheme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Router>
        {/* AuthProvider must be inside Router so it can use useNavigate */}
        <AuthProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes — Layout uses <Outlet /> for child pages */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout toggleColorMode={toggleColorMode} />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="patients" element={<Patients />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="encounters" element={<Encounters />} />
              <Route path="invoices" element={<Invoices />} />

              {/* Admin-only route */}
              <Route
                path="audit"
                element={
                  <PrivateRoute roles={['admin']}>
                    <Audit />
                  </PrivateRoute>
                }
              />
              <Route
                path="staff"
                element={
                  <PrivateRoute roles={['admin']}>
                    <Staff />
                  </PrivateRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
