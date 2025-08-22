
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RefreshCw,
  Database
} from "lucide-react";
import { toast } from "sonner";

interface BulkOperation {
  id: number;
  islem_tipi: string;
  dosya_adi: string;
  toplam_kayit: number;
  basarili_kayit: number;
  hatali_kayit: number;
  durum: string;
  create_time: string;
}

export function BulkOperations() {
  const [operations, setOperations] = useState<BulkOperation[]>([
    {
      id: 1,
      islem_tipi: 'urun_import',
      dosya_adi: 'elektronik_urunler_2024.csv',
      toplam_kayit: 150,
      basarili_kayit: 145,
      hatali_kayit: 5,
      durum: 'tamamlandi',
      create_time: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      islem_tipi: 'kategori_import',
      dosya_adi: 'yeni_kategoriler.xml',
      toplam_kayit: 25,
      basarili_kayit: 25,
      hatali_kayit: 0,
      durum: 'tamamlandi',
      create_time: '2024-01-15T11:15:00Z'
    },
    {
      id: 3,
      islem_tipi: 'stok_guncelleme',
      dosya_adi: 'stok_guncelleme_ocak.csv',
      toplam_kayit: 500,
      basarili_kayit: 485,
      hatali_kayit: 15,
      durum: 'tamamlandi',
      create_time: '2024-01-15T12:00:00Z'
    }
  ]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Dosya yükleme
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, operationType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    // Simüle edilmiş yükleme işlemi
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast.success('Dosya başarıyla yüklendi ve işleme alındı');
          
          // Yeni işlem ekle
          const newOperation: BulkOperation = {
            id: operations.length + 1,
            islem_tipi: operationType,
            dosya_adi: file.name,
            toplam_kayit: Math.floor(Math.random() * 1000) + 100,
            basarili_kayit: 0,
            hatali_kayit: 0,
            durum: 'isleniyor',
            create_time: new Date().toISOString()
          };
          
          setOperations(prev => [newOperation, ...prev]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Durum badge'i
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'tamamlandi':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Tamamlandı</Badge>;
      case 'isleniyor':
        return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />İşleniyor</Badge>;
      case 'hata':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Hata</Badge>;
      case 'beklemede':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Beklemede</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // İşlem tipi adı
  const getOperationName = (type: string) => {
    switch (type) {
      case 'urun_import':
        return 'Ürün İçe Aktarma';
      case 'kategori_import':
        return 'Kategori İçe Aktarma';
      case 'stok_guncelleme':
        return 'Stok Güncelleme';
      case 'fiyat_guncelleme':
        return 'Fiyat Güncelleme';
      case 'urun_export':
        return 'Ürün Dışa Aktarma';
      default:
        return type;
    }
  };

  // Başarı oranı hesaplama
  const getSuccessRate = (operation: BulkOperation) => {
    if (operation.toplam_kayit === 0) return 0;
    return Math.round((operation.basarili_kayit / operation.toplam_kayit) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Toplu İşlem Seçenekleri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ürün İçe Aktarma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Ürün İçe Aktarma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              CSV veya Excel dosyası ile toplu ürün ekleme
            </p>
            <div className="space-y-2">
              <Label htmlFor="product-upload">Dosya Seç</Label>
              <Input
                id="product-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleFileUpload(e, 'urun_import')}
                disabled={uploading}
              />
            </div>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Örnek Dosya İndir
            </Button>
          </CardContent>
        </Card>

        {/* Kategori İçe Aktarma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Kategori İçe Aktarma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              XML veya JSON dosyası ile kategori yapısı oluşturma
            </p>
            <div className="space-y-2">
              <Label htmlFor="category-upload">Dosya Seç</Label>
              <Input
                id="category-upload"
                type="file"
                accept=".xml,.json"
                onChange={(e) => handleFileUpload(e, 'kategori_import')}
                disabled={uploading}
              />
            </div>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Şablon İndir
            </Button>
          </CardContent>
        </Card>

        {/* Stok Güncelleme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Stok Güncelleme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Toplu stok miktarı güncelleme işlemi
            </p>
            <div className="space-y-2">
              <Label htmlFor="stock-upload">Dosya Seç</Label>
              <Input
                id="stock-upload"
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => handleFileUpload(e, 'stok_guncelleme')}
                disabled={uploading}
              />
            </div>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Mevcut Stokları İndir
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Yükleme İlerlemesi */}
      {uploading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dosya yükleniyor...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* İşlem Geçmişi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Toplu İşlem Geçmişi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {operations.map((operation) => (
              <div key={operation.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{getOperationName(operation.islem_tipi)}</div>
                    <div className="text-sm text-muted-foreground">{operation.dosya_adi}</div>
                  </div>
                  {getStatusBadge(operation.durum)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{operation.toplam_kayit}</div>
                    <div className="text-muted-foreground">Toplam Kayıt</div>
                  </div>
                  <div>
                    <div className="font-medium text-green-600">{operation.basarili_kayit}</div>
                    <div className="text-muted-foreground">Başarılı</div>
                  </div>
                  <div>
                    <div className="font-medium text-red-600">{operation.hatali_kayit}</div>
                    <div className="text-muted-foreground">Hatalı</div>
                  </div>
                  <div>
                    <div className="font-medium">{getSuccessRate(operation)}%</div>
                    <div className="text-muted-foreground">Başarı Oranı</div>
                  </div>
                </div>

                {operation.durum === 'tamamlandi' && operation.toplam_kayit > 0 && (
                  <Progress value={getSuccessRate(operation)} className="h-2" />
                )}

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(operation.create_time).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <div className="flex space-x-2">
                    {operation.hatali_kayit > 0 && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Hata Raporu
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      Detaylar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dışa Aktarma Seçenekleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Dışa Aktarma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span>Tüm Ürünleri Dışa Aktar</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span>Kategorileri Dışa Aktar</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span>Stok Raporunu Dışa Aktar</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
