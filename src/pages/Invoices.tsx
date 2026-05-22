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
  Divider,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';

export const Invoices: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<any>(null);

  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [items, setItems] = useState<any[]>([{ description: '', amount: 0 }]);
  const [additionalPayment, setAdditionalPayment] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, patientsRes, apptsRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/patients'),
        api.get('/appointments'),
      ]);
      setInvoices(invoicesRes.data?.data || []);
      setPatients(patientsRes.data?.data || []);
      setAppointments(apptsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load invoice billing data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleStatusTabChange = (_event: React.SyntheticEvent, newValue: string) => setStatusFilter(newValue);

  const getPatientName = (pId: string) => {
    const p = patients.find((p) => p.id === pId);
    return p ? `${p.first_name} ${p.last_name}` : pId;
  };

  const getAppointmentText = (apptId: string) => {
    const appt = appointments.find((a) => a.id === apptId);
    if (!appt) return apptId;
    return `Visit on ${new Date(appt.scheduled_at).toLocaleDateString()} (${appt.reason})`;
  };

  const addItemRow = () => setItems([...items, { description: '', amount: 0 }]);

  const removeItemRow = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const calculateTotal = () => calculateSubtotal() + Number(taxAmount);

  const openCreateModal = () => {
    setErrorMsg(''); setSuccessMsg('');
    setSelectedInvoiceForEdit(null);
    setPatientId('');
    setAppointmentId('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
    setTaxAmount(0); setPaidAmount(0);
    setItems([{ description: 'General Consultation Fee', amount: 500 }]);
    setCreateOpen(true);
  };

  const openEditModal = (inv: any) => {
    setErrorMsg(''); setSuccessMsg('');
    setSelectedInvoiceForEdit(inv);
    setPatientId(inv.patient_id);
    setAppointmentId(inv.appointment_id);
    setDueDate(inv.due_date ? inv.due_date.split('T')[0] : '');
    setTaxAmount(inv.tax_amount || 0);
    setPaidAmount(inv.paid_amount || 0);
    setItems(inv.items || [{ description: '', amount: 0 }]);
    setCreateOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const finalTotal = calculateTotal();
    try {
      let response;
      const payload = {
        patient_id: patientId,
        appointment_id: appointmentId,
        total_amount: finalTotal,
        tax_amount: Number(taxAmount),
        paid_amount: Number(paidAmount),
        due_date: new Date(dueDate).toISOString(),
        items: items.map((item) => ({ description: item.description, amount: Number(item.amount) })),
      };

      if (selectedInvoiceForEdit) {
        response = await api.patch(`/invoices/${selectedInvoiceForEdit.id}`, payload);
      } else {
        response = await api.post('/invoices', payload);
      }

      if (response.data?.success) {
        setSuccessMsg(selectedInvoiceForEdit ? 'Invoice updated successfully!' : 'Invoice generated successfully!');
        loadData();
        setTimeout(() => {
          setCreateOpen(false);
          setSelectedInvoiceForEdit(null);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to save invoice.');
    }
  };

  const openPaymentModal = (invoice: any) => {
    setErrorMsg(''); setSuccessMsg('');
    setSelectedInvoice(invoice);
    setAdditionalPayment(0);
    setPaymentOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const newPaidAmount = (selectedInvoice.paid_amount || 0) + Number(additionalPayment);
    let newStatus = selectedInvoice.status;
    if (newPaidAmount >= selectedInvoice.total_amount) newStatus = 'paid';
    else if (newPaidAmount > 0) newStatus = 'partially_paid';
    try {
      const response = await api.patch(`/invoices/${selectedInvoice.id}`, { paid_amount: newPaidAmount, status: newStatus });
      if (response.data?.success) {
        setSuccessMsg('Payment recorded successfully!');
        loadData();
        setTimeout(() => setPaymentOpen(false), 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to record payment.');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this invoice?')) {
      try { await api.delete(`/invoices/${id}`); loadData(); }
      catch (err) { console.error('Failed to delete invoice', err); }
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'paid') return inv.status === 'paid';
    if (statusFilter === 'unpaid') return inv.status !== 'paid';
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
            Billing & Invoices
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Process patient accounts, compile itemized billing invoices, and log cash/card payments.
          </Typography>
        </Box>
        {(user?.role === 'admin' || user?.role === 'receptionist') && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreateModal}>
            Generate Invoice
          </Button>
        )}
      </Box>

      <Paper sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Tabs value={statusFilter} onChange={handleStatusTabChange} indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="auto">
          <Tab value="all" label="All Invoices" />
          <Tab value="paid" label="Paid" />
          <Tab value="unpaid" label="Not Paid" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress color="primary" /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Scheduled Visit</TableCell>
                <TableCell>Total Bill</TableCell>
                <TableCell>Paid Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No invoices matching the selected status.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{inv.id.slice(0, 8)}...</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{getPatientName(inv.patient_id)}</TableCell>
                    <TableCell>{getAppointmentText(inv.appointment_id)}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>${inv.total_amount.toFixed(2)}</TableCell>
                    <TableCell sx={{ color: inv.paid_amount >= inv.total_amount ? 'success.main' : 'text.secondary' }}>
                      ${inv.paid_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {inv.status === 'paid' ? (
                        <Chip label="PAID" size="small" color="success" sx={{ fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                      ) : (
                        <Chip label="NOT PAID" size="small" color="error" sx={{ fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {(user?.role === 'admin' || user?.role === 'receptionist') && inv.status !== 'paid' && inv.status !== 'cancelled' && (
                        <IconButton color="secondary" onClick={() => openEditModal(inv)} title="Edit Invoice">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {(user?.role === 'admin' || user?.role === 'receptionist') && inv.status !== 'paid' && (
                        <IconButton color="primary" onClick={() => openPaymentModal(inv)} title="Record Payment">
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton onClick={() => window.print()} title="Print Invoice">
                        <PrintIcon fontSize="small" />
                      </IconButton>
                      {user?.role === 'admin' && (
                        <IconButton color="error" onClick={() => handleDeleteInvoice(inv.id)} title="Delete Invoice">
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

      {/* CREATE / EDIT INVOICE DIALOG */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {selectedInvoiceForEdit ? 'Edit Billing Invoice' : 'Generate New Billing Invoice'}
          </Typography>
          <IconButton onClick={() => setCreateOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent dividers>
            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={patients}
                  getOptionLabel={(p) => `${p.first_name} ${p.last_name} (${p.phone})`}
                  value={patients.find((p) => p.id === patientId) || null}
                  onChange={(_event, newValue) => {
                    setPatientId(newValue ? newValue.id : '');
                    setAppointmentId('');
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required disabled={!patientId}>
                  <InputLabel id="inv-appt-label">Linked Appointment</InputLabel>
                  <Select
                    labelId="inv-appt-label"
                    label="Linked Appointment"
                    value={appointmentId}
                    onChange={(e) => setAppointmentId(e.target.value)}
                  >
                    {appointments.filter((a) => a.patient_id === patientId).length === 0 ? (
                      <MenuItem value="" disabled>No appointments found for this patient</MenuItem>
                    ) : (
                      appointments
                        .filter((a) => a.patient_id === patientId)
                        .map((a) => (
                          <MenuItem key={a.id} value={a.id}>
                            {new Date(a.scheduled_at).toLocaleDateString()} at {new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {a.reason}
                          </MenuItem>
                        ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Tax / Add-ons ($)" type="number" fullWidth value={taxAmount} onChange={(e) => setTaxAmount(Number(e.target.value))} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Upfront Paid Amount ($)" type="number" fullWidth value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>Itemized Fees</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addItemRow}>Add Line Item</Button>
            </Box>

            {items.map((item, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 1.5, alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField size="small" label="Item Description" required fullWidth value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField size="small" label="Amount ($)" type="number" required fullWidth value={item.amount} onChange={(e) => handleItemChange(index, 'amount', Number(e.target.value))} />
                </Grid>
                <Grid size={{ xs: 12, sm: 1 }}>
                  {items.length > 1 && (
                    <IconButton color="error" onClick={() => removeItemRow(index)}><RemoveIcon /></IconButton>
                  )}
                </Grid>
              </Grid>
            ))}

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1.5 }}>
              <Typography variant="body2">Subtotal: <strong>${calculateSubtotal().toFixed(2)}</strong></Typography>
              <Typography variant="body2" sx={{ my: 0.5 }}>Tax: <strong>${taxAmount.toFixed(2)}</strong></Typography>
              <Typography variant="h6" color="primary">Total Bill: <strong>${calculateTotal().toFixed(2)}</strong></Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedInvoiceForEdit ? 'Update Invoice' : 'Generate Invoice'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* RECORD PAYMENT DIALOG */}
      <Dialog open={paymentOpen} onClose={() => setPaymentOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Record Invoice Payment</Typography>
          <IconButton onClick={() => setPaymentOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handlePaymentSubmit}>
          <DialogContent dividers>
            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
            {selectedInvoice && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">Patient: <strong>{getPatientName(selectedInvoice.patient_id)}</strong></Typography>
                <Typography variant="body2" color="text.secondary">Total Bill: <strong>${selectedInvoice.total_amount.toFixed(2)}</strong></Typography>
                <Typography variant="body2" color="text.secondary">Currently Paid: <strong>${selectedInvoice.paid_amount.toFixed(2)}</strong></Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mt: 1 }}>
                  Outstanding Balance: <strong>${(selectedInvoice.total_amount - selectedInvoice.paid_amount).toFixed(2)}</strong>
                </Typography>
              </Box>
            )}
            <TextField label="Record Additional Payment ($)" type="number" required fullWidth autoFocus value={additionalPayment} onChange={(e) => setAdditionalPayment(Number(e.target.value))} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Record Payment</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
