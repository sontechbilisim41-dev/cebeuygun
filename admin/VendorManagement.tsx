
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, MoreHorizontal, CheckCircle, XCircle, AlertTriangle, Store, FileText, Calendar, TrendingUp, TrendingDown, Pause, Play, Ban } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { mockDB } from '@/lib/database/mockDatabase';

interface VendorApplication {
  id: string;
  businessName: string;
  businessType: 'marketplace' | 'restaurant' | 'market';
  contactName: string;
  email: string;
  phone: string;
  taxNumber: string;
  tradeRegistryNumber?: string;
  address: string;
  city: string;
  category: string;
  documents: Document[];
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

interface VendorPerformance {
  totalSales: number;
  totalOrders: number;
  averageRating: number;
  ratingCount: number;
  cancellationRate: number;
  returnRate: number;
  responseTime: number;
  lastActive: string;
}

export function VendorManagement() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingApplications, setPendingApplications] = useState<VendorApplication[]>([]);
  const [activeVendors, setActiveVendors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isVendorDetailsOpen, setIsVendorDetailsOpen] = useState(false);

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = () => {
    // Load pending applications (mock data)
    const mockApplications: VendorApplication[] = [
      {
        id: 'app_1',
        businessName: 'Lezzet Durağı Restaurant',
        businessType: 'restaurant',
        contactName: 'Ahmet Yılmaz',
        email: 'ahmet@lezzetduragi.com',
        phone: '+905551234567',
        taxNumber: '1234567890',
        tradeRegistryNumber: 'TR123456',
        address: 'Atatürk Caddesi No:123',
        city: 'İstanbul',
        category: 'Türk Mutfağı',
        documents: [
          {
            id: 'doc_1',
            name: 'Gıda Satış İzni',
            type: 'pdf',
            url: '/documents/food-license.pdf',
            uploadedAt: '2024-01-15T10:00:00Z'
          },
          {
            id: 'doc_2',
            name: 'İşletme Ruhsatı',
            type: 'pdf',
            url: '/documents/business-license.pdf',
            uploadedAt: '2024-01-15T10:05:00Z'
          }
        ],
        status: 'pending',
        appliedAt: '2024-01-15T09:00:00Z'
      },
      {
        id: 'app_2',
        businessName: 'Fresh Market',
        businessType: 'market',
        contactName: 'Fatma Demir',
        email: 'fatma@freshmarket.com',
        phone: '+905551234568',
        taxNumber: '9876543210',
        address: 'Cumhuriyet Meydanı No:45',
        city: 'Ankara',
        category: 'Süpermarket',
        documents: [
          {
            id: 'doc_3',
            name: 'Vergi Levhası',
            type: 'jpg',
            url: '/documents/tax-certificate.jpg',
            uploadedAt: '2024-01-16T14:00:00Z'
          }
        ],
        status: 'pending',
        appliedAt: '2024-01-16T13:00:00Z'
      },
      {
        id: 'app_3',
        businessName: 'Teknoloji Mağazası',
        businessType: 'marketplace',
        contactName: 'Mehmet Kaya',
        email: 'mehmet@teknomagaza.com',
        phone: '+905551234569',
        taxNumber: '5555555555',
        address: 'Teknoloji Caddesi No:78',
        city: 'İzmir',
        category: 'Elektronik',
        documents: [
          {
            id: 'doc_4',
            name: 'Ticaret Sicil Gazetesi',
            type: 'pdf',
            url: '/documents/trade-registry.pdf',
            uploadedAt: '2024-01-17T11:00:00Z'
          }
        ],
        status: 'pending',
        appliedAt: '2024-01-17T10:00:00Z'
      }
    ];

    setPendingApplications(mockApplications);

    // Load active vendors
    const vendors = mockDB.getTable('vendors');
    const vendorProfiles = mockDB.getTable('vendor_profiles');
    const users = mockDB.getTable('users');

    const activeVendorsData = vendors.map(vendor => {
      const profile = vendorProfiles.find(p => p.vendor_id === vendor.id);
      const user = users.find(u => u.id === vendor.user_id);
      
      // Mock performance data
      const performance: VendorPerformance = {
        totalSales: Math.floor(Math.random() * 100000) + 10000,
        totalOrders: Math.floor(Math.random() * 1000) + 100,
        averageRating: 4.2 + Math.random() * 0.7,
        ratingCount: Math.floor(Math.random() * 500) + 50,
        cancellationRate: Math.random() * 5,
        returnRate: Math.random() * 3,
        responseTime: Math.floor(Math.random() * 60) + 10,
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      return {
        ...vendor,
        profile,
        user,
        performance
      };
    });

    setActiveVendors(activeVendorsData);
  };

  const handleApproveApplication = (applicationId: string) => {
    if (!reviewNotes.trim()) {
      alert('Lütfen onay notunu girin');
      return;
    }

    setPendingApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: 'approved' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'admin',
              reviewNotes 
            }
          : app
      )
    );

    setReviewNotes('');
    setIsDetailsModalOpen(false);
    alert('Satıcı başvurusu onaylandı! Bilgilendirme e-postası gönderildi.');
  };

  const handleRejectApplication = (applicationId: string) => {
    if (!reviewNotes.trim()) {
      alert('Lütfen red sebebini girin');
      return;
    }

    setPendingApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: 'rejected' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'admin',
              reviewNotes 
            }
          : app
      )
    );

    setReviewNotes('');
    setIsDetailsModalOpen(false);
    alert('Satıcı başvurusu reddedildi! Bilgilendirme e-postası gönderildi.');
  };

  const handleSuspendVendor = (vendorId: string) => {
    if (confirm('Bu satıcıyı askıya almak istediğinizden emin misiniz?')) {
      mockDB.update('vendors', vendorId, { status: 'suspended' });
      loadVendorData();
      alert('Satıcı askıya alındı.');
    }
  };

  const handleActivateVendor = (vendorId: string) => {
    mockDB.update('vendors', vendorId, { status: 'active' });
    loadVendorData();
    alert('Satıcı aktif hale getirildi.');
  };

  const getBusinessTypeLabel = (type: string) => {
    const typeMap = {
      'marketplace': 'Pazaryeri Satıcısı',
      'restaurant': 'Restoran',
      'market': 'Market'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return '🍽️';
      case 'market':
        return '🛒';
      case 'marketplace':
        return '🏪';
      default:
        return '🏢';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Onay Bekliyor', color: 'bg-yellow-500', icon: AlertTriangle },
      'approved': { label: 'Onaylandı', color: 'bg-green-500', icon: CheckCircle },
      'rejected': { label: 'Reddedildi', color: 'bg-red-500', icon: XCircle },
      'active': { label: 'Aktif', color: 'bg-green-500', icon: CheckCircle },
      'suspended': { label: 'Askıya Alındı', color: 'bg-red-500', icon: Ban },
      'inactive': { label: 'Pasif', color: 'bg-gray-500', icon: Pause }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      color: 'bg-gray-500',
      icon: AlertTriangle
    };
    
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        <statusInfo.icon className="h-3 w-3 mr-1" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getPerformanceIndicator = (value: number, type: 'rating' | 'percentage') => {
    if (type === 'rating') {
      return value >= 4.5 ? 'text-green-600' : value >= 4.0 ? 'text-yellow-600' : 'text-red-600';
    } else {
      return value <= 2 ? 'text-green-600' : value <= 5 ? 'text-yellow-600' : 'text-red-600';
    }
  };

  const filteredApplications = pendingApplications.filter(app => {
    const matchesSearch = app.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || app.businessType === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredVendors = activeVendors.filter(vendor => {
    const matchesSearch = vendor.profile?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || vendor.business_type === selectedType;
    return matchesSearch && matchesType;
  });

  const pendingCount = pendingApplications.filter(app => app.status === 'pending').length;
  const approvedCount = pendingApplications.filter(app => app.status === 'approved').length;
  const rejectedCount = pendingApplications.filter(app => app.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Satıcı Onay ve Yönetimi</h2>
          <p className="text-gray-600">Satıcı başvurularını onaylayın ve mevcut satıcıları yönetin</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Onay Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Onaylanan</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Reddedilen</p>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Aktif Satıcı</p>
              <p className="text-2xl font-bold text-blue-600">{activeVendors.length}</p>
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
                  placeholder="İşletme adı, kişi adı veya e-posta ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="İşletme Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="marketplace">Pazaryeri Satıcısı</SelectItem>
                <SelectItem value="restaurant">Restoran</SelectItem>
                <SelectItem value="market">Market</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Onay Bekleyen Satıcılar ({pendingCount})</TabsTrigger>
          <TabsTrigger value="active">Mevcut Satıcılar ({activeVendors.length})</TabsTrigger>
        </TabsList>

        {/* Pending Applications */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onay Bekleyen Başvurular</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İşletme Bilgileri</TableHead>
                      <TableHead>İletişim</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead>Başvuru Tarihi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {getBusinessTypeIcon(application.businessType)}
                            </div>
                            <div>
                              <p className="font-medium">{application.businessName}</p>
                              <p className="text-sm text-gray-500">{application.category}</p>
                              <p className="text-xs text-gray-400">{application.city}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{application.contactName}</p>
                            <p className="text-sm text-gray-500">{application.email}</p>
                            <p className="text-sm text-gray-500">{application.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getBusinessTypeLabel(application.businessType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{new Date(application.appliedAt).toLocaleDateString('tr-TR')}</p>
                            <p className="text-xs text-gray-500">{new Date(application.appliedAt).toLocaleTimeString('tr-TR')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(application.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={isDetailsModalOpen && selectedApplication?.id === application.id} onOpenChange={setIsDetailsModalOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedApplication(application)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Detayları Gör
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Satıcı Başvuru Detayları</DialogTitle>
                                </DialogHeader>
                                {selectedApplication && (
                                  <div className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>İşletme Adı</Label>
                                        <p className="font-medium">{selectedApplication.businessName}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>İşletme Türü</Label>
                                        <p>{getBusinessTypeLabel(selectedApplication.businessType)}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Yetkili Kişi</Label>
                                        <p>{selectedApplication.contactName}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>E-posta</Label>
                                        <p>{selectedApplication.email}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Telefon</Label>
                                        <p>{selectedApplication.phone}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Vergi Numarası</Label>
                                        <p>{selectedApplication.taxNumber}</p>
                                      </div>
                                      {selectedApplication.tradeRegistryNumber && (
                                        <div className="space-y-2">
                                          <Label>Ticaret Sicil No</Label>
                                          <p>{selectedApplication.tradeRegistryNumber}</p>
                                        </div>
                                      )}
                                      <div className="space-y-2">
                                        <Label>Kategori</Label>
                                        <p>{selectedApplication.category}</p>
                                      </div>
                                    </div>

                                    <Separator />

                                    {/* Address */}
                                    <div className="space-y-2">
                                      <Label>Adres</Label>
                                      <p>{selectedApplication.address}, {selectedApplication.city}</p>
                                    </div>

                                    <Separator />

                                    {/* Documents */}
                                    <div className="space-y-4">
                                      <Label>Yüklenen Belgeler</Label>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedApplication.documents.map((doc) => (
                                          <Card key={doc.id} className="p-4">
                                            <div className="flex items-center gap-3">
                                              <FileText className="h-8 w-8 text-blue-600" />
                                              <div className="flex-1">
                                                <p className="font-medium">{doc.name}</p>
                                                <p className="text-sm text-gray-500">
                                                  {new Date(doc.uploadedAt).toLocaleDateString('tr-TR')}
                                                </p>
                                              </div>
                                              <Button variant="outline" size="sm">
                                                Görüntüle
                                              </Button>
                                            </div>
                                          </Card>
                                        ))}
                                      </div>
                                    </div>

                                    <Separator />

                                    {/* Review Section */}
                                    {selectedApplication.status === 'pending' && (
                                      <div className="space-y-4">
                                        <Label>İnceleme Notu</Label>
                                        <Textarea
                                          placeholder="Onay/red sebebini yazın..."
                                          value={reviewNotes}
                                          onChange={(e) => setReviewNotes(e.target.value)}
                                          rows={3}
                                        />
                                        <div className="flex gap-2">
                                          <Button 
                                            onClick={() => handleApproveApplication(selectedApplication.id)}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Onayla
                                          </Button>
                                          <Button 
                                            variant="destructive"
                                            onClick={() => handleRejectApplication(selectedApplication.id)}
                                          >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reddet
                                          </Button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Review History */}
                                    {selectedApplication.reviewedAt && (
                                      <div className="space-y-2">
                                        <Label>İnceleme Geçmişi</Label>
                                        <Card className="p-4">
                                          <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                              <span className="font-medium">
                                                {selectedApplication.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                                              </span>
                                              <span className="text-sm text-gray-500">
                                                {new Date(selectedApplication.reviewedAt).toLocaleString('tr-TR')}
                                              </span>
                                            </div>
                                            {selectedApplication.reviewNotes && (
                                              <p className="text-sm text-gray-600">{selectedApplication.reviewNotes}</p>
                                            )}
                                          </div>
                                        </Card>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Başvuru bulunamadı</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Arama kriterlerinizi değiştirmeyi deneyin
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Vendors */}
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getBusinessTypeIcon(vendor.business_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{vendor.profile?.business_name || vendor.business_name}</h3>
                          <p className="text-sm text-gray-500">{getBusinessTypeLabel(vendor.business_type)}</p>
                        </div>
                      </div>
                      {getStatusBadge(vendor.status)}
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">₺{vendor.performance.totalSales.toLocaleString('tr-TR')}</p>
                        <p className="text-xs text-gray-500">Toplam Satış</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{vendor.performance.totalOrders}</p>
                        <p className="text-xs text-gray-500">Sipariş Sayısı</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${getPerformanceIndicator(vendor.performance.averageRating, 'rating')}`}>
                          ⭐ {vendor.performance.averageRating.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">{vendor.performance.ratingCount} değerlendirme</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${getPerformanceIndicator(vendor.performance.cancellationRate, 'percentage')}`}>
                          %{vendor.performance.cancellationRate.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">İptal Oranı</p>
                      </div>
                    </div>

                    {/* Performance Indicators */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>İade Oranı:</span>
                        <span className={getPerformanceIndicator(vendor.performance.returnRate, 'percentage')}>
                          %{vendor.performance.returnRate.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Yanıt Süresi:</span>
                        <span>{vendor.performance.responseTime} dk</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Son Aktivite:</span>
                        <span>{new Date(vendor.performance.lastActive).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Dialog open={isVendorDetailsOpen && selectedVendor?.id === vendor.id} onOpenChange={setIsVendorDetailsOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedVendor(vendor)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detaylar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Satıcı Detayları - {selectedVendor?.profile?.business_name}</DialogTitle>
                          </DialogHeader>
                          {selectedVendor && (
                            <div className="space-y-6">
                              {/* Basic Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>İşletme Adı</Label>
                                  <p className="font-medium">{selectedVendor.profile?.business_name}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>İşletme Türü</Label>
                                  <p>{getBusinessTypeLabel(selectedVendor.business_type)}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>Yetkili Kişi</Label>
                                  <p>{selectedVendor.user?.name}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>E-posta</Label>
                                  <p>{selectedVendor.profile?.contact_email}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>Telefon</Label>
                                  <p>{selectedVendor.profile?.contact_phone}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>Vergi Numarası</Label>
                                  <p>{selectedVendor.tax_number}</p>
                                </div>
                              </div>

                              <Separator />

                              {/* Performance Details */}
                              <div className="space-y-4">
                                <h4 className="font-semibold">Performans Detayları</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Card className="p-4">
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-green-600">
                                        ₺{selectedVendor.performance.totalSales.toLocaleString('tr-TR')}
                                      </p>
                                      <p className="text-sm text-gray-500">Toplam Satış</p>
                                    </div>
                                  </Card>
                                  <Card className="p-4">
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-blue-600">
                                        {selectedVendor.performance.totalOrders}
                                      </p>
                                      <p className="text-sm text-gray-500">Toplam Sipariş</p>
                                    </div>
                                  </Card>
                                  <Card className="p-4">
                                    <div className="text-center">
                                      <p className={`text-2xl font-bold ${getPerformanceIndicator(selectedVendor.performance.averageRating, 'rating')}`}>
                                        ⭐ {selectedVendor.performance.averageRating.toFixed(1)}
                                      </p>
                                      <p className="text-sm text-gray-500">Ortalama Puan</p>
                                    </div>
                                  </Card>
                                </div>
                              </div>

                              <Separator />

                              {/* Actions */}
                              <div className="flex gap-2">
                                {selectedVendor.status === 'active' ? (
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleSuspendVendor(selectedVendor.id)}
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Mağazayı Askıya Al
                                  </Button>
                                ) : (
                                  <Button 
                                    onClick={() => handleActivateVendor(selectedVendor.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Mağazayı Aktifleştir
                                  </Button>
                                )}
                                <Button variant="outline">
                                  <Store className="h-4 w-4 mr-2" />
                                  Mağazayı Görüntüle
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Store className="h-4 w-4 mr-2" />
                            Mağazayı Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Performans Raporu
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {vendor.status === 'active' ? (
                            <DropdownMenuItem 
                              onClick={() => handleSuspendVendor(vendor.id)}
                              className="text-red-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Askıya Al
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleActivateVendor(vendor.id)}
                              className="text-green-600"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Aktifleştir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVendors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Satıcı bulunamadı</p>
              <p className="text-sm text-gray-400 mt-1">
                Arama kriterlerinizi değiştirmeyi deneyin
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
