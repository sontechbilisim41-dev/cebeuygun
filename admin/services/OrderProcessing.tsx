
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
  ShoppingCart, 
  Search, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  CreditCard
} from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  order_type: 'marketplace' | 'food' | 'market';
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  create_time: string;
  estimated_delivery?: string;
}

export function OrderProcessing() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockOrders: Order[] = [
        {
          id: 1,
          order_number: 'ORD-2024-001',
          customer_name: 'John Doe',
          order_type: 'marketplace',
          status: 'confirmed',
          payment_status: 'paid',
          total_amount: 1299.99,
          create_time: '2024-01-15T10:30:00Z',
          estimated_delivery: '2024-01-17T15:00:00Z'
        },
        {
          id: 2,
          order_number: 'ORD-2024-002',
          customer_name: 'Jane Smith',
          order_type: 'food',
          status: 'preparing',
          payment_status: 'paid',
          total_amount: 89.50,
          create_time: '2024-01-15T11:15:00Z',
          estimated_delivery: '2024-01-15T12:00:00Z'
        },
        {
          id: 3,
          order_number: 'ORD-2024-003',
          customer_name: 'Mike Johnson',
          order_type: 'market',
          status: 'shipped',
          payment_status: 'paid',
          total_amount: 156.75,
          create_time: '2024-01-15T09:45:00Z',
          estimated_delivery: '2024-01-15T10:30:00Z'
        },
        {
          id: 4,
          order_number: 'ORD-2024-004',
          customer_name: 'Sarah Wilson',
          order_type: 'marketplace',
          status: 'pending',
          payment_status: 'pending',
          total_amount: 2499.99,
          create_time: '2024-01-15T12:00:00Z'
        }
      ];
      
      setTimeout(() => {
        setOrders(mockOrders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
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

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
      confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: CheckCircle },
      preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: Package },
      shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Truck },
      delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: Order['payment_status']) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      paid: { label: 'Paid', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
    };

    const config = statusConfig[status];

    return (
      <Badge className={config.color}>
        <CreditCard className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getOrderTypeBadge = (type: Order['order_type']) => {
    const typeConfig = {
      marketplace: { label: 'Marketplace', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
      food: { label: 'Food Delivery', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      market: { label: 'Quick Market', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
    };

    const config = typeConfig[type];

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Order Processing Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage orders across all service modules
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  45
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Processing
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  128
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
                  Completed Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  342
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₺125K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Management */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders by number or customer name..."
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
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.order_number}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(order.create_time)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {order.customer_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getOrderTypeBadge(order.order_type)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatPrice(order.total_amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(order.payment_status)}
                    </TableCell>
                    <TableCell>
                      {order.estimated_delivery ? (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(order.estimated_delivery)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
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
