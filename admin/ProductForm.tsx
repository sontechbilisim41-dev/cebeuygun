
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, Minus } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { toast } from "sonner";

interface Product {
  id: number;
  ad: string;
  slug: string;
  aciklama?: string;
  kisa_aciklama?: string;
  fiyat: number;
  indirimli_fiyat?: number;
  stok_miktari: number;
  minimum_stok: number;
  birim: string;
  durum: string;
  satici_id: number;
  kategori_id: number;
}

interface Category {
  id: number;
  ad: string;
  parent_id?: number;
}

interface Seller {
  id: number;
  sirket_adi: string;
}

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  sellers: Seller[];
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProductVariant {
  type: string;
  value: string;
  price: number;
  stock: number;
}

export function ProductForm({ product, categories, sellers, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    ad: '',
    aciklama: '',
    kisa_aciklama: '',
    fiyat: '',
    indirimli_fiyat: '',
    stok_miktari: '',
    minimum_stok: '',
    birim: 'adet',
    durum: 'aktif',
    satici_id: '',
    kategori_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    type: '',
    value: '',
    price: 0,
    stock: 0
  });

  // Form verilerini doldur
  useEffect(() => {
    if (product) {
      setFormData({
        ad: product.ad || '',
        aciklama: product.aciklama || '',
        kisa_aciklama: product.kisa_aciklama || '',
        fiyat: product.fiyat?.toString() || '',
        indirimli_fiyat: product.indirimli_fiyat?.toString() || '',
        stok_miktari: product.stok_miktari?.toString() || '',
        minimum_stok: product.minimum_stok?.toString() || '',
        birim: product.birim || 'adet',
        durum: product.durum || 'aktif',
        satici_id: product.satici_id?.toString() || '',
        kategori_id: product.kategori_id?.toString() || ''
      });
    }
  }, [product]);

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.ad.trim()) {
      toast.error('Ürün adı zorunludur');
      return;
    }
    if (!formData.fiyat || parseFloat(formData.fiyat) <= 0) {
      toast.error('Geçerli bir fiyat giriniz');
      return;
    }
    if (!formData.satici_id) {
      toast.error('Satıcı seçimi zorunludur');
      return;
    }
    if (!formData.kategori_id) {
      toast.error('Kategori seçimi zorunludur');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        fiyat: parseFloat(formData.fiyat),
        indirimli_fiyat: formData.indirimli_fiyat ? parseFloat(formData.indirimli_fiyat) : null,
        stok_miktari: parseInt(formData.stok_miktari) || 0,
        minimum_stok: parseInt(formData.minimum_stok) || 0,
        satici_id: parseInt(formData.satici_id),
        kategori_id: parseInt(formData.kategori_id)
      };

      if (product) {
        await api.put(`/urunler?id=${product.id}`, submitData);
        toast.success('Ürün başarıyla güncellendi');
      } else {
        await api.post('/urunler', submitData);
        toast.success('Ürün başarıyla eklendi');
      }
      
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`İşlem başarısız: ${error.message}`);
      } else {
        toast.error('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Görüntü yükleme
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 görüntü
  };

  // Görüntü kaldırma
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Varyant ekleme
  const addVariant = () => {
    if (!newVariant.type || !newVariant.value) {
      toast.error('Varyant tipi ve değeri zorunludur');
      return;
    }
    
    setVariants(prev => [...prev, { ...newVariant }]);
    setNewVariant({ type: '', value: '', price: 0, stock: 0 });
  };

  // Varyant kaldırma
  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Fiyat formatlama
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol Kolon */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ad">Ürün Adı *</Label>
                <Input
                  id="ad"
                  value={formData.ad}
                  onChange={(e) => setFormData(prev => ({ ...prev, ad: e.target.value }))}
                  placeholder="Ürün adını giriniz"
                  required
                />
              </div>

              <div>
                <Label htmlFor="kisa_aciklama">Kısa Açıklama</Label>
                <Textarea
                  id="kisa_aciklama"
                  value={formData.kisa_aciklama}
                  onChange={(e) => setFormData(prev => ({ ...prev, kisa_aciklama: e.target.value }))}
                  placeholder="Ürünün kısa açıklaması"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="aciklama">Detaylı Açıklama</Label>
                <Textarea
                  id="aciklama"
                  value={formData.aciklama}
                  onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
                  placeholder="Ürünün detaylı açıklaması"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fiyat Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fiyat">Fiyat (₺) *</Label>
                  <Input
                    id="fiyat"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fiyat}
                    onChange={(e) => setFormData(prev => ({ ...prev, fiyat: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="indirimli_fiyat">İndirimli Fiyat (₺)</Label>
                  <Input
                    id="indirimli_fiyat"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.indirimli_fiyat}
                    onChange={(e) => setFormData(prev => ({ ...prev, indirimli_fiyat: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              {formData.fiyat && formData.indirimli_fiyat && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    İndirim Oranı: %{Math.round(((parseFloat(formData.fiyat) - parseFloat(formData.indirimli_fiyat)) / parseFloat(formData.fiyat)) * 100)}
                  </p>
                  <p className="text-sm text-green-600">
                    Tasarruf: {formatPrice(parseFloat(formData.fiyat) - parseFloat(formData.indirimli_fiyat))}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kategori ve Satıcı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="satici_id">Satıcı Seç *</Label>
                <Select value={formData.satici_id} onValueChange={(value) => setFormData(prev => ({ ...prev, satici_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Satıcı seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id.toString()}>
                        {seller.sirket_adi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="kategori_id">Kategori Seç *</Label>
                <Select value={formData.kategori_id} onValueChange={(value) => setFormData(prev => ({ ...prev, kategori_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.ad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stok ve Durum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stok_miktari">Stok Miktarı</Label>
                  <Input
                    id="stok_miktari"
                    type="number"
                    min="0"
                    value={formData.stok_miktari}
                    onChange={(e) => setFormData(prev => ({ ...prev, stok_miktari: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="minimum_stok">Minimum Stok</Label>
                  <Input
                    id="minimum_stok"
                    type="number"
                    min="0"
                    value={formData.minimum_stok}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimum_stok: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birim">Birim</Label>
                  <Select value={formData.birim} onValueChange={(value) => setFormData(prev => ({ ...prev, birim: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adet">Adet</SelectItem>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="gr">Gram</SelectItem>
                      <SelectItem value="lt">Litre</SelectItem>
                      <SelectItem value="ml">Mililitre</SelectItem>
                      <SelectItem value="paket">Paket</SelectItem>
                      <SelectItem value="kutu">Kutu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="durum">Durum</Label>
                  <Select value={formData.durum} onValueChange={(value) => setFormData(prev => ({ ...prev, durum: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="beklemede">Beklemede</SelectItem>
                      <SelectItem value="pasif">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.stok_miktari && formData.minimum_stok && (
                <div className={`p-3 rounded-lg ${
                  parseInt(formData.stok_miktari) <= parseInt(formData.minimum_stok) 
                    ? 'bg-red-50' 
                    : 'bg-green-50'
                }`}>
                  <p className={`text-sm ${
                    parseInt(formData.stok_miktari) <= parseInt(formData.minimum_stok) 
                      ? 'text-red-800' 
                      : 'text-green-800'
                  }`}>
                    {parseInt(formData.stok_miktari) <= parseInt(formData.minimum_stok) 
                      ? '⚠️ Stok seviyesi minimum stokun altında!' 
                      : '✅ Stok seviyesi yeterli'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Görüntü Yükleme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ürün Görselleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Görüntü yüklemek için tıklayın</span>
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, JPEG (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* Yüklenen Görüntüler */}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Ürün görseli ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {index === 0 && (
                    <Badge className="absolute bottom-1 left-1 text-xs">
                      Ana Görsel
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ürün Varyantları */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ürün Varyantları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mevcut Varyantlar */}
          {variants.length > 0 && (
            <div className="space-y-2">
              {variants.map((variant, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{variant.type}</Badge>
                    <span className="font-medium">{variant.value}</span>
                    {variant.price > 0 && (
                      <span className="text-sm text-muted-foreground">
                        +{formatPrice(variant.price)}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Stok: {variant.stock}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Yeni Varyant Ekleme */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Select 
              value={newVariant.type} 
              onValueChange={(value) => setNewVariant(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renk">Renk</SelectItem>
                <SelectItem value="beden">Beden</SelectItem>
                <SelectItem value="numara">Numara</SelectItem>
                <SelectItem value="boyut">Boyut</SelectItem>
                <SelectItem value="model">Model</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Değer"
              value={newVariant.value}
              onChange={(e) => setNewVariant(prev => ({ ...prev, value: e.target.value }))}
            />
            
            <Input
              type="number"
              placeholder="Ek Fiyat"
              value={newVariant.price}
              onChange={(e) => setNewVariant(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            />
            
            <Input
              type="number"
              placeholder="Stok"
              value={newVariant.stock}
              onChange={(e) => setNewVariant(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
            />
            
            <Button type="button" onClick={addVariant}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Butonları */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : (product ? 'Güncelle' : 'Kaydet')}
        </Button>
      </div>
    </form>
  );
}
