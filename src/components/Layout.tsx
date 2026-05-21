import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  useTheme,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import EncounterIcon from '@mui/icons-material/HistoryEdu';
import InvoiceIcon from '@mui/icons-material/ReceiptLong';
import AuditIcon from '@mui/icons-material/History';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalHospital from '@mui/icons-material/LocalHospital';
import BadgeIcon from '@mui/icons-material/Badge';


const drawerWidth = 260;

interface LayoutProps {
  toggleColorMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ toggleColorMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const [open, setOpen] = useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'doctor':
        return 'Doctor';
      case 'receptionist':
        return 'Receptionist';
      case 'lab_technician':
        return 'Lab Tech';
      default:
        return 'Staff';
    }
  };

  const getRoleColor = (role?: string): "error" | "primary" | "secondary" | "success" | "warning" => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'doctor':
        return 'primary';
      case 'receptionist':
        return 'secondary';
      case 'lab_technician':
        return 'warning';
      default:
        return 'primary';
    }
  };

  // Define nav links based on role
  const getNavLinks = () => {
    const role = user?.role;
    const links = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    ];

    if (role === 'admin' || role === 'receptionist' || role === 'doctor' || role === 'lab_technician') {
      links.push({ text: 'Patients', icon: <PeopleIcon />, path: '/patients' });
    }

    if (role === 'admin' || role === 'receptionist' || role === 'doctor') {
      links.push({ text: 'Appointments', icon: <CalendarIcon />, path: '/appointments' });
    }

    if (role === 'admin' || role === 'doctor') {
      links.push({ text: 'Clinical Encounters', icon: <EncounterIcon />, path: '/encounters' });
    }

    if (role === 'admin' || role === 'receptionist' || role === 'doctor') {
      links.push({ text: 'Billing & Invoices', icon: <InvoiceIcon />, path: '/invoices' });
    }

    if (role === 'admin') {
      links.push({ text: 'Manage Staff', icon: <BadgeIcon />, path: '/staff' });
      links.push({ text: 'Audit History', icon: <AuditIcon />, path: '/audit' });
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 1 }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <LocalHospital color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
              Nova Health
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.95rem' }}>
                  {user.first_name[0]}
                  {user.last_name[0]}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                  <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                    {user.first_name} {user.last_name}
                  </Typography>
                  <Chip
                    label={getRoleLabel(user.role)}
                    size="small"
                    color={getRoleColor(user.role)}
                    sx={{ height: 18, fontSize: '0.65rem', mt: 0.2, fontWeight: 700 }}
                  />
                </Box>
              </Box>
            )}

            <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

            <Tooltip title="Toggle Theme mode">
              <IconButton onClick={toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Sign Out">
              <IconButton onClick={logout} color="error">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Navigation Bar */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: open ? drawerWidth : 72,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', py: 2 }}>
          <List>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <ListItem key={link.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => navigate(link.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      mx: 1.5,
                      borderRadius: 2,
                      width: 'auto',
                      bgcolor: isActive ? 'primary.main' : 'transparent',
                      color: isActive ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        bgcolor: isActive ? 'primary.main' : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                        color: isActive ? 'primary.contrastText' : 'text.secondary',
                      }}
                    >
                      {link.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={link.text}
                        slotProps={{
                          primary: {
                            sx: {
                              fontWeight: isActive ? 600 : 500,
                              fontSize: '0.9rem',
                            },
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* Primary Content Container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
