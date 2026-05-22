import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Button,
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
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';


export const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs status filter
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal Dialogs
  const [bookOpen, setBookOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  // Form Fields
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('pending');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [apptsRes, patientsRes, doctorsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients'),
        api.get('/auth/doctors'),
      ]);

      setAppointments(apptsRes.data?.data || []);
      setPatients(patientsRes.data?.data || []);
      setDoctors(doctorsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load scheduling data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleStatusTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setStatusFilter(newValue);
  };

  const getPatientName = (pId: string) => {
    const p = patients.find((p) => p.id === pId);
    return p ? `${p.first_name} ${p.last_name}` : pId;
  };

  const getDoctorName = (dId: string) => {
    const d = doctors.find((d) => d.id === dId);
    return d ? `Dr. ${d.first_name} ${d.last_name}` : dId;
  };

  const openBookModal = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setPatientId('');
    setDoctorId('');
    // Default scheduled time to tomorrow at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setScheduledAt(tomorrow.toISOString().slice(0, 16));
    setReason('');
    setBookOpen(true);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const response = await api.post('/appointments', {
        patient_id: patientId,
        doctor_id: doctorId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        reason,
      });

      if (response.data?.success) {
        setSuccessMsg('Appointment booked successfully!');
        loadInitialData();
        setTimeout(() => setBookOpen(false), 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to book appointment.');
    }
  };

  const openEditModal = (appt: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedAppt(appt);
    setScheduledAt(appt.scheduled_at.slice(0, 16));
    setReason(appt.reason);
    setStatus(appt.status);
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const response = await api.patch(`/appointments/${selectedAppt.id}`, {
        scheduled_at: new Date(scheduledAt).toISOString(),
        reason,
        status,
      });

      if (response.data?.success) {
        setSuccessMsg('Appointment updated successfully!');
        loadInitialData();
        setTimeout(() => setEditOpen(false), 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to update appointment.');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.patch(`/appointments/${id}`, { status: 'cancelled' });
        loadInitialData();
      } catch (err) {
        console.error('Failed to cancel appointment', err);
      }
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this appointment record?')) {
      try {
        await api.delete(`/appointments/${id}`);
        loadInitialData();
      } catch (err) {
        console.error('Failed to delete appointment', err);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'primary';
      case 'arrived': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no-show': return 'warning';
      default: return 'default';
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (statusFilter === 'all') return true;
    return appt.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
            Appointment Scheduling
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage provider calendars, check-in arrivals, and log medical visit bookings.
          </Typography>
        </Box>
        {(user?.role === 'admin' || user?.role === 'receptionist') && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openBookModal}>
            Book Appointment
          </Button>
        )}
      </Box>

      {/* Status Filtering Tabs */}
      <Paper sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={handleStatusTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="all" label="All Bookings" />
          <Tab value="pending" label="Pending" />
          <Tab value="confirmed" label="Confirmed" />
          <Tab value="arrived" label="Arrived" />
          <Tab value="completed" label="Completed" />
          <Tab value="cancelled" label="Cancelled" />
        </Tabs>
      </Paper>

      {/* Appointments List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Token #</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Practitioner</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Purpose of Visit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No appointments scheduled for this selection.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appt) => (
                  <TableRow key={appt.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {appt.status === 'cancelled' ? '-' : `#${appt.token_number}`}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {getPatientName(appt.patient_id)}
                    </TableCell>
                    <TableCell>{getDoctorName(appt.doctor_id)}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {new Date(appt.scheduled_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </TableCell>
                    <TableCell>{appt.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={appt.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(appt.status)}
                        sx={{ fontWeight: 600, fontSize: '0.65rem', height: 18 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {(user?.role === 'admin' || user?.role === 'receptionist') && (
                        <>
                          <IconButton color="primary" onClick={() => openEditModal(appt)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                            <IconButton color="error" onClick={() => handleCancelAppointment(appt.id)}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          )}
                        </>
                      )}
                      {user?.role === 'admin' && (
                        <IconButton color="error" onClick={() => handleDeleteAppointment(appt.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* BOOK APPOINTMENT MODAL */}
      <Dialog open={bookOpen} onClose={() => setBookOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Schedule Patient Visit</Typography>
          <IconButton onClick={() => setBookOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleBookSubmit}>
          <DialogContent dividers>
            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
            <Grid container spacing={2.5}>
              <Grid size={12}>
                <Autocomplete
                  options={patients}
                  getOptionLabel={(p) => `${p.first_name} ${p.last_name} (${p.phone})`}
                  value={patients.find((p) => p.id === patientId) || null}
                  onChange={(_event, newValue) => {
                    setPatientId(newValue ? newValue.id : '');
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Patient"
                      required={!patientId}
                      placeholder="Search patient by name or phone..."
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  options={doctors}
                  getOptionLabel={(d) => `Dr. ${d.first_name} ${d.last_name} (${d.email})`}
                  value={doctors.find((d) => d.id === doctorId) || null}
                  onChange={(_event, newValue) => {
                    setDoctorId(newValue ? newValue.id : '');
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assigned Doctor"
                      required={!doctorId}
                      placeholder="Search doctor by name or email..."
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Appointment Date & Time"
                  type="datetime-local"
                  required
                  fullWidth
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Reason for Visit"
                  required
                  multiline
                  rows={3}
                  fullWidth
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setBookOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Book Appointment</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* EDIT APPOINTMENT MODAL */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Update Appointment Details</Typography>
          <IconButton onClick={() => setEditOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent dividers>
            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

            <Grid container spacing={2.5}>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Patient: <strong>{selectedAppt && getPatientName(selectedAppt.patient_id)}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Doctor: <strong>{selectedAppt && getDoctorName(selectedAppt.doctor_id)}</strong>
                </Typography>
              </Grid>

              <Grid size={12}>
                <FormControl fullWidth required>
                  <InputLabel id="edit-status-label">Appointment Status</InputLabel>
                  <Select
                    labelId="edit-status-label"
                    label="Appointment Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="arrived">Arrived (Checked In)</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="no-show">No-Show</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Appointment Date & Time"
                  type="datetime-local"
                  required
                  fullWidth
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Reason for Visit"
                  required
                  multiline
                  rows={3}
                  fullWidth
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Save Changes</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
