import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/AdminPanelSettings';


export const Staff: React.FC = () => {
  const { user, registerUser } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dialog State for Registration
  const [openAdd, setOpenAdd] = useState(false);
  
  // Registration Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [salary, setSalary] = useState('3000');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dialog State for Delete Confirmation
  const [openDelete, setOpenDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await api.get(`/auth/users?include_deactivated=${showDeactivated}`);
      setStaff(response.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load staff list', err);
      setErrorMsg(err.response?.data?.error?.message || 'Access Denied: Only administrators can view staff directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadStaff();
    } else {
      setLoading(false);
      setErrorMsg('Forbidden: You must be an administrator to access the staff directory.');
    }
  }, [user, showDeactivated]);

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      tempErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      tempErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!lastName.trim()) {
      tempErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      tempErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      tempErrors.email = 'Invalid email address format';
    }

    if (!phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(phone.trim())) {
      tempErrors.phone = 'Phone number must be between 10 and 15 digits';
    }

    if (!salary.trim()) {
      tempErrors.salary = 'Monthly salary is required';
    } else if (isNaN(Number(salary)) || Number(salary) <= 0) {
      tempErrors.salary = 'Salary must be a positive number';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleOpenAdd = () => {
    // Reset fields
    setFirstName('');
    setLastName('');
    setGender('Male');
    setEmail('');
    setPhone('');
    setRole('doctor');
    setSalary('3000');
    setPassword('');
    setSuccessMsg('');
    setErrorMsg('');
    setErrors({});
    setOpenAdd(true);
  };

  const handleCloseAdd = () => {
    setErrors({});
    setOpenAdd(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!validateForm()) {
      return;
    }
    setFormLoading(true);
    try {
      await registerUser({
        first_name: firstName,
        last_name: lastName,
        gender,
        email,
        phone,
        role,
        password,
        salary: Number(salary) || 0,
      });
      setSuccessMsg('Staff member registered successfully!');
      handleCloseAdd();
      loadStaff();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to register staff member.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setDeletingId(null);
    setOpenDelete(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.delete(`/auth/users/${deletingId}`);
      setSuccessMsg('Staff member account deactivated successfully.');
      handleCloseDelete();
      loadStaff();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to deactivate staff member.');
      handleCloseDelete();
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleLabel = (r?: string) => {
    switch (r) {
      case 'admin': return 'Administrator';
      case 'doctor': return 'Doctor';
      case 'receptionist': return 'Receptionist';
      case 'lab_technician': return 'Lab Tech';
      default: return 'Staff';
    }
  };

  const getRoleColor = (r?: string): "error" | "primary" | "secondary" | "success" | "warning" => {
    switch (r) {
      case 'admin': return 'error';
      case 'doctor': return 'primary';
      case 'receptionist': return 'secondary';
      case 'lab_technician': return 'warning';
      default: return 'primary';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <ShieldIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }} color="error" gutterBottom>
          Administrative Access Required
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You do not have permission to view or manage system users. Please contact your system administrator.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
            Clinic Staff Directory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system portal user credentials, assign roles, and handle staff details.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ height: 42, px: 3, fontWeight: 600, borderRadius: 2 }}
        >
          Register Staff Member
        </Button>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showDeactivated}
              onChange={(e) => setShowDeactivated(e.target.checked)}
              color="error"
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Show Deactivated Accounts
            </Typography>
          }
        />
      </Box>

      {/* Staff Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Monthly Salary</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No registered staff found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {s.first_name} {s.last_name}
                      {s.id === user.id && (
                        <Chip
                          label="YOU"
                          size="small"
                          color="info"
                          sx={{ ml: 1, height: 16, fontSize: '0.6rem', fontWeight: 800 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(s.role)}
                        size="small"
                        color={getRoleColor(s.role)}
                        sx={{ fontWeight: 700, fontSize: '0.65rem', height: 18 }}
                      />
                    </TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>{s.gender}</TableCell>
                    <TableCell>${(s.salary || 0).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      {s.is_active === false ? (
                        <Chip
                          label="DEACTIVATED"
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ fontWeight: 800, fontSize: '0.65rem', height: 18 }}
                        />
                      ) : s.id !== user.id ? (
                        <Tooltip title="Deactivate / Delete Staff Account">
                          <IconButton color="error" onClick={() => handleOpenDelete(s.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', pr: 1.5 }}>
                          Self Account
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* REGISTER NEW STAFF MODAL */}
      <Dialog open={openAdd} onClose={handleCloseAdd} maxWidth="sm" fullWidth>
        <form onSubmit={handleAddSubmit} noValidate>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Register New Staff Member</Typography>
            <IconButton onClick={handleCloseAdd} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="First Name"
                    required
                    fullWidth
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Last Name"
                    required
                    fullWidth
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required error={!!errors.gender}>
                    <InputLabel id="gender-select-label">Gender</InputLabel>
                    <Select
                      labelId="gender-select-label"
                      label="Gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                    {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required error={!!errors.role}>
                    <InputLabel id="role-select-label">Portal Access Role</InputLabel>
                    <Select
                      labelId="role-select-label"
                      label="Portal Access Role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                    >
                      <MenuItem value="admin">System Administrator</MenuItem>
                      <MenuItem value="doctor">Clinic Doctor / Practitioner</MenuItem>
                      <MenuItem value="receptionist">Receptionist / Front Desk</MenuItem>
                      <MenuItem value="lab_technician">Laboratory Technician</MenuItem>
                    </Select>
                    {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                label="Email Address"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
              />

              <TextField
                label="Phone Number"
                required
                fullWidth
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
              />

              <TextField
                label="Monthly Salary ($)"
                type="number"
                required
                fullWidth
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                error={!!errors.salary}
                helperText={errors.salary}
              />

              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                helperText={errors.password || "Must be at least 6 characters long."}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseAdd} color="inherit">Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formLoading}
              sx={{ minWidth: 120 }}
            >
              {formLoading ? <CircularProgress size={20} color="inherit" /> : 'Register Staff'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* CONFIRM DELETE MODAL */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle sx={{ fontWeight: 700 }}>Deactivate Staff Account?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to deactivate and remove this staff member from the clinic portal? 
            They will lose immediate access and will not be able to log back in.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDelete} color="inherit">Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            autoFocus
          >
            {deleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Deactivate Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
