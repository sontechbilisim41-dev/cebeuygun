
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Database, 
  Search, 
  Play, 
  Download,
  Upload,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DatabaseTable {
  name: string;
  rows: number;
  size: string;
  lastUpdated: string;
  status: 'healthy' | 'warning' | 'error';
}

interface Migration {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  executedAt?: string;
  duration?: string;
}

const mockTables: DatabaseTable[] = [
  { name: 'users', rows: 15420, size: '2.3 MB', lastUpdated: '2024-01-15T12:00:00Z', status: 'healthy' },
  { name: 'products', rows: 8750, size: '5.1 MB', lastUpdated: '2024-01-15T11:45:00Z', status: 'healthy' },
  { name: 'orders', rows: 3240, size: '1.8 MB', lastUpdated: '2024-01-15T12:05:00Z', status: 'healthy' },
  { name: 'vendors', rows: 340, size: '456 KB', lastUpdated: '2024-01-15T10:30:00Z', status: 'healthy' },
  { name: 'restaurants', rows: 156, size: '234 KB', lastUpdated: '2024-01-15T09:15:00Z', status: 'healthy' },
  { name: 'couriers', rows: 125, size: '89 KB', lastUpdated: '2024-01-15T11:20:00Z', status: 'healthy' },
  { name: 'deliveries', rows: 2890, size: '1.2 MB', lastUpdated: '2024-01-15T12:10:00Z', status: 'warning' },
  { name: 'payments', rows: 3156, size: '987 KB', lastUpdated: '2024-01-15T11:55:00Z', status: 'healthy' },
  { name: 'notifications', rows: 12450, size: '3.4 MB', lastUpdated: '2024-01-15T12:08:00Z', status: 'healthy' },
  { name: 'analytics_events', rows: 45670, size: '8.9 MB', lastUpdated: '2024-01-15T12:12:00Z', status: 'healthy' }
];

const mockMigrations: Migration[] = [
  {
    id: '20240115_001',
    name: 'Add delivery tracking fields',
    status: 'completed',
    createdAt: '2024-01-15T10:00:00Z',
    executedAt: '2024-01-15T10:05:00Z',
    duration: '5.2s'
  },
  {
    id: '20240114_003',
    name: 'Create analytics_events table',
    status: 'completed',
    createdAt: '2024-01-14T15:30:00Z',
    executedAt: '2024-01-14T15:32:00Z',
    duration: '12.8s'
  },
  {
    id: '20240114_002',
    name: 'Add vendor commission rates',
    status: 'completed',
    createdAt: '2024-01-14T14:20:00Z',
    executedAt: '2024-01-14T14:21:00Z',
    duration: '3.1s'
  },
  {
    id: '20240114_001',
    name: 'Update user roles structure',
    status: 'failed',
    createdAt: '2024-01-14T12:00:00Z',
    executedAt: '2024-01-14T12:02:00Z',
    duration: '2.5s'
  }
];

export function DatabaseManagement() {
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'migrations' | 'backup'>('tables');
  const [searchTerm, setSearchTerm] = useState('');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);

  const filteredTables = mockTables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const executeQuery = async () => {
    setIsExecuting(true);
    // Simulate query execution
    setTimeout(() => {
      setQueryResult(`Query executed successfully!\n\nRows affected: 10\nExecution time: 0.045s\n\nSample result:\nid | email | first_name | last_name\n1  | john@example.com | John | Doe\n2  | jane@example.com | Jane | Smith\n...`);
      setIsExecuting(false);
    }, 2000);
  };

  const getStatusIcon = (status: DatabaseTable['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: DatabaseTable['status']) => {
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

  const getMigrationStatusBadge = (status: Migration['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'running':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Database Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage database schema, execute queries, and monitor data integrity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Database className="w-3 h-3 mr-1" />
            PostgreSQL Connected
          </Badge>
        </div>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Tables
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockTables.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Records
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockTables.reduce((sum, table) => sum + table.rows, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Database Size
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  24.8 MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Last Backup
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  2h ago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {[
          { id: 'tables', label: 'Tables' },
          { id: 'query', label: 'Query Editor' },
          { id: 'migrations', label: 'Migrations' },
          { id: 'backup', label: 'Backup & Restore' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'tables' && (
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTables.map((table) => (
                  <TableRow key={table.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(table.status)}
                        <span className="font-medium">{table.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {table.rows.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {table.size}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(table.lastUpdated)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(table.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'query' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>SQL Query Editor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your SQL query here..."
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="flex items-center gap-2">
                <Button 
                  onClick={executeQuery}
                  disabled={isExecuting}
                  className="bg-gradient-to-r from-cyan-500 to-red-500 text-white"
                >
                  {isExecuting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isExecuting ? 'Executing...' : 'Execute Query'}
                </Button>
                <Button variant="outline">
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Query Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg min-h-[200px]">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {queryResult || 'Execute a query to see results here...'}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'migrations' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Database Migrations</CardTitle>
              <Button className="bg-gradient-to-r from-cyan-500 to-red-500 text-white">
                <Upload className="w-4 h-4 mr-2" />
                New Migration
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Migration ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Executed</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMigrations.map((migration) => (
                  <TableRow key={migration.id}>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {migration.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {migration.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getMigrationStatusBadge(migration.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(migration.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {migration.executedAt ? formatDate(migration.executedAt) : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {migration.duration || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        {migration.status === 'failed' && (
                          <Button size="sm" variant="outline">
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Backup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Backup Name
                </label>
                <Input 
                  placeholder="backup_2024_01_15"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tables to Include
                </label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {mockTables.map((table) => (
                    <label key={table.name} className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">{table.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-red-500 text-white">
                <Download className="w-4 h-4 mr-2" />
                Create Backup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Restore Database</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Backup File
                </label>
                <Input 
                  type="file"
                  accept=".sql,.dump"
                  className="mt-1"
                />
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Warning
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Restoring a backup will overwrite all existing data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="destructive" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Restore Database
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
