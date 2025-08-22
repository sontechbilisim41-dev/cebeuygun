
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Activity } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime: string;
  uptime: string;
  lastCheck: string;
}

const services: ServiceStatus[] = [
  {
    name: 'User Management Service',
    status: 'healthy',
    responseTime: '45ms',
    uptime: '99.9%',
    lastCheck: '2 minutes ago'
  },
  {
    name: 'Product Catalog Service',
    status: 'healthy',
    responseTime: '32ms',
    uptime: '99.8%',
    lastCheck: '1 minute ago'
  },
  {
    name: 'Order Processing Service',
    status: 'warning',
    responseTime: '120ms',
    uptime: '99.5%',
    lastCheck: '3 minutes ago'
  },
  {
    name: 'Vendor Management Service',
    status: 'healthy',
    responseTime: '28ms',
    uptime: '99.9%',
    lastCheck: '1 minute ago'
  },
  {
    name: 'Logistics Service',
    status: 'healthy',
    responseTime: '42ms',
    uptime: '99.6%',
    lastCheck: '2 minutes ago'
  },
  {
    name: 'Food Service',
    status: 'healthy',
    responseTime: '35ms',
    uptime: '99.7%',
    lastCheck: '1 minute ago'
  },
  {
    name: 'Quick Market Service',
    status: 'healthy',
    responseTime: '38ms',
    uptime: '99.8%',
    lastCheck: '2 minutes ago'
  }
];

export function ServiceHealthStatus() {
  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-500" />
          Microservices Health Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {service.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last check: {service.lastCheck}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {service.responseTime}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Response Time
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {service.uptime}
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
      </CardContent>
    </Card>
  );
}
