
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, MoreHorizontal, Truck, Package, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { queries } from '@/lib/database/queries';

export function OrderManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, selectedStatus]);

  const loadOrders = () => {
    const ordersData = queries.orders.getRecent(100);
    setOrders(ordersData);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Arama filtresi
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Durum filtresi
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Tarihe göre sırala (en yeni önce)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Bekliyor', variant: 'secondary' as const, color: 'bg-yellow-500' },
      'confirmed': { label: 'Onaylandı', variant: 'default' as const, color: 'bg-blue-500' },
      'preparing': { label: 'Hazırlanıyor', variant: 'default' as const, color: 'bg-orange-500' },
      'ready': { label: 'Hazır', variant: 'default' as const, color: 'bg-purple-500' },
      'picked_up': { label: 'Alındı', variant: 'default' as const, color: 'bg-indigo-500' },
      'in_transit': { label: 'Yolda', variant: 'default' as const, color: 'bg-cyan-500' },
      'delivered': { label: 'Teslim Edildi', variant: 'default' as const, color: 'bg-green-500' },
      'cancelled': { label: 'İptal Edildi', variant: 'destructive' as const, color: 'bg-red-500' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      color: 'bg-gray-500' 
    };
    
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Bekliyor', color: 'bg-yellow-500' },
      'paid': { label: 'Ödendi', color: 'bg-green-500' },
      'failed': { label: 'Başarısız', color: 'bg-red-500' },
      'refunded': { label: 'İade Edildi', color: 'bg-gray-500' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      color: 'bg-gray-500' 
    };
    
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'marketplace':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'food':
        return <span className="text-red-600">🍽️</span>;
      case 'market':
        return <span className="text-green-600">🛒</span>;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    inTransit: orders.filter(o => o.status === 'in_transit').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h2>
          <p className="text-gray-600">Platform siparişlerini yönetin</p>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Toplam</p>
              <p className="text-2xl font-bold">{orderStats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Onaylanan</p>
              <p className="text-2xl font-bold text-blue-600">{orderStats.confirmed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Yolda</p>
              <p className="text-2xl font-bold text-purple-600">{orderStats.inTransit}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Teslim Edilen</p>
              <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Sipariş numarası, müşteri adı veya e-posta ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="confirmed">Onaylanan</SelectItem>
                <SelectItem value="preparing">Hazırlanan</SelectItem>
                <SelectItem value="ready">Hazır</SelectItem>
                <SelectItem value="picked_up">Alınan</SelectItem>
                <SelectItem value="in_transit">Yolda</SelectItem>
                <SelectItem value="delivered">Teslim Edilen</SelectItem>
                <SelectItem value="cancelled">İptal Edilen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Siparişler ({filteredOrders.length})</span>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Gelişmiş Filtre
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sipariş</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Ödeme</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getOrderTypeIcon(order.order_type)}
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-gray-500">{order.items?.length || 0} ürün</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer?.name || 'Bilinmiyor'}</p>
                        <p className="text-sm text-gray-500">{order.customer?.email || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.order_type === 'marketplace' ? 'E-ticaret' : 
                         order.order_type === 'food' ? 'Yemek' : 
                         order.order_type === 'market' ? 'Market' : order.order_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">₺{order.total_amount}</p>
                        <p className="text-sm text-gray-500">
                          {order.delivery_type === 'express' ? 'Hızlı' : 'Standart'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(order.payment_status)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString('tr-TR')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Detayları Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Truck className="h-4 w-4 mr-2" />
                            Teslimat Takibi
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Clock className="h-4 w-4 mr-2" />
                            Durum Güncelle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Sipariş bulunamadı</p>
              <p className="text-sm text-gray-400 mt-1">
                Arama kriterlerinizi değiştirmeyi deneyin
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
