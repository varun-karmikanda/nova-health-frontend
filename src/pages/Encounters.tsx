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
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import SignIcon from '@mui/icons-material/AssignmentTurnedIn';
import PharmacyIcon from '@mui/icons-material/LocalPharmacy';
import RemoveIcon from '@mui/icons-material/DeleteOutlineOutlined';


export const Encounters: React.FC = () => {
  const { user } = useAuth();
  const [encounters, setEncounters] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<any>(null);

  // Form Fields
  const [appointmentId, setAppointmentId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosesText, setDiagnosesText] = useState(''); // Comma separated
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [notes, setNotes] = useState('');

  // Vitals Fields
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState('72');
  const [temp, setTemp] = useState('98.6');
  const [weight, setWeight] = useState('70');

  // Medication Items Fields
  const [meds, setMeds] = useState<any[]>([
    { name: '', dosage: '', frequency: '', duration: '', refill_count: 0 },
  ]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [encsRes, apptsRes, patientsRes, doctorsRes, rxRes] = await Promise.all([
        api.get('/encounters'),
        api.get('/appointments'),
        api.get('/patients'),
        api.get('/auth/doctors'),
        api.get('/prescriptions'),
      ]);

      setEncounters(encsRes.data?.data || []);
      setAppointments(apptsRes.data?.data || []);
      setPatients(patientsRes.data?.data || []);
      setDoctors(doctorsRes.data?.data || []);
      setPrescriptions(rxRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load clinical encounter data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPatientName = (pId: string) => {
    const p = patients.find((p) => p.id === pId);
    return p ? `${p.first_name} ${p.last_name}` : pId;
  };

  const getDoctorName = (dId: string) => {
    const d = doctors.find((d) => d.id === dId);
    return d ? `Dr. ${d.first_name} ${d.last_name}` : dId;
  };

  const getAppointmentDetails = (aId: string) => {
    const a = appointments.find((appt) => appt.id === aId);
    if (!a) return 'N/A';
    return `${getPatientName(a.patient_id)} on ${new Date(a.scheduledAt).toLocaleDateString()}`;
  };

  const addMedRow = () => {
    setMeds([...meds, { name: '', dosage: '', frequency: '', duration: '', refill_count: 0 }]);
  };

  const removeMedRow = (index: number) => {
    const newMeds = [...meds];
    newMeds.splice(index, 1);
    setMeds(newMeds);
  };

  const handleMedChange = (index: number, field: string, val: string | number) => {
    const newMeds = [...meds];
    newMeds[index][field] = val;
    setMeds(newMeds);
  };

  const openCreateModal = () => {
    if (doctors.length === 0 || patients.length === 0 || appointments.length === 0) {
      alert('Cannot start encounter: Make sure doctors, patients, and appointments exist.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setAppointmentId(appointments[0]?.id || '');
    setSymptoms('');
    setDiagnosesText('');
    setTreatmentPlan('');
    setNotes('');
    setBp('120/80');
    setHr('72');
    setTemp('98.6');
    setWeight('70');
    setMeds([{ name: '', dosage: '', frequency: '', duration: '', refill_count: 0 }]);
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    const selectedAppt = appointments.find((a) => a.id === appointmentId);
    if (!selectedAppt) {
      setErrorMsg('Invalid appointment selected.');
      return;
    }

    try {
      // 1. Create Encounter
      const encResponse = await api.post('/encounters', {
        appointment_id: appointmentId,
        patient_id: selectedAppt.patient_id,
        doctor_id: selectedAppt.doctor_id,
        encounter_date: new Date().toISOString(),
        symptoms,
        diagnoses: diagnosesText.split(',').map((d) => d.trim()).filter(Boolean),
        treatment_plan: treatmentPlan,
        notes,
        vitals: {
          blood_pressure: bp,
          heart_rate: hr,
          temperature: temp,
          weight: weight,
        },
      });

      if (encResponse.data?.success) {
        const encounter = encResponse.data.data;

        // 2. Mark Appointment as Completed
        await api.patch(`/appointments/${appointmentId}`, { status: 'completed' });

        // 3. Draft Prescription if meds have values
        const validMeds = meds.filter((m) => m.name.trim() !== '');
        if (validMeds.length > 0) {
          await api.post('/prescriptions', {
            encounter_id: encounter.id,
            patient_id: selectedAppt.patient_id,
            doctor_id: selectedAppt.doctor_id,
            medication_items: validMeds.map((m) => ({
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              duration: m.duration,
            })),
            instructions: notes,
            refill_count: Number(validMeds[0].refill_count) || 0,
          });
        }

        setSuccessMsg('Clinical encounter recorded & appointment status updated!');
        loadData();
        setTimeout(() => setCreateOpen(false), 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to record encounter.');
    }
  };

  const handleSignPrescription = async (rxId: string) => {
    if (window.confirm('Do you want to sign and authorize this prescription? This action is irreversible.')) {
      try {
        const response = await api.patch(`/prescriptions/${rxId}`, { status: 'signed' });
        if (response.data?.success) {
          loadData();
          if (selectedEncounter) {
            // refresh view modal
            const updatedEncs = await api.get('/encounters');
            const matchingEnc = (updatedEncs.data?.data || []).find((e: any) => e.id === selectedEncounter.id);
            if (matchingEnc) setSelectedEncounter(matchingEnc);
          }
        }
      } catch (err) {
        console.error('Failed to sign prescription', err);
      }
    }
  };

  const handleDispensePrescription = async (rxId: string) => {
    if (window.confirm('Mark this prescription as dispensed?')) {
      try {
        const response = await api.patch(`/prescriptions/${rxId}`, { status: 'dispensed' });
        if (response.data?.success) {
          loadData();
        }
      } catch (err) {
        console.error('Failed to dispense prescription', err);
      }
    }
  };

  const openViewModal = (enc: any) => {
    setSelectedEncounter(enc);
    setViewOpen(true);
  };

  const getPrescriptionForEncounter = (encId: string) => {
    return prescriptions.find((p) => p.encounter_id === encId);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
            Clinical Encounters
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Document clinical complaints, patient vitals, diagnosis codes, and issue digital prescriptions.
          </Typography>
        </Box>
        {(user?.role === 'admin' || user?.role === 'doctor') && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreateModal}>
            Record Encounter
          </Button>
        )}
      </Box>

      {/* Table List of Clinical Encounters */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Attending Doctor</TableCell>
                <TableCell>Symptoms</TableCell>
                <TableCell>Primary Diagnoses</TableCell>
                <TableCell>Prescriptions Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {encounters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No clinical encounter logs found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                encounters.map((enc) => {
                  const rx = getPrescriptionForEncounter(enc.id);
                  return (
                    <TableRow key={enc.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {new Date(enc.encounter_date).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{getPatientName(enc.patient_id)}</TableCell>
                      <TableCell>{getDoctorName(enc.doctor_id)}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {enc.symptoms}
                      </TableCell>
                      <TableCell>
                        {enc.diagnoses?.map((d: string) => (
                          <Chip key={d} label={d} size="small" sx={{ mr: 0.5, fontWeight: 500, fontSize: '0.65rem' }} />
                        )) || 'None'}
                      </TableCell>
                      <TableCell>
                        {rx ? (
                          <Chip
                            label={rx.status.toUpperCase()}
                            size="small"
                            color={rx.status === 'signed' ? 'primary' : rx.status === 'dispensed' ? 'success' : 'default'}
                            sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">No Rx Issued</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => openViewModal(enc)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>

                        {/* Rx Dispensing shortcut action */}
                        {rx && rx.status === 'signed' && (user?.role === 'admin' || user?.role === 'lab_technician' || user?.role === 'receptionist') && (
                          <IconButton color="success" title="Dispense Prescription" onClick={() => handleDispensePrescription(rx.id)}>
                            <PharmacyIcon fontSize="small" />
                          </IconButton>
                        )}

                        {rx && rx.status === 'draft' && (user?.role === 'admin' || user?.role === 'doctor') && (
                          <IconButton color="secondary" title="Sign Prescription" onClick={() => handleSignPrescription(rx.id)}>
                            <SignIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* RECORD CLINICAL ENCOUNTER MODAL */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Record Patient Clinical Encounter</Typography>
          <IconButton onClick={() => setCreateOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleCreateSubmit}>
          <DialogContent dividers>
            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
              Consultation Context
            </Typography>
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid size={12}>
                <FormControl fullWidth required>
                  <InputLabel id="enc-appt-select">Select Appointment</InputLabel>
                  <Select
                    labelId="enc-appt-select"
                    label="Select Appointment"
                    value={appointmentId}
                    onChange={(e) => setAppointmentId(e.target.value)}
                  >
                    {appointments
                      .filter((a) => a.status === 'arrived' || a.status === 'confirmed' || a.status === 'pending')
                      .map((a) => (
                        <MenuItem key={a.id} value={a.id}>
                          {getAppointmentDetails(a.id)} (Reason: {a.reason})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Presenting Symptoms"
                  required
                  multiline
                  rows={2}
                  fullWidth
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Diagnoses (Comma-separated list)"
                  placeholder="Essential Hypertension, Diabetes Mellitus"
                  multiline
                  rows={2}
                  fullWidth
                  value={diagnosesText}
                  onChange={(e) => setDiagnosesText(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Vitals Form Section */}
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
              Patient Vital Signs
            </Typography>
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Blood Pressure (mmHg)"
                  required
                  fullWidth
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Heart Rate (bpm)"
                  required
                  fullWidth
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Temperature (°F)"
                  required
                  fullWidth
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Weight (kg)"
                  required
                  fullWidth
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Prescription Form Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                Issue Medications & Prescriptions
              </Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addMedRow}>
                Add Medicine
              </Button>
            </Box>

            {meds.map((med, index) => (
              <Grid container spacing={1.5} key={index} sx={{ mb: 1.5, alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    size="small"
                    label="Medication Name"
                    fullWidth
                    value={med.name}
                    onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    size="small"
                    label="Dosage"
                    placeholder="e.g. 500mg"
                    fullWidth
                    value={med.dosage}
                    onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    size="small"
                    label="Frequency"
                    placeholder="e.g. Twice Daily"
                    fullWidth
                    value={med.frequency}
                    onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    size="small"
                    label="Duration"
                    placeholder="e.g. 5 Days"
                    fullWidth
                    value={med.duration}
                    onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 1.5 }}>
                  <TextField
                    size="small"
                    label="Refills"
                    type="number"
                    fullWidth
                    value={med.refill_count}
                    onChange={(e) => handleMedChange(index, 'refill_count', Number(e.target.value))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 0.5 }}>
                  {meds.length > 1 && (
                    <IconButton color="error" onClick={() => removeMedRow(index)}>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Treatment Plan / Recommendations"
                  multiline
                  rows={3}
                  fullWidth
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Consultation Notes"
                  multiline
                  rows={3}
                  fullWidth
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Record Consultation</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* VIEW CLINICAL ENCOUNTER DETAIL MODAL */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        {selectedEncounter && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Encounter Summary</Typography>
                <Typography variant="caption" color="text.secondary">
                  Date: {new Date(selectedEncounter.encounter_date).toLocaleString()}
                </Typography>
              </Box>
              <IconButton onClick={() => setViewOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>Demographics Context</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Patient: <strong>{getPatientName(selectedEncounter.patient_id)}</strong>
                </Typography>
                <Typography variant="body2">
                  Doctor: <strong>{getDoctorName(selectedEncounter.doctor_id)}</strong>
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>Clinical Presentation</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Presenting Complaints / Symptoms:</strong><br />
                  {selectedEncounter.symptoms}
                </Typography>
              </Box>

              {selectedEncounter.vitals && (
                <Box sx={{ mb: 2.5, p: 2, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>Patient Vitals</Typography>
                  <Grid container spacing={2}>
                    {Object.entries(selectedEncounter.vitals).map(([key, val]) => (
                      <Grid size={{ xs: 6, sm: 3 }} key={key}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {key.replace('_', ' ')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {String(val)}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>Diagnoses & Plan</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Diagnoses:</strong> {selectedEncounter.diagnoses?.join(', ') || 'None'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Treatment Plan:</strong><br />
                  {selectedEncounter.treatment_plan || 'None'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Consultation Notes:</strong><br />
                  {selectedEncounter.notes || 'None'}
                </Typography>
              </Box>

              {/* Prescription view inside Encounter */}
              {(() => {
                const rx = getPrescriptionForEncounter(selectedEncounter.id);
                if (!rx) return null;
                return (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                          Prescription Details
                        </Typography>
                        <Chip
                          label={rx.status.toUpperCase()}
                          size="small"
                          color={rx.status === 'signed' ? 'primary' : rx.status === 'dispensed' ? 'success' : 'default'}
                        />
                      </Box>
                      {rx.medication_items.map((item: any, idx: number) => (
                        <Typography key={idx} variant="body2" sx={{ mt: 0.5 }}>
                          • <strong>{item.name}</strong> {item.dosage} — {item.frequency} | Duration: {item.duration}
                        </Typography>
                      ))}
                      {rx.instructions && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
                          Instructions: {rx.instructions}
                        </Typography>
                      )}

                      {/* Doctor Signature Action inside modal */}
                      {rx.status === 'draft' && (user?.role === 'admin' || user?.role === 'doctor') && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<SignIcon />}
                          sx={{ mt: 2 }}
                          onClick={() => handleSignPrescription(rx.id)}
                        >
                          Sign & Authorize Rx
                        </Button>
                      )}

                      {/* Pharmacy Dispense Action inside modal */}
                      {rx.status === 'signed' && (user?.role === 'admin' || user?.role === 'lab_technician' || user?.role === 'receptionist') && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<PharmacyIcon />}
                          sx={{ mt: 2 }}
                          onClick={() => handleDispensePrescription(rx.id)}
                        >
                          Dispense Medications
                        </Button>
                      )}
                    </Box>
                  </>
                );
              })()}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
