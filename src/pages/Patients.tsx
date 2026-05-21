import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Box,
  Typography,
  Button,
  TextField,
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
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ContactPhone as ContactIcon,
  HistoryEdu as EncounterIcon,
  ReceiptLong as InvoiceIcon,
  History as AuditIcon,
} from '@mui/icons-material';

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  // Tab index for Details Dialog
  const [activeTab, setActiveTab] = useState(0);

  // Patient Sub-History lists
  const [encounters, setEncounters] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form Fields
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    gender: 'male',
    blood_group: 'O+',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
    },
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients');
      if (response.data && response.data.success) {
        setPatients(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleGenderFilterChange = (e: any) => {
    setGenderFilter(e.target.value);
  };

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const phone = patient.phone.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || phone.includes(search.toLowerCase());
    const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const openAddForm = () => {
    setEditMode(false);
    setFormError('');
    setFormSuccess('');
    setFormData({
      first_name: '',
      last_name: '',
      dob: '',
      gender: 'male',
      blood_group: 'O+',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
      },
    });
    setFormOpen(true);
  };

  const openEditForm = (patient: any) => {
    setEditMode(true);
    setFormError('');
    setFormSuccess('');
    setFormData({
      first_name: patient.first_name,
      last_name: patient.last_name,
      dob: patient.dob.substring(0, 10), // Extract YYYY-MM-DD
      gender: patient.gender,
      blood_group: patient.blood_group,
      phone: patient.phone,
      email: patient.email || '',
      address: {
        street: patient.address?.street || '',
        city: patient.address?.city || '',
        state: patient.address?.state || '',
        zip_code: patient.address?.zip_code || '',
        country: patient.address?.country || '',
      },
    });
    setSelectedPatient(patient);
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editMode && selectedPatient) {
        const response = await api.patch(`/patients/${selectedPatient.id}`, formData);
        if (response.data?.success) {
          setFormSuccess('Patient updated successfully!');
          fetchPatients();
          setTimeout(() => setFormOpen(false), 1200);
        }
      } else {
        const response = await api.post('/patients', formData);
        if (response.data?.success) {
          setFormSuccess('Patient registered successfully!');
          fetchPatients();
          setTimeout(() => setFormOpen(false), 1200);
        }
      }
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to submit patient details.');
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      } catch (err) {
        console.error('Failed to delete patient', err);
      }
    }
  };

  const openDetails = async (patient: any) => {
    setSelectedPatient(patient);
    setActiveTab(0);
    setDetailOpen(true);
    setLoadingHistory(true);

    try {
      // Fetch sub-histories
      const [encountersRes, prescriptionsRes, invoicesRes, auditRes] = await Promise.all([
        api.get('/encounters'),
        api.get('/prescriptions'),
        api.get('/invoices'),
        api.get(`/audit/entity/Patient/${patient.id}`).catch(() => ({ data: { data: [] } })), // Optional helper
      ]);

      // Filter local lists
      const patientEncounters = (encountersRes.data?.data || []).filter((e: any) => e.patient_id === patient.id);
      const patientPrescriptions = (prescriptionsRes.data?.data || []).filter((p: any) => p.patient_id === patient.id);
      const patientInvoices = (invoicesRes.data?.data || []).filter((i: any) => i.patient_id === patient.id);
      const logs = auditRes.data?.data || [];

      setEncounters(patientEncounters);
      setPrescriptions(patientPrescriptions);
      setInvoices(patientInvoices);
      setAuditLogs(logs);

    } catch (err) {
      console.error('Failed to load patient history details', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNestedAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
            Patients Registry
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage demographics, clinical visits, billing records, and audit logs.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openAddForm}>
          Register Patient
        </Button>
      </Box>

      {/* Filter Options */}
      <Paper sx={{ p: 2.5, mb: 3.5, display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap', border: '1px solid', borderColor: 'divider' }}>
        <TextField
          size="small"
          label="Search by Name or Phone"
          value={search}
          onChange={handleSearchChange}
          sx={{ minWidth: 280 }}
          slotProps={{
            input: {
              endAdornment: <SearchIcon color="action" fontSize="small" />,
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="gender-filter-label">Filter Gender</InputLabel>
          <Select
            labelId="gender-filter-label"
            label="Filter Gender"
            value={genderFilter}
            onChange={handleGenderFilterChange}
          >
            <MenuItem value="all">All Genders</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Main Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>DOB (Age)</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Blood Group</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No patient records match the filter.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => {
                  const birthDate = new Date(patient.dob);
                  const age = new Date().getFullYear() - birthDate.getFullYear();
                  return (
                    <TableRow key={patient.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {patient.first_name} {patient.last_name}
                      </TableCell>
                      <TableCell>
                        {birthDate.toLocaleDateString()} ({age} yrs)
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={patient.gender.toUpperCase()}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: '0.65rem', height: 18 }}
                        />
                      </TableCell>
                      <TableCell>{patient.blood_group}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{patient.email || 'N/A'}</TableCell>
                      <TableCell>
                        {patient.address?.city}, {patient.address?.state}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => openDetails(patient)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="secondary" onClick={() => openEditForm(patient)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeletePatient(patient.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* CREATE & EDIT FORM DIALOG */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editMode ? 'Edit Patient Profile' : 'Register New Patient'}
          </Typography>
          <IconButton onClick={() => setFormOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent dividers>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            {formSuccess && <Alert severity="success" sx={{ mb: 2 }}>{formSuccess}</Alert>}

            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
              Personal Demographics
            </Typography>
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="First Name"
                  required
                  fullWidth
                  value={formData.first_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Last Name"
                  required
                  fullWidth
                  value={formData.last_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Date of Birth"
                  type="date"
                  required
                  fullWidth
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                  value={formData.dob}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth required>
                  <InputLabel id="form-gender-label">Gender</InputLabel>
                  <Select
                    labelId="form-gender-label"
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value as any }))}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth required>
                  <InputLabel id="form-blood-label">Blood Group</InputLabel>
                  <Select
                    labelId="form-blood-label"
                    label="Blood Group"
                    value={formData.blood_group}
                    onChange={(e) => setFormData((prev) => ({ ...prev, blood_group: e.target.value as any }))}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Phone Number"
                  required
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
              Address Details
            </Typography>
            <Grid container spacing={2.5}>
              <Grid size={12}>
                <TextField
                  label="Street Address"
                  required
                  fullWidth
                  value={formData.address.street}
                  onChange={(e) => handleNestedAddressChange('street', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="City"
                  required
                  fullWidth
                  value={formData.address.city}
                  onChange={(e) => handleNestedAddressChange('city', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="State / Province"
                  required
                  fullWidth
                  value={formData.address.state}
                  onChange={(e) => handleNestedAddressChange('state', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Zip / Postal Code"
                  required
                  fullWidth
                  value={formData.address.zip_code}
                  onChange={(e) => handleNestedAddressChange('zip_code', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Country"
                  required
                  fullWidth
                  value={formData.address.country}
                  onChange={(e) => handleNestedAddressChange('country', e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editMode ? 'Save Changes' : 'Register'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        {selectedPatient && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Patient ID: {selectedPatient.id}
                </Typography>
              </Box>
              <IconButton onClick={() => setDetailOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <Tabs
              value={activeTab}
              onChange={(_e, v) => setActiveTab(v)}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Demographics" icon={<ContactIcon />} iconPosition="start" />
              <Tab label="Encounters" icon={<EncounterIcon />} iconPosition="start" />
              <Tab label="Invoices" icon={<InvoiceIcon />} iconPosition="start" />
              <Tab label="Audit Logs" icon={<AuditIcon />} iconPosition="start" />
            </Tabs>

            <DialogContent sx={{ p: 3, minHeight: 400 }}>
              {loadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress color="primary" />
                </Box>
              ) : (
                <Box>
                  {/* TAB 0: DEMOGRAPHICS */}
                  {activeTab === 0 && (
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="primary" sx={{ fontWeight: 600 }} gutterBottom>Personal Information</Typography>
                            <Grid container spacing={1.5} sx={{ mt: 1 }}>
                              <Grid size={6}><Typography variant="body2" color="text.secondary">Gender:</Typography></Grid>
                              <Grid size={6}><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedPatient.gender.toUpperCase()}</Typography></Grid>
                              <Grid size={6}><Typography variant="body2" color="text.secondary">Blood Group:</Typography></Grid>
                              <Grid size={6}><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedPatient.blood_group}</Typography></Grid>
                              <Grid size={6}><Typography variant="body2" color="text.secondary">DOB:</Typography></Grid>
                              <Grid size={6}><Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(selectedPatient.dob).toLocaleDateString()}</Typography></Grid>
                              <Grid size={6}><Typography variant="body2" color="text.secondary">Registered At:</Typography></Grid>
                              <Grid size={6}><Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(selectedPatient.created_at).toLocaleDateString()}</Typography></Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography color="primary" sx={{ fontWeight: 600 }} gutterBottom>Contact & Address</Typography>
                            <Grid container spacing={1.5} sx={{ mt: 1 }}>
                              <Grid size={4}><Typography variant="body2" color="text.secondary">Phone:</Typography></Grid>
                              <Grid size={8}><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedPatient.phone}</Typography></Grid>
                              <Grid size={4}><Typography variant="body2" color="text.secondary">Email:</Typography></Grid>
                              <Grid size={8}><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedPatient.email || 'N/A'}</Typography></Grid>
                              <Grid size={4}><Typography variant="body2" color="text.secondary">Address:</Typography></Grid>
                              <Grid size={8}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {selectedPatient.address?.street},<br />
                                  {selectedPatient.address?.city}, {selectedPatient.address?.state}<br />
                                  {selectedPatient.address?.zip_code}, {selectedPatient.address?.country}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  )}

                  {/* TAB 1: ENCOUNTERS */}
                  {activeTab === 1 && (
                    <Box>
                      {encounters.length === 0 ? (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>No clinical encounter history recorded.</Typography>
                      ) : (
                        encounters.map((enc) => {
                          const matchingRx = prescriptions.filter((p) => p.encounter_id === enc.id);
                          return (
                            <Paper key={enc.id} variant="outlined" sx={{ p: 2.5, mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                                  Visit Date: {new Date(enc.encounter_date).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Encounter ID: {enc.id}
                                </Typography>
                              </Box>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body2" sx={{ mt: 1 }}><strong>Symptoms:</strong> {enc.symptoms}</Typography>
                              <Typography variant="body2" sx={{ mt: 1 }}><strong>Diagnosis:</strong> {enc.diagnoses?.join(', ') || 'None'}</Typography>
                              <Typography variant="body2" sx={{ mt: 1 }}><strong>Treatment Plan:</strong> {enc.treatment_plan || 'None'}</Typography>
                              
                              {enc.vitals && (
                                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>VITALS RECORDED</Typography>
                                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                    {Object.entries(enc.vitals).map(([key, val]) => (
                                      <Grid size={4} key={key}>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(val)}</Typography>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              )}

                              {matchingRx.length > 0 && (
                                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>ISSUED PRESCRIPTIONS</Typography>
                                  {matchingRx.map((rx) => (
                                    <Box key={rx.id} sx={{ mt: 1 }}>
                                      {rx.medication_items.map((med: any, mi: number) => (
                                        <Typography key={mi} variant="body2">
                                          • <strong>{med.name}</strong> - {med.dosage} ({med.frequency}) | Duration: {med.duration}
                                        </Typography>
                                      ))}
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Paper>
                          );
                        })
                      )}
                    </Box>
                  )}

                  {/* TAB 2: INVOICES */}
                  {activeTab === 2 && (
                    <Box>
                      {invoices.length === 0 ? (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>No invoice history found.</Typography>
                      ) : (
                        <TableContainer component={Paper} variant="outlined">
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Invoice Date</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Total Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Invoice ID</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {invoices.map((inv) => (
                                <TableRow key={inv.id}>
                                  <TableCell>{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                                  <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                                  <TableCell>${inv.totalAmount.toLocaleString()}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={inv.status.toUpperCase()}
                                      size="small"
                                      color={inv.status === 'Paid' ? 'success' : inv.status === 'Draft' ? 'default' : 'warning'}
                                      sx={{ fontWeight: 600, fontSize: '0.65rem' }}
                                    />
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                    {inv.id}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Box>
                  )}

                  {/* TAB 3: AUDIT LOGS */}
                  {activeTab === 3 && (
                    <Box>
                      {auditLogs.length === 0 ? (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>No audit trails recorded for this patient.</Typography>
                      ) : (
                        auditLogs.map((log) => (
                          <Paper key={log.id} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle2" color="secondary.dark" sx={{ fontWeight: 600 }}>
                                Action: {log.action}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(log.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              <strong>User Actor ID:</strong> {log.userId}
                            </Typography>
                            {log.changes && (
                              <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.75rem', overflowX: 'auto' }}>
                                {JSON.stringify(log.changes, null, 2)}
                              </Box>
                            )}
                          </Paper>
                        ))
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
