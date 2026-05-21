import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import ViewIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/AdminPanelSettings';


export const Audit: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtering
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await api.get('/audit');
      setLogs(response.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load audit logs', err);
      setErrorMsg(err.response?.data?.error?.message || 'Access Denied: Only administrators can view security audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadLogs();
    } else {
      setLoading(false);
      setErrorMsg('Forbidden: You must be an administrator to access the security audit ledger.');
    }
  }, [user]);

  const openViewModal = (log: any) => {
    setSelectedLog(log);
    setViewOpen(true);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'primary';
      case 'DELETE': return 'error';
      case 'LOGIN': return 'secondary';
      case 'ASSIGN_ROLE': return 'warning';
      default: return 'default';
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      (log.user_id && log.user_id.toLowerCase().includes(searchLower)) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(searchLower)) ||
      (log.entity_type && log.entity_type.toLowerCase().includes(searchLower)) ||
      (log.source_ip && log.source_ip.toLowerCase().includes(searchLower));

    return matchesAction && matchesEntity && matchesSearch;
  });

  if (user?.role !== 'admin') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <ShieldIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }} color="error" gutterBottom>
          Administrative Access Required
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You do not have permission to view system security audit trails. Please contact your system administrator.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
          Clinic Security Audit Trails
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review absolute records of system interactions, access logins, patient records modifications, and clinic events.
        </Typography>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

      {/* Filter Toolbar */}
      <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="action-filter-label">Filter Action</InputLabel>
              <Select
                labelId="action-filter-label"
                label="Filter Action"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <MenuItem value="all">All Actions</MenuItem>
                <MenuItem value="CREATE">CREATE</MenuItem>
                <MenuItem value="UPDATE">UPDATE</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
                <MenuItem value="LOGIN">LOGIN</MenuItem>
                <MenuItem value="ASSIGN_ROLE">ASSIGN_ROLE</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="entity-filter-label">Filter Entity</InputLabel>
              <Select
                labelId="entity-filter-label"
                label="Filter Entity"
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
              >
                <MenuItem value="all">All Entities</MenuItem>
                <MenuItem value="Patient">Patient</MenuItem>
                <MenuItem value="Appointment">Appointment</MenuItem>
                <MenuItem value="Encounter">Encounter</MenuItem>
                <MenuItem value="Prescription">Prescription</MenuItem>
                <MenuItem value="Invoice">Invoice</MenuItem>
                <MenuItem value="User">User</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              label="Search logs (User ID, Entity ID, IP Address...)"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Logs Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity Type</TableCell>
                <TableCell>Entity ID / Reference</TableCell>
                <TableCell>Actor User ID</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell align="right">Inspector</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No security logs recorded matching the criteria.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        color={getActionColor(log.action)}
                        sx={{ fontWeight: 700, fontSize: '0.65rem', height: 18 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{log.entity_type}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {log.entity_id ? `${log.entity_id.slice(0, 8)}...` : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {log.user_id ? `${log.user_id.slice(0, 8)}...` : 'System'}
                    </TableCell>
                    <TableCell>{log.source_ip || '127.0.0.1'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => openViewModal(log)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* INSPECTOR VIEW MODAL */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        {selectedLog && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Audit Snapshot Inspector</Typography>
                <Typography variant="caption" color="text.secondary">
                  Log ID: {selectedLog.id}
                </Typography>
              </Box>
              <IconButton onClick={() => setViewOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Timestamp: <strong>{new Date(selectedLog.timestamp).toLocaleString()}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Action: <strong>{selectedLog.action}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Entity: <strong>{selectedLog.entity_type}</strong> ({selectedLog.entity_id || 'N/A'})
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Actor: <strong>{selectedLog.user_id || 'System Process'}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Network IP: <strong>{selectedLog.source_ip || 'Local / Loopback'}</strong>
                  </Typography>
                </Grid>
              </Grid>

              {/* Snapshot Display */}
              {selectedLog.snapshot ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }} color="error.main">
                      State Before Action
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        p: 2,
                        bgcolor: 'grey.900',
                        color: 'common.white',
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        overflowX: 'auto',
                        maxHeight: 280,
                      }}
                    >
                      {selectedLog.snapshot.before_data
                        ? JSON.stringify(selectedLog.snapshot.before_data, null, 2)
                        : 'NULL (No pre-existing record)'}
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
                      State After Action
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        p: 2,
                        bgcolor: 'grey.900',
                        color: 'common.white',
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        overflowX: 'auto',
                        maxHeight: 280,
                      }}
                    >
                      {selectedLog.snapshot.after_data
                        ? JSON.stringify(selectedLog.snapshot.after_data, null, 2)
                        : 'NULL (Record Deleted)'}
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Data Snapshot
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.900',
                      color: 'common.white',
                      borderRadius: 1.5,
                      fontSize: '0.75rem',
                      overflowX: 'auto',
                    }}
                  >
                    {selectedLog.changes
                      ? JSON.stringify(selectedLog.changes, null, 2)
                      : 'No state snapshots logged for this action.'}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewOpen(false)}>Close Inspector</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
