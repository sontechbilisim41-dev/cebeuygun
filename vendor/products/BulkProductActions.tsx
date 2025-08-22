
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  Edit, 
  DollarSign,
  Package
} from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { bulkUpdateProducts } from '@/store/slices/productsSlice';
import { toast } from 'sonner';

interface BulkProductActionsProps {
  selectedProducts: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkProductActions({ selectedProducts, onClose, onSuccess }: BulkProductActionsProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [bulkData, setBulkData] = useState({
    price: '',
    stock: '',
    priceChange: 'set', // 'set', 'increase', 'decrease'
    stockChange: 'set', // 'set', 'add', 'subtract'
  });

  const handleBulkPriceUpdate = async () => {
    if (!bulkData.price) {
      toast.error('Lütfen fiyat değeri girin');
      return;
    }

    setLoading(true);
    try {
      const price = parseFloat(bulkData.price);
      let updates: any = {};

      switch (bulkData.priceChange) {
        case 'set':
          updates.price = price;
          break;
        case 'increase':
          updates.price_increase = price;
          break;
        case 'decrease':
          updates.price_decrease = price;
          break;
      }

      await dispatch(bulkUpdateProducts({
        productIds: selectedProducts,
        updates
      })).unwrap();

      toast.success(`${selectedProducts.length} ürünün fiyatı güncellendi`);
      onSuccess();
    } catch (error) {
      toast.error('Fiyat güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStockUpdate = async () => {
    if (!bulkData.stock) {
      toast.error('Lütfen stok değeri girin');
      return;
    }

    setLoading(true);
    try {
      const stock = parseInt(bulkData.stock);
      let updates: any = {};

      switch (bulkData.stockChange) {
        case 'set':
          updates.stock_quantity = stock;
          break;
        case 'add':
          updates.stock_add = stock;
          break;
        case 'subtract':
          updates.stock_subtract = stock;
          break;
      }

      await dispatch(bulkUpdateProducts({
        productIds: selectedProducts,
        updates
      })).unwrap();

      toast.success(`${selectedProducts.length} ürünün stoku güncellendi`);
      onSuccess();
    } catch (error) {
      toast.error('Stok güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Excel template download logic
    const csvContent = `SKU,Ürün Adı,Fiyat,Stok,Kategori,Açıklama
SAMPLE-001,Örnek Ürün 1,99.99,50,Elektronik,Örnek ürün açıklaması
SAMPLE-002,Örnek Ürün 2,149.99,25,Moda,Örnek ürün açıklaması`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'urun-sablonu.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Şablon dosyası indirildi');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File upload logic
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // Parse CSV/Excel content and process
      toast.success('Dosya yüklendi, işleniyor...');
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Toplu Ürün İşlemleri ({selectedProducts.length} ürün seçili)
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="bulk-edit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bulk-edit">Toplu Düzenleme</TabsTrigger>
            <TabsTrigger value="import">İçe Aktarma</TabsTrigger>
            <TabsTrigger value="export">Dışa Aktarma</TabsTrigger>
          </TabsList>

          <TabsContent value="bulk-edit" className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium">Toplu Fiyat Güncelleme</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>İşlem Türü</Label>
                    <select
                      value={bulkData.priceChange}
                      onChange={(e) => setBulkData(prev => ({ ...prev, priceChange: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="set">Fiyatı Ayarla</option>
                      <option value="increase">Fiyatı Artır</option>
                      <option value="decrease">Fiyatı Azalt</option>
                    </select>
                  </div>
                  <div>
                    <Label>Değer (₺)</Label>
                    <Input
                      type="number"
                      value={bulkData.price}
                      onChange={(e) => setBulkData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleBulkPriceUpdate}
                  disabled={loading || !bulkData.price}
                  className="mt-4 w-full"
                >
                  Fiyatları Güncelle
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium">Toplu Stok Güncelleme</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>İşlem Türü</Label>
                    <select
                      value={bulkData.stockChange}
                      onChange={(e) => setBulkData(prev => ({ ...prev, stockChange: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="set">Stoku Ayarla</option>
                      <option value="add">Stok Ekle</option>
                      <option value="subtract">Stok Çıkar</option>
                    </select>
                  </div>
                  <div>
                    <Label>Adet</Label>
                    <Input
                      type="number"
                      value={bulkData.stock}
                      onChange={(e) => setBulkData(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleBulkStockUpdate}
                  disabled={loading || !bulkData.stock}
                  className="mt-4 w-full"
                >
                  Stokları Güncelle
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Excel/CSV Dosyası Yükle</h3>
                <p className="text-gray-600 mb-4">
                  Toplu ürün eklemek veya güncellemek için Excel/CSV dosyası yükleyin
                </p>
                
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild>
                    <span>Dosya Seç</span>
                  </Button>
                </label>
              </div>
              
              <div className="text-left">
                <h4 className="font-medium mb-2">Dosya Formatı:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• CSV veya Excel formatında olmalıdır</li>
                  <li>• İlk satır başlık satırı olmalıdır</li>
                  <li>• SKU, Ürün Adı, Fiyat, Stok kolonları zorunludur</li>
                  <li>• Maksimum 1000 ürün yüklenebilir</li>
                </ul>
              </div>
              
              <Button variant="outline" onClick={downloadTemplate} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Şablon Dosyasını İndir
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Seçili Ürünleri Dışa Aktar</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedProducts.length} seçili ürünü Excel formatında dışa aktarın
                </p>
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Seçili Ürünleri İndir
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Tüm Ürünleri Dışa Aktar</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Mağazanızdaki tüm ürünleri Excel formatında dışa aktarın
                </p>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Tüm Ürünleri İndir
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
