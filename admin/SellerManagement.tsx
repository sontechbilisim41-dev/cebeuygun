
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Store,
  Users,
  AlertTriangle,
  TrendingUp,
  FileText,
  Download,
  RefreshCw,
  Pause,
  Play,
  Ban,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { toast } from "sonner";

interface SellerApplication {
  id: number;
  kullanici_id: number;
  sirket_adi: string;
  vergi_no?: string;
  kategori: string;
  adres: any;
  iletisim_bilgileri: any;
  basvuru_notu?: string;
  durum: string;
  admin_notu?: string;
  create_time: string;
  onay_tarihi?: string;
  red_tarihi?: string;
}

interface Seller {
  id: number;
  kullanici_id: number;
  sirket_adi: string;
  vergi_no?: string;
  kategori: string;
  durum: string;
  performans_puani: number;
  komisyon_orani: number;
  minimum_siparis_tutari: number;
  teslimat_suresi_dk: number;
  create_time: string;
  onay_tarihi?: string;
}

interface SellerDocument {
  id: number;
  satici_id: number;
  belge_tipi: string;
  belge_adi: string;
  dosya_url: string;
  gecerlilik_tarihi?: string;
  onay_durumu: string;
  create_time: string;
}

interface SellerStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  activeSellers: number;
  suspendedSellers: number;
}

