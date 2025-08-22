import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Assignment as TicketIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface SupportMetrics {
  activeSessions: number;
  queuedSessions: number;
  onlineAgents: number;
  averageWaitTime: number;
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  averageResponseTime: number;
}

interface TicketSummary {
  id: string;
  subject: string;
  status: string;
  priority: string;
  customerId: string;
  customerName: string;
  createdAt: string;
  assignedTo?: string;
}

interface ChatSessionSummary {
  id: string;
  customerId: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  status: string;
  startedAt: string;
  messageCount: number;
}

export const SupportDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SupportMetrics | null>(null);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSessionSummary[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load metrics
      const metricsResponse = await fetch('/api/chat/metrics');
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData.data);

      // Load tickets
      const ticketsResponse = await fetch('/api/tickets');
      const ticketsData = await ticketsResponse.json();
      setTickets(ticketsData.data || []);

      // Load chat sessions
      const sessionsResponse = await fetch('/api/chat/sessions');
      const sessionsData = await sessionsResponse.json();
      setChatSessions(sessionsData.data || []);
    } catch (error) {
      console.error('Load dashboard data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'primary';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      case 'escalated': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const duration = Math.floor((now - start) / 1000 / 60); // minutes
    
    if (duration < 60) return `${duration}m`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700">
          Müşteri Desteği
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadDashboardData}
          disabled={isLoading}
        >
          Yenile
        </Button>
      </Box>

      {/* Metrics Cards */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ChatIcon color="primary" />
                  <Box>
                    <Typography variant="h4" fontWeight="700">
                      {metrics.activeSessions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Aktif Sohbet
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TicketIcon color="info" />
                  <Box>
                    <Typography variant="h4" fontWeight="700">
                      {metrics.openTickets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Açık Ticket
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUpIcon color="success" />
                  <Box>
                    <Typography variant="h4" fontWeight="700">
                      {metrics.resolvedToday}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bugün Çözülen
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PhoneIcon color="warning" />
                  <Box>
                    <Typography variant="h4" fontWeight="700">
                      {Math.round(metrics.averageResponseTime / 60)}m
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ort. Yanıt Süresi
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Card>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Aktif Sohbetler" />
          <Tab label="Ticket Listesi" />
          <Tab label="Performans" />
        </Tabs>

        {/* Active Chats Tab */}
        {selectedTab === 0 && (
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Müşteri</TableCell>
                    <TableCell>Temsilci</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Süre</TableCell>
                    <TableCell>Mesaj Sayısı</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chatSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.customerName}</TableCell>
                      <TableCell>{session.agentName || 'Atanmamış'}</TableCell>
                      <TableCell>
                        <Chip
                          label={session.status}
                          color={getStatusColor(session.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDuration(session.startedAt)}</TableCell>
                      <TableCell>{session.messageCount}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          Görüntüle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Tickets Tab */}
        {selectedTab === 1 && (
          <CardContent>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Ticket ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Durum"
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="open">Açık</MenuItem>
                  <MenuItem value="in_progress">İşlemde</MenuItem>
                  <MenuItem value="resolved">Çözüldü</MenuItem>
                  <MenuItem value="closed">Kapalı</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Öncelik</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="Öncelik"
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="critical">Kritik</MenuItem>
                  <MenuItem value="urgent">Acil</MenuItem>
                  <MenuItem value="high">Yüksek</MenuItem>
                  <MenuItem value="medium">Orta</MenuItem>
                  <MenuItem value="low">Düşük</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Konu</TableCell>
                    <TableCell>Müşteri</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Öncelik</TableCell>
                    <TableCell>Atanan</TableCell>
                    <TableCell>Oluşturulma</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>#{ticket.id.slice(-6)}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>{ticket.customerName}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status}
                          color={getStatusColor(ticket.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.priority}
                          color={getPriorityColor(ticket.priority) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{ticket.assignedTo || 'Atanmamış'}</TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          Görüntüle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Performance Tab */}
        {selectedTab === 2 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performans Metrikleri
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Yanıt Süreleri
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {metrics ? Math.round(metrics.averageResponseTime / 60) : 0}m
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ortalama ilk yanıt süresi
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Çözüm Oranı
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {metrics ? Math.round((metrics.resolvedToday / metrics.totalTickets) * 100) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bugünkü çözüm oranı
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Temsilci Kullanımı
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {metrics ? Math.round((metrics.activeSessions / metrics.onlineAgents) * 100) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ortalama temsilci yükü
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Bekleme Süresi
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {metrics ? Math.round(metrics.averageWaitTime / 60) : 0}m
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ortalama müşteri bekleme süresi
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Box>
  );
};