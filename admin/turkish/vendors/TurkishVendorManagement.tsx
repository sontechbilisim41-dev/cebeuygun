
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
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { toast } from 'sonner';

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
  warning_count: number;
  create_time: string;
}

export function TurkishVendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'suspended' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await api.get<Vendor[]>('/vendors');
      setVendors(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Satıcılar yüklenemedi: ${error.message}`);
      } else {
        toast.error('Beklenmeyen bir hata oluştu');
      }
      // Hata durumunda mock data kullan
      const mockVendors: Vendor[] = [
        {
          id: 1,
          company_name: 'TechStore Elektronik',
          company_slug: 'techstore-elektronik',
          email: 'info@techstore.com',
          phone: '+90 212 555 0001',
          status: 'approved',
          is_active: true,
          rating: 4.8,
          total_sales: 1250000,
          commission_rate: 12.5,
          warning_count: 0,
          create_time: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          company_name: 'Moda Dünyası',
          company_slug: 'moda-dunyasi',
          email: 'iletisim@modadunyasi.com',
          phone: '+90 212 555 0002',
          status: 'pending',
          is_active: false,
          rating: 0,
          total_sales: 0,
          commission_rate: 15.0,
          warning_count: 0,
          create_time: '2024-01-15T12:00:00Z'
        }
      ];
      setVendors(mockVendors);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateVendorStatus = async (id: number, status: 'approved' | 'rejected' | 'suspended') => {
    try {
      setActionLoading(id);
      
      await api.put(`/vendors?id=${id}`, {
        status,
        is_active: status === 'approved',
        modify_time: new Date().toISOString()
      });

      // Local state'i güncelle
      setVendors(vendors.map(vendor => 
        vendor.id === id 
          ? { ...vendor, status, is_active: status === 'approved' }
          : vendor
      ));

      const statusText = {
        approved: 'onaylandı',
        rejected: 'reddedildi',
        suspended: 'askıya alındı'
      };

      toast.success(`Satıcı ${statusText[status]}`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`İşlem başarısız: ${error.message}`);
      } else {
        toast.error('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const approveVendor = (id: number) => updateVendorStatus(id, 'approved');
  const rejectVendor = (id: number) => updateVendorStatus(id, 'rejected');
  const suspendVendor = (id: number) => updateVendorStatus(id, 'suspended');

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
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: Vendor['status']) => {
    const statusConfig = {
      pending: { 
        label: 'Onay Bekliyor', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', 
        icon: Clock 
      },
      approved: { 
        label: 'Onaylandı', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 
        icon: CheckCircle 
      },
      suspended: { 
        label: 'Askıya Alındı', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', 
        icon: XCircle 
      },
      rejected: { 
        label: 'Reddedildi', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', 
        icon: XCircle 
      }
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

  const renderRating = (rating: number) => {
    if (rating === 0) {
      return <span className="text-gray-400">Değerlendirme yok</span>;
    }

    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const pendingCount = vendors.filter(v => v.status === 'pending').length;
  const approvedCount = vendors.filter(v => v.status === 'approved').length;
  const suspendedCount = vendors.filter(v => v.status === 'suspended').length;
  const totalCommission = vendors.reduce((sum, v) => sum + (v.total_sales * v.commission_rate / 100), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Satıcı Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Satıcı onay süreci ve performans yönetimi
          </p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-red-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Satıcı
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
                  Toplam Satıcı
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vendors.length}
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
                  Onay Bekleyen
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingCount}
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
                  Aktif Satıcı
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {approvedCount}
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
                  Toplam Komisyon
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(totalCommission)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Management */}
      <Card>
        <CardHeader>
          <CardTitle>Satıcı Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Şirket adı veya e-posta ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Onay Bekleyen</option>
              <option value="approved">Onaylanan</option>
              <option value="suspended">Askıya Alınan</option>
              <option value="rejected">Reddedilen</option>
            </select>
            <Button variant="outline" onClick={fetchVendors} disabled={loading}>
              {loading ? 'Yükleniyor...' : 'Yenile'}
            </Button>
            <Button variant="outline">
              Dışa Aktar
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
                  <TableHead>Şirket</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Değerlendirme</TableHead>
                  <TableHead>Toplam Satış</TableHead>
                  <TableHead>Komisyon</TableHead>
                  <TableHead>Uyarı</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
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
                          {vendor.is_active ? 'Aktif' : 'Pasif'}
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
                        %{vendor.commission_rate}
                      </span>
                    </TableCell>
                    <TableCell>
                      {vendor.warning_count > 0 ? (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {vendor.warning_count} Uyarı
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Temiz
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(vendor.create_time)}
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
                        {vendor.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => approveVendor(vendor.id)}
                              disabled={actionLoading === vendor.id}
                              className="text-green-600 hover:text-green-700"
                            >
                              {actionLoading === vendor.id ? (
                                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => rejectVendor(vendor.id)}
                              disabled={actionLoading === vendor.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              {actionLoading === vendor.id ? (
                                <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                            </Button>
                          </>
                        )}
                        {vendor.status === 'approved' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => suspendVendor(vendor.id)}
                            disabled={actionLoading === vendor.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            {actionLoading === vendor.id ? (
                              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                          </Button>
                        )}
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