export function SellerManagement() {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [documents, setDocuments] = useState<SellerDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const [showSellerDetail, setShowSellerDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("applications");
  const [adminNote, setAdminNote] = useState("");
  const [quickActionDialog, setQuickActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    application: SellerApplication | null;
  }>({ open: false, type: null, application: null });
  const [stats, setStats] = useState<SellerStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    activeSellers: 0,
    suspendedSellers: 0
  });

  // Başvuruları getir
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== "all") params.durum = statusFilter;
      if (categoryFilter !== "all") params.kategori = categoryFilter;
      if (searchQuery) params.search = searchQuery;

      const data = await api.get<SellerApplication[]>('/satici_basvurulari', params);
      setApplications(data);
      
      // İstatistikleri hesapla
      const newStats = {
        totalApplications: data.length,
        pendingApplications: data.filter(a => a.durum === 'beklemede').length,
        approvedApplications: data.filter(a => a.durum === 'onaylandi').length,
        rejectedApplications: data.filter(a => a.durum === 'reddedildi').length,
        activeSellers: sellers.filter(s => s.durum === 'aktif').length,
        suspendedSellers: sellers.filter(s => s.durum === 'askida').length
      };
      setStats(newStats);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Başvurular yüklenemedi: ${error.message}`);
      } else {
        console.error('Başvurular yüklenemedi:', error);
        // Fallback: Mock data kullan
        const mockApplications: SellerApplication[] = [
          {
            id: 1,
            kullanici_id: 5,
            sirket_adi: "Moda Dünyası Butik",
            vergi_no: "4567890123",
            kategori: "genel",
            adres: {
              sehir: "İstanbul",
              ilce: "Beyoğlu",
              adres: "İstiklal Cad. No:123"
            },
            iletisim_bilgileri: {
              telefon: "+905551234571",
              email: "satici4@example.com"
            },
            basvuru_notu: "Kadın ve erkek giyim ürünleri satışı yapmak istiyorum.",
            durum: "beklemede",
            create_time: "2024-01-15T09:00:00Z"
          },
          {
            id: 2,
            kullanici_id: 6,
            sirket_adi: "Teknoloji Merkezi",
            vergi_no: "5678901234",
            kategori: "genel",
            adres: {
              sehir: "Ankara",
              ilce: "Çankaya",
              adres: "Kızılay Mah. Atatürk Blv. No:456"
            },
            iletisim_bilgileri: {
              telefon: "+905551234572",
              email: "tech@example.com"
            },
            basvuru_notu: "Bilgisayar ve elektronik ürünleri satışı.",
            durum: "beklemede",
            create_time: "2024-01-16T10:30:00Z"
          }
        ];
        setApplications(mockApplications);
      }
    } finally {
      setLoading(false);
    }
  };

  // Satıcıları getir
  const fetchSellers = async () => {
    try {
      const data = await api.get<Seller[]>('/saticilar');
      setSellers(data);
    } catch (error) {
      console.error('Satıcılar yüklenemedi:', error);
    }
  };

  // Belgeleri getir
  const fetchDocuments = async (sellerId: number) => {
    try {
      // Mock data - gerçek API endpoint'i henüz mevcut değil
      const mockDocuments: SellerDocument[] = [
        {
          id: 1,
          satici_id: sellerId,
          belge_tipi: "ticaret_sicil",
          belge_adi: "Ticaret Sicil Gazetesi",
          dosya_url: "/documents/ticaret_sicil_1.pdf",
          gecerlilik_tarihi: "2025-12-31",
          onay_durumu: "onaylandi",
          create_time: "2024-01-15T09:00:00Z"
        },
        {
          id: 2,
          satici_id: sellerId,
          belge_tipi: "vergi_levhasi",
          belge_adi: "Vergi Levhası",
          dosya_url: "/documents/vergi_levhasi_1.pdf",
          onay_durumu: "beklemede",
          create_time: "2024-01-15T09:05:00Z"
        }
      ];
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Belgeler yüklenemedi:', error);
    }
  };

  // Hızlı onaylama
  const quickApprove = async (application: SellerApplication) => {
    try {
      await api.put(`/satici_basvurulari?id=${application.id}`, {
        durum: 'onaylandi',
        admin_notu: 'Hızlı onay - Belgeler uygun',
        admin_id: 1
      });

      // Başvuru listesini güncelle
      setApplications(prev => prev.map(app => 
        app.id === application.id 
          ? { 
              ...app, 
              durum: 'onaylandi', 
              admin_notu: 'Hızlı onay - Belgeler uygun',
              onay_tarihi: new Date().toISOString()
            }
          : app
      ));

      // Satıcı listesini yenile
      await fetchSellers();

      toast.success(`${application.sirket_adi} başvurusu onaylandı`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Başvuru onaylanamadı: ${error.message}`);
      } else {
        toast.error('Başvuru onaylanamadı');
      }
    }
  };

  // Hızlı reddetme
  const quickReject = async (application: SellerApplication, reason: string) => {
    try {
      await api.put(`/satici_basvurulari?id=${application.id}`, {
        durum: 'reddedildi',
        admin_notu: reason,
        admin_id: 1
      });

      setApplications(prev => prev.map(app => 
        app.id === application.id 
          ? { 
              ...app, 
              durum: 'reddedildi', 
              admin_notu: reason,
              red_tarihi: new Date().toISOString()
            }
          : app
      ));

      toast.success(`${application.sirket_adi} başvurusu reddedildi`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Başvuru reddedilemedi: ${error.message}`);
      } else {
        toast.error('Başvuru reddedilemedi');
      }
    }
  };

  // Başvuru onaylama (detaylı)
  const approveApplication = async (applicationId: number) => {
    if (!adminNote.trim()) {
      toast.error('Lütfen onay notu ekleyiniz');
      return;
    }

    try {
      await api.put(`/satici_basvurulari?id=${applicationId}`, {
        durum: 'onaylandi',
        admin_notu: adminNote,
        admin_id: 1
      });

      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              durum: 'onaylandi', 
              admin_notu: adminNote,
              onay_tarihi: new Date().toISOString()
            }
          : app
      ));

      await fetchSellers();

      toast.success('Başvuru onaylandı ve satıcı hesabı oluşturuldu');
      setShowApplicationDetail(false);
      setAdminNote("");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Başvuru onaylanamadı: ${error.message}`);
      } else {
        toast.error('Başvuru onaylanamadı');
      }
    }
  };

  // Başvuru reddetme (detaylı)
  const rejectApplication = async (applicationId: number, reason: string) => {
    if (!reason.trim()) {
      toast.error('Lütfen red nedeni belirtiniz');
      return;
    }

    try {
      await api.put(`/satici_basvurulari?id=${applicationId}`, {
        durum: 'reddedildi',
        admin_notu: reason,
        admin_id: 1
      });

      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              durum: 'reddedildi', 
              admin_notu: reason,
              red_tarihi: new Date().toISOString()
            }
          : app
      ));

      toast.success('Başvuru reddedildi');
      setShowApplicationDetail(false);
      setAdminNote("");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Başvuru reddedilemedi: ${error.message}`);
      } else {
        toast.error('Başvuru reddedilemedi');
      }
    }
  };

  // Satıcı durumu güncelleme
  const updateSellerStatus = async (sellerId: number, newStatus: string) => {
    try {
      await api.put(`/saticilar?id=${sellerId}`, { durum: newStatus });
      setSellers(prev => prev.map(seller => 
        seller.id === sellerId ? { ...seller, durum: newStatus } : seller
      ));
      toast.success('Satıcı durumu güncellendi');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Durum güncellenemedi: ${error.message}`);
      } else {
        toast.error('Beklenmeyen bir hata oluştu');
      }
    }
  };

  // Durum badge'i
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'beklemede':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Beklemede</Badge>;
      case 'onaylandi':
      case 'aktif':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aktif</Badge>;
      case 'reddedildi':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Reddedildi</Badge>;
      case 'pasif':
        return <Badge className="bg-gray-100 text-gray-800"><Pause className="h-3 w-3 mr-1" />Pasif</Badge>;
      case 'askida':
        return <Badge className="bg-orange-100 text-orange-800"><Ban className="h-3 w-3 mr-1" />Askıda</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Kategori adı
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'genel':
        return 'Genel Ürünler';
      case 'restoran':
        return 'Restoran';
      case 'market':
        return 'Market';
      default:
        return category;
    }
  };

  // Belge tipi adı
  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'ticaret_sicil':
        return 'Ticaret Sicil Gazetesi';
      case 'vergi_levhasi':
        return 'Vergi Levhası';
      case 'gida_izni':
        return 'Gıda Satış İzni';
      case 'isletme_ruhsati':
        return 'İşletme Ruhsatı';
      default:
        return type;
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchSellers();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchApplications();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter, categoryFilter]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.sirket_adi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.durum === statusFilter;
    const matchesCategory = categoryFilter === "all" || app.kategori === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.sirket_adi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || seller.durum === statusFilter;
    const matchesCategory = categoryFilter === "all" || seller.kategori === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
                <p className="text-xs text-muted-foreground">Toplam Başvuru</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                <p className="text-xs text-muted-foreground">Bekleyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.approvedApplications}</p>
                <p className="text-xs text-muted-foreground">Onaylanan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.rejectedApplications}</p>
                <p className="text-xs text-muted-foreground">Reddedilen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.activeSellers}</p>
                <p className="text-xs text-muted-foreground">Aktif Satıcı</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.suspendedSellers}</p>
                <p className="text-xs text-muted-foreground">Askıda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Şirket adı ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="beklemede">Beklemede</SelectItem>
                <SelectItem value="onaylandi">Onaylandı</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="pasif">Pasif</SelectItem>
                <SelectItem value="reddedildi">Reddedildi</SelectItem>
                <SelectItem value="askida">Askıda</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                <SelectItem value="genel">Genel Ürünler</SelectItem>
                <SelectItem value="restoran">Restoran</SelectItem>
                <SelectItem value="market">Market</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchApplications(); fetchSellers(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="applications">
            Onay Bekleyen Başvurular ({stats.pendingApplications})
          </TabsTrigger>
          <TabsTrigger value="sellers">
            Mevcut Satıcılar ({stats.activeSellers})
          </TabsTrigger>
        </TabsList>

        {/* Başvurular Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Satıcı Başvuruları ({filteredApplications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Başvurular yükleniyor...</p>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Başvuru bulunmuyor.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Şirket Adı</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Başvuru Tarihi</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{application.sirket_adi}</div>
                              {application.vergi_no && (
                                <div className="text-sm text-muted-foreground">
                                  VN: {application.vergi_no}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getCategoryName(application.kategori)}</TableCell>
                          <TableCell>
                            {new Date(application.create_time).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell>{getStatusBadge(application.durum)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {application.durum === 'beklemede' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => quickApprove(application)}
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    Onayla
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setQuickActionDialog({
                                      open: true,
                                      type: 'reject',
                                      application
                                    })}
                                  >
                                    <ThumbsDown className="h-4 w-4 mr-1" />
                                    Reddet
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setShowApplicationDetail(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Satıcılar Tab */}
        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Mevcut Satıcılar ({filteredSellers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSellers.length === 0 ? (
                <div className="text-center py-8">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Satıcı bulunmuyor.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Şirket Adı</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Performans</TableHead>
                        <TableHead>Komisyon</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSellers.map((seller) => (
                        <TableRow key={seller.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{seller.sirket_adi}</div>
                              {seller.vergi_no && (
                                <div className="text-sm text-muted-foreground">
                                  VN: {seller.vergi_no}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getCategoryName(seller.kategori)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span>{seller.performans_puani.toFixed(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell>%{seller.komisyon_orani}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(seller.durum)}
                              <div className="flex gap-1">
                                {seller.durum === 'aktif' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                    onClick={() => updateSellerStatus(seller.id, 'askida')}
                                  >
                                    <Ban className="h-3 w-3 mr-1" />
                                    Askıya Al
                                  </Button>
                                )}
                                {seller.durum === 'askida' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => updateSellerStatus(seller.id, 'aktif')}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Aktifleştir
                                  </Button>
                                )}
                                {seller.durum === 'aktif' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                    onClick={() => updateSellerStatus(seller.id, 'pasif')}
                                  >
                                    <Pause className="h-3 w-3 mr-1" />
                                    Pasifleştir
                                  </Button>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedSeller(seller);
                                fetchDocuments(seller.id);
                                setShowSellerDetail(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hızlı İşlem Dialog */}
      <AlertDialog open={quickActionDialog.open} onOpenChange={(open) => setQuickActionDialog({ ...quickActionDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {quickActionDialog.type === 'reject' ? 'Başvuruyu Reddet' : 'Başvuruyu Onayla'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {quickActionDialog.type === 'reject' 
                ? `${quickActionDialog.application?.sirket_adi} başvurusunu reddetmek istediğinizden emin misiniz?`
                : `${quickActionDialog.application?.sirket_adi} başvurusunu onaylamak istediğinizden emin misiniz?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          {quickActionDialog.type === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Red Nedeni</label>
              <Textarea
                placeholder="Red nedenini belirtiniz..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminNote("")}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (quickActionDialog.type === 'reject' && quickActionDialog.application) {
                  if (!adminNote.trim()) {
                    toast.error('Lütfen red nedeni belirtiniz');
                    return;
                  }
                  quickReject(quickActionDialog.application, adminNote);
                } else if (quickActionDialog.type === 'approve' && quickActionDialog.application) {
                  quickApprove(quickActionDialog.application);
                }
                setQuickActionDialog({ open: false, type: null, application: null });
                setAdminNote("");
              }}
              className={quickActionDialog.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {quickActionDialog.type === 'reject' ? 'Reddet' : 'Onayla'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Başvuru Detay Dialog */}
      <Dialog open={showApplicationDetail} onOpenChange={setShowApplicationDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Satıcı Başvuru Detayları</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Şirket Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Şirket Adı</label>
                      <p className="text-sm text-muted-foreground">{selectedApplication.sirket_adi}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Vergi Numarası</label>
                      <p className="text-sm text-muted-foreground">{selectedApplication.vergi_no || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Kategori</label>
                      <p className="text-sm text-muted-foreground">{getCategoryName(selectedApplication.kategori)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Durum</label>
                      <div className="mt-1">{getStatusBadge(selectedApplication.durum)}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">İletişim Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Telefon</label>
                      <p className="text-sm text-muted-foreground">{selectedApplication.iletisim_bilgileri?.telefon}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">E-posta</label>
                      <p className="text-sm text-muted-foreground">{selectedApplication.iletisim_bilgileri?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Adres</label>
                      <p className="text-sm text-muted-foreground">
                        {selectedApplication.adres?.adres}, {selectedApplication.adres?.ilce}/{selectedApplication.adres?.sehir}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Başvuru Notu */}
              {selectedApplication.basvuru_notu && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Başvuru Notu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedApplication.basvuru_notu}</p>
                  </CardContent>
                </Card>
              )}

              {/* Admin Notu */}
              {selectedApplication.admin_notu && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Notu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedApplication.admin_notu}</p>
                  </CardContent>
                </Card>
              )}

              {/* İşlem Butonları */}
              {selectedApplication.durum === 'beklemede' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">İşlem Yap</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Admin Notu</label>
                      <Textarea
                        placeholder="Onay/Red nedeni ve notlarınızı yazın..."
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!adminNote.trim()) {
                            toast.error('Lütfen red nedeni belirtiniz');
                            return;
                          }
                          rejectApplication(selectedApplication.id, adminNote);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reddet
                      </Button>
                      <Button
                        onClick={() => approveApplication(selectedApplication.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Onayla
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Satıcı Detay Dialog */}
      <Dialog open={showSellerDetail} onOpenChange={setShowSellerDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Satıcı Detayları</DialogTitle>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-6">
              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Şirket Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Şirket Adı</label>
                      <p className="text-sm text-muted-foreground">{selectedSeller.sirket_adi}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Vergi Numarası</label>
                      <p className="text-sm text-muted-foreground">{selectedSeller.vergi_no || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Kategori</label>
                      <p className="text-sm text-muted-foreground">{getCategoryName(selectedSeller.kategori)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Durum</label>
                      <div className="mt-1">{getStatusBadge(selectedSeller.durum)}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performans Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Performans Puanı</label>
                      <p className="text-sm text-muted-foreground">{selectedSeller.performans_puani.toFixed(1)}/5.0</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Komisyon Oranı</label>
                      <p className="text-sm text-muted-foreground">%{selectedSeller.komisyon_orani}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Min. Sipariş Tutarı</label>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        }).format(selectedSeller.minimum_siparis_tutari)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Teslimat Süresi</label>
                      <p className="text-sm text-muted-foreground">{selectedSeller.teslimat_suresi_dk} dakika</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Belgeler */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Yüklenen Belgeler</CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Henüz belge yüklenmemiş.</p>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{getDocumentTypeName(doc.belge_tipi)}</div>
                            <div className="text-sm text-muted-foreground">{doc.belge_adi}</div>
                            {doc.gecerlilik_tarihi && (
                              <div className="text-xs text-muted-foreground">
                                Geçerlilik: {new Date(doc.gecerlilik_tarihi).toLocaleDateString('tr-TR')}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(doc.onay_durumu)}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
