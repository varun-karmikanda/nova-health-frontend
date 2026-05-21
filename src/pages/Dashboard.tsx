import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Paper,
  CircularProgress,
  Avatar,
} from '@mui/material';
import PatientsIcon from '@mui/icons-material/PeopleAlt';
import CalendarIcon from '@mui/icons-material/EventNote';
import RevenueIcon from '@mui/icons-material/AttachMoney';
import WorkloadIcon from '@mui/icons-material/Speed';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patientsCount: 0,
    appointmentsCount: 0,
    totalRevenue: 0,
    encountersCount: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  const COLORS = ['#00bfa5', '#ffb300', '#f57c00', '#00796b'];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch lists
      const [patientsRes, apptsRes, invoicesRes, encountersRes, doctorsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/appointments'),
        api.get('/invoices'),
        api.get('/encounters'),
        api.get('/auth/doctors'),
      ]);

      const patients = patientsRes.data?.data || [];
      const appointments = apptsRes.data?.data || [];
      const invoices = invoicesRes.data?.data || [];
      const encounters = encountersRes.data?.data || [];
      const doctors = doctorsRes.data?.data || [];

      setPatients(patients);
      setDoctors(doctors);

      // Calculate stats
      const totalRevenue = invoices
        .filter((inv: any) => inv.status === 'paid' || inv.status === 'partially_paid')
        .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);

      setStats({
        patientsCount: patients.length,
        appointmentsCount: appointments.length,
        totalRevenue,
        encountersCount: encounters.length,
      });

      // Filter upcoming appointments
      const sortedAppts = [...appointments]
        .filter((a: any) => a.status === 'pending' || a.status === 'confirmed' || a.status === 'arrived')
        .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
      
      setUpcomingAppointments(sortedAppts.slice(0, 5));

      // Build charts
      // 1. Appointment trends (last 7 days)
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const dailyCounts = last7Days.map((date) => {
        const count = appointments.filter((a: any) => a.scheduled_at.startsWith(date)).length;
        const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        return { name: formattedDate, count };
      });
      setChartData(dailyCounts);

      // 2. Revenue by month
      const monthlyRevenue = Array.from({ length: 4 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleDateString('en-US', { month: 'short' });
        const matchString = d.toISOString().substring(0, 7); // e.g. "2026-05"
        const revenue = invoices
          .filter((inv: any) => inv.created_at.startsWith(matchString) && (inv.status === 'paid' || inv.status === 'partially_paid'))
          .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
        return { name: label, Revenue: revenue };
      }).reverse();
      setRevenueData(monthlyRevenue);

      // 3. Gender demographics
      const male = patients.filter((p: any) => p.gender === 'male').length;
      const female = patients.filter((p: any) => p.gender === 'female').length;
      const other = patients.filter((p: any) => p.gender === 'other').length;
      setGenderData([
        { name: 'Male', value: male || 1 }, // Fallback to 1 for visual representation if 0
        { name: 'Female', value: female || 1 },
        { name: 'Other', value: other || 0 },
      ]);

    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'primary';
      case 'arrived': return 'secondary';
      case 'pending': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPatientName = (pId: string) => {
    const p = patients.find((p) => p.id === pId);
    return p ? `${p.first_name} ${p.last_name}` : pId;
  };

  const getDoctorName = (dId: string) => {
    const d = doctors.find((d) => d.id === dId);
    return d ? `Dr. ${d.first_name} ${d.last_name}` : dId;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
          Good Morning, {user?.first_name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here is what's happening at Nova Health Clinic today.
        </Typography>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(0, 191, 165, 0.12)', color: 'primary.main', width: 56, height: 56 }}>
                <PatientsIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Patients</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.patientsCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255, 179, 0, 0.12)', color: 'secondary.main', width: 56, height: 56 }}>
                <CalendarIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Appointments</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.appointmentsCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(245, 124, 0, 0.12)', color: 'secondary.dark', width: 56, height: 56 }}>
                <RevenueIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Revenue</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>${stats.totalRevenue.toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(0, 121, 107, 0.12)', color: 'primary.dark', width: 56, height: 56 }}>
                <WorkloadIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Clinical Encounters</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.encountersCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Charts Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Patient Appointment Volume (Last 7 Days)
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00bfa5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00bfa5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#00bfa5" fillOpacity={1} fill="url(#colorCount)" name="Appointments" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Patient Gender Split
            </Typography>
            <Box sx={{ width: '100%', height: 220, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 'auto', pb: 1 }}>
              {genderData.map((entry, index) => (
                <Box key={entry.name} sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    <Box component="span" sx={{ display: 'inline-block', width: 10, height: 10, bgcolor: COLORS[index], borderRadius: '50%', mr: 1 }} />
                    {entry.name}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {entry.value === 1 && entry.name !== 'Male' && entry.name !== 'Female' ? 0 : entry.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Row 2: Upcoming Appointments & Revenue */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', minHeight: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Upcoming Scheduled Visits
            </Typography>
            {upcomingAppointments.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No upcoming appointments scheduled.</Typography>
              </Box>
            ) : (
              <List>
                {upcomingAppointments.map((appt, i) => (
                  <React.Fragment key={appt.id}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Patient Name: {getPatientName(appt.patient_id)}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            Doctor: {getDoctorName(appt.doctor_id)} | Reason: {appt.reason}
                          </Typography>
                        }
                      />
                      <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {new Date(appt.scheduled_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                        <Chip
                          label={appt.status.toUpperCase()}
                          size="small"
                          color={getStatusColor(appt.status)}
                          sx={{ fontWeight: 600, height: 20, fontSize: '0.65rem' }}
                        />
                      </Box>
                    </ListItem>
                    {i < upcomingAppointments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', minHeight: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Monthly Revenue Performance
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="Revenue" fill="#ffb300" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
