
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Cpu,
  HardDrive,
  MemoryStick
} from 'lucide-react';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  endpoint: string;
  version: string;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export function SystemMonitoring() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Mock services data
      const mockServices: ServiceHealth[] = [
        {
          name: 'User Management Service',
          status: 'healthy',
          responseTime: 45,
          uptime: 99.9,
          lastCheck: '2024-01-15T12:00:00Z',
          endpoint: '/api/users/health',
          version: 'v1.2.3'
        },
        {
          name: 'Product Catalog Service',
          status: 'healthy',
          responseTime: 32,
          uptime: 99.8,
          lastCheck: '2024-01-15T12:00:00Z',
          endpoint: '/api/products/health',
          version: 'v2.1.0'
        },
        {
          name: 'Order Processing Service',
          status: 'warning',
          responseTime: 120,
          uptime: 99.5,
          lastCheck: '2024-01-15T12:00:00Z',
          endpoint: '/api/orders/health',
          version: 'v1.8.2'
        },
        {
          name: 'Vendor Management Service',
          status: 'healthy',
          responseTime: 28,
          uptime: 99.9,
          lastCheck: '2024-01-15T12:00:00Z',
          endpoint: '/api/vendors/health',
          version: 'v1.5.1'
        },
        {
          name: 'Logistics Service',
          status: 'healthy',
          responseTime: 42,
          uptime: 99.6,
          lastCheck: '2024-01-15T12:00:00Z',
          endpoint: '/api/logistics/health',
          version: 'v2.0.1'
        },
        {
          name: 'Food Service',
          status: 'healthy',
          responseTime: 35,
          uptime: 99.7,
          lastCheck: '2024-01-15T12:00:00Z',
          endpoint: '/api/food/health',
          version: 'v1.9.0'
        },
        {
          name: 'Quick Market Service',
          status: 'healthy',
          responseTime: 38,
          uptime: 99.8,
          lastCheck: '2024-01-15T12:00:00Z',
          endpoint: '/api/market/health',
          version: 'v1.4.2'
        },
        {
          name: 'Kafka Message Broker',
          status: 'error',
          responseTime: 0,
          uptime: 98.2,
          lastCheck: '2024-01-15T11:55:00Z',
          endpoint: '/kafka/health',
          version: 'v3.4.0'
        }
      ];

      setTimeout(() => {
        setServices(mockServices);
        setMetrics({
          cpu: Math.floor(Math.random() * 30) + 45,
          memory: Math.floor(Math.random() * 20) + 60,
          disk: Math.floor(Math.random() * 15) + 35,
          network: Math.floor(Math.random() * 40) + 20
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const updateMetrics = () => {
    setMetrics({
      cpu: Math.floor(Math.random() * 30) + 45,
      memory: Math.floor(Math.random() * 20) + 60,
      disk: Math.floor(Math.random() * 15) + 35,
      network: Math.floor(Math.random() * 40) + 20
    });
  };

  const getStatusIcon = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Healthy
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Warning
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            Error
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMetricColor = (value: number, type: 'cpu' | 'memory' | 'disk' | 'network') => {
    const thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      disk: { warning: 80, critical: 95 },
      network: { warning: 70, critical: 90 }
    };

    const threshold = thresholds[type];
    
    if (value >= threshold.critical) {
      return 'bg-red-500';
    } else if (value >= threshold.warning) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  };

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const warningServices = services.filter(s => s.status === 'warning').length;
  const errorServices = services.filter(s => s.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time microservices health monitoring and system metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live Monitoring
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Healthy Services
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {healthyServices}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Warning Services
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {warningServices}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Error Services
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {errorServices}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  42ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-500" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <span className="text-sm font-bold">{metrics.cpu}%</span>
              </div>
              <Progress 
                value={metrics.cpu} 
                className="h-2"
                style={{
                  '--progress-background': getMetricColor(metrics.cpu, 'cpu')
                } as React.CSSProperties}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Memory Usage</span>
                </div>
                <span className="text-sm font-bold">{metrics.memory}%</span>
              </div>
              <Progress 
                value={metrics.memory} 
                className="h-2"
                style={{
                  '--progress-background': getMetricColor(metrics.memory, 'memory')
                } as React.CSSProperties}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Disk Usage</span>
                </div>
                <span className="text-sm font-bold">{metrics.disk}%</span>
              </div>
              <Progress 
                value={metrics.disk} 
                className="h-2"
                style={{
                  '--progress-background': getMetricColor(metrics.disk, 'disk')
                } as React.CSSProperties}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Network I/O</span>
                </div>
                <span className="text-sm font-bold">{metrics.network}%</span>
              </div>
              <Progress 
                value={metrics.network} 
                className="h-2"
                style={{
                  '--progress-background': getMetricColor(metrics.network, 'network')
                } as React.CSSProperties}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-500" />
            Microservices Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(service.status)}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>Endpoint: {service.endpoint}</span>
                        <span>Version: {service.version}</span>
                        <span>Last check: {formatDate(service.lastCheck)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Response Time
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {service.uptime.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Uptime
                      </p>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-500" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  PostgreSQL Primary
                </h4>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Connections:</span>
                  <span className="font-medium">45/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className="font-medium">12ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-medium">99.9%</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Redis Cache
                </h4>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span className="font-medium">2.1GB/8GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Hit Rate:</span>
                  <span className="font-medium">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-medium">99.8%</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  MongoDB
                </h4>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Collections:</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Size:</span>
                  <span className="font-medium">156GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-medium">99.7%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
