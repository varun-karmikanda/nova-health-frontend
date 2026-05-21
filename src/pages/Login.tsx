import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, LocalHospital } from '@mui/icons-material';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Show/Hide Password
  const [showPassword, setShowPassword] = useState(false);
  
  // Statuses
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 10% 20%, rgba(0, 191, 165, 0.15) 0%, rgba(15, 23, 42, 1) 90%)'
            : 'radial-gradient(circle at 10% 20%, rgba(0, 121, 107, 0.05) 0%, rgba(248, 250, 252, 1) 90%)',
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
            <LocalHospital color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }} color="primary">
              Nova Health
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Clinic Management System Portal
          </Typography>
        </Box>

        <Card sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ p: 4, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Enter your credentials to access your account
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleLoginSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Email Address"
                  type="email"
                  required
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />

                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ mt: 1, height: 48 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Access Account'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
