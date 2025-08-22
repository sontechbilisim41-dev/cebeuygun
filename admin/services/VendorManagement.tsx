
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Store, 
  Search, 
  Plus, 
  Edit, 
  Eye,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Vendor {
  id: number;
  company_name: string;
  company_slug: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  is_active: boolean;
  rating: number;
  total_sales: number;
  commission_rate: number;
  create_time: string;
}

export function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockVendors: Vendor[] = [
        {
          id: 1,
          company_name: 'TechStore Electronics',
          company_slug: 'techstore-electronics',
          email: 'info@techstore.com',
          phone: '+90 212 555 0001',
          status: 'approved',
          is_active: true,
          rating: 4.8,
          total_sales: 1250000,
          commission_rate: 12.5,
          create_time: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          company_name: 'Fashion World',
          company_slug: 'fashion-world',
          email: 'contact@fashionworld.com',
          phone: '+90 212 555 0002',
          status: 'approved',
          is_active: true,
          rating: 4.6,
          total_sales: 890000,
          commission_rate: 15.0,
          create_time: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          company_name: 'Home & Garden Plus',
          company_slug: 'home-garden-plus',
          email: 'sales@homegardenplus.com',
          phone: '+90 212 555 0003',
          status: 'pending',
          is_active: false,
          rating: 0,
          total_sales: 0,
          commission_rate: 15.0,
          create_time: '2024-01-15T00:00:00Z'
        },
        {
          id: 4,
          company_name: 'Sports Equipment Co.',
          company_slug: 'sports-equipment-co',
          email: 'info@sportsequipment.com',
          phone: '+90 212 555 0004',
          status: 'suspended',
          is_active: false,
          rating: 3.2,
          total_sales: 156000,
          commission_rate: 18.0,
          create_time: '2024-01-05T00:00:00Z'
        }
      ];
      
      setTimeout(() => {
        setVendors(mockVendors);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getStatusBadge = (status: Vendor['status']) => {
    const statusConfig = {
      pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      suspended: { label: 'Suspended', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: null },
      rejected: { label: 'Rejected', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: null }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  const renderRating = (rating: number) => {
    if (rating === 0) {
      return <span className="text-gray-400">No ratings</span>;
    }

    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vendor Management Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage seller partners and marketplace vendors
          </p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-red-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add New Vendor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Vendors
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  340
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
                  Active Vendors
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  298
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  15
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Commission
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₺185K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Management */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Database</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search vendors by company name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              Filter
            </Button>
            <Button variant="outline">
              Export
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {vendor.company_name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          @{vendor.company_slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {vendor.email}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {vendor.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(vendor.status)}
                        <Badge 
                          variant={vendor.is_active ? 'default' : 'secondary'}
                          className={vendor.is_active ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                        >
                          {vendor.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderRating(vendor.rating)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatPrice(vendor.total_sales)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {vendor.commission_rate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
