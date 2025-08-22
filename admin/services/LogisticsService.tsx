
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
  Truck, 
  Search, 
  Plus, 
  Edit, 
  Eye,
  MapPin,
  Clock,
  CheckCircle,
  Navigation,
  Star
} from 'lucide-react';

interface Courier {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  vehicle_type: string;
  license_plate?: string;
  is_active: boolean;
  is_available: boolean;
  rating: number;
  total_deliveries: number;
  current_location?: {
    lat: number;
    lng: number;
    address: string;
  };
  create_time: string;
}

interface Delivery {
  id: number;
  order_id: number;
  courier_id?: number;
  courier_name?: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  pickup_address: string;
  delivery_address: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  distance_km?: number;
  delivery_fee: number;
}

export function LogisticsService() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'couriers' | 'deliveries'>('couriers');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock couriers data
      const mockCouriers: Courier[] = [
        {
          id: 1,
          first_name: 'Mehmet',
          last_name: 'Yılmaz',
          phone: '+90 555 123 4567',
          email: 'mehmet.yilmaz@courier.com',
          vehicle_type: 'motorcycle',
          license_plate: '34 ABC 123',
          is_active: true,
          is_available: true,
          rating: 4.8,
          total_deliveries: 1250,
          current_location: {
            lat: 41.0082,
            lng: 28.9784,
            address: 'Kadıköy, İstanbul'
          },
          create_time: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          first_name: 'Ayşe',
          last_name: 'Demir',
          phone: '+90 555 987 6543',
          email: 'ayse.demir@courier.com',
          vehicle_type: 'bicycle',
          is_active: true,
          is_available: false,
          rating: 4.9,
          total_deliveries: 890,
          current_location: {
            lat: 41.0369,
            lng: 28.9850,
            address: 'Beşiktaş, İstanbul'
          },
          create_time: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          first_name: 'Ali',
          last_name: 'Kaya',
          phone: '+90 555 456 7890',
          email: 'ali.kaya@courier.com',
          vehicle_type: 'car',
          license_plate: '34 XYZ 789',
          is_active: false,
          is_available: false,
          rating: 4.2,
          total_deliveries: 456,
          create_time: '2024-01-03T00:00:00Z'
        }
      ];

      // Mock deliveries data
      const mockDeliveries: Delivery[] = [
        {
          id: 1,
          order_id: 1001,
          courier_id: 1,
          courier_name: 'Mehmet Yılmaz',
          status: 'in_transit',
          pickup_address: 'TechStore, Levent, İstanbul',
          delivery_address: 'Kadıköy Mah. No:15, İstanbul',
          estimated_delivery_time: '2024-01-15T15:30:00Z',
          distance_km: 12.5,
          delivery_fee: 15.00
        },
        {
          id: 2,
          order_id: 1002,
          courier_id: 2,
          courier_name: 'Ayşe Demir',
          status: 'picked_up',
          pickup_address: 'Pizza Palace, Taksim, İstanbul',
          delivery_address: 'Beşiktaş Mah. No:42, İstanbul',
          estimated_delivery_time: '2024-01-15T12:45:00Z',
          distance_km: 3.2,
          delivery_fee: 8.50
        },
        {
          id: 3,
          order_id: 1003,
          status: 'assigned',
          pickup_address: 'Fresh Market, Şişli, İstanbul',
          delivery_address: 'Mecidiyeköy Mah. No:78, İstanbul',
          estimated_delivery_time: '2024-01-15T13:15:00Z',
          distance_km: 5.8,
          delivery_fee: 12.00
        }
      ];
      
      setTimeout(() => {
        setCouriers(mockCouriers);
        setDeliveries(mockDeliveries);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const filteredCouriers = couriers.filter(courier =>
    `${courier.first_name} ${courier.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courier.phone.includes(searchTerm)
  );

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.order_id.toString().includes(searchTerm) ||
    delivery.courier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.delivery_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDeliveryStatusBadge = (status: Delivery['status']) => {
    const statusConfig = {
      assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Clock },
      picked_up: { label: 'Picked Up', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Navigation },
      in_transit: { label: 'In Transit', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Truck },
      delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: null }
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

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'motorcycle':
        return '🏍️';
      case 'bicycle':
        return '🚲';
      case 'car':
        return '🚗';
      default:
        return '🚚';
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
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
            Logistics Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage couriers, deliveries, and real-time tracking
          </p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-red-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add New Courier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Couriers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  125
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
                  Available Now
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  87
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Deliveries
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  42
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
                  Avg. Delivery Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  28min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('couriers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'couriers'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Couriers
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'deliveries'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Deliveries
        </button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'couriers' ? 'Courier Management' : 'Delivery Tracking'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={
                  activeTab === 'couriers' 
                    ? "Search couriers by name, email, or phone..." 
                    : "Search deliveries by order ID, courier, or address..."
                }
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
          ) : activeTab === 'couriers' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Courier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Deliveries</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCouriers.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {courier.first_name} {courier.last_name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {courier.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {courier.email}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {courier.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getVehicleIcon(courier.vehicle_type)}</span>
                        <div>
                          <div className="text-sm font-medium capitalize">
                            {courier.vehicle_type}
                          </div>
                          {courier.license_plate && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {courier.license_plate}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          variant={courier.is_active ? 'default' : 'secondary'}
                          className={courier.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                        >
                          {courier.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {courier.is_active && (
                          <Badge 
                            variant={courier.is_available ? 'default' : 'secondary'}
                            className={courier.is_available ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}
                          >
                            {courier.is_available ? 'Available' : 'Busy'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderRating(courier.rating)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {courier.total_deliveries.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {courier.current_location ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {courier.current_location.address}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unknown</span>
                      )}
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <span className="font-medium">
                        #{delivery.order_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      {delivery.courier_name ? (
                        <span className="text-sm">
                          {delivery.courier_name}
                        </span>
                      ) : (
                        <Badge variant="outline">
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {getDeliveryStatusBadge(delivery.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {delivery.pickup_address}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {delivery.delivery_address}
                      </span>
                    </TableCell>
                    <TableCell>
                      {delivery.distance_km ? (
                        <span className="text-sm">
                          {delivery.distance_km} km
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatPrice(delivery.delivery_fee)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {delivery.estimated_delivery_time ? (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(delivery.estimated_delivery_time)}
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
