
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  X,
  Package,
  DollarSign,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { createProduct } from '@/store/slices/productsSlice';
import { toast } from 'sonner';

interface ProductWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductFormData {
  name: string;
  category_id: number;
  brand: string;
  model: string;
  barcode: string;
  sku: string;
  price: number;
  compare_price: number;
  stock_quantity: number;
  min_stock_level: number;
  weight: number;
  images: string[];
  short_description: string;
  description: string;
  attributes: Record<string, string>;
}

const initialFormData: ProductFormData = {
  name: '',
  category_id: 0,
  brand: '',
  model: '',
  barcode: '',
  sku: '',
  price: 0,
  compare_price: 0,
  stock_quantity: 0,
  min_stock_level: 5,
  weight: 0,
  images: [],
  short_description: '',
  description: '',
  attributes: {},
};

export function ProductWizard({ onClose, onSuccess }: ProductWizardProps) {
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Temel Bilgiler', icon: Package },
    { id: 2, title: 'Fiyat & Stok', icon: DollarSign },
    { id: 3, title: 'Görseller', icon: ImageIcon },
    { id: 4, title: 'Açıklamalar', icon: FileText },
  ];

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSKU = () => {
    const sku = `${formData.brand.slice(0, 3).toUpperCase()}-${formData.model.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    updateFormData('sku', sku);
  };

  const addImage = (url: string) => {
    if (formData.images.length < 10) {
      updateFormData('images', [...formData.images, url]);
    }
  };

  const removeImage = (index: number) => {
    updateFormData('images', formData.images.filter((_, i) => i !== index));
  };

  const addAttribute = (key: string, value: string) => {
    updateFormData('attributes', { ...formData.attributes, [key]: value });
  };

  const removeAttribute = (key: string) => {
    const newAttributes = { ...formData.attributes };
    delete newAttributes[key];
    updateFormData('attributes', newAttributes);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.category_id && formData.sku;
      case 2:
        return formData.price > 0 && formData.stock_quantity >= 0;
      case 3:
        return formData.images.length >= 1;
      case 4:
        return formData.short_description && formData.description;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Lütfen gerekli alanları doldurun');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      await dispatch(createProduct({
        ...formData,
        vendor_id: 1, // Mock vendor ID
        approval_status: 'pending',
        is_active: false,
      })).unwrap();
      
      toast.success('Ürün başarıyla eklendi! Admin onayından sonra yayınlanacak.');
      onSuccess();
    } catch (error) {
      toast.error('Ürün eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Ürün Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Ürün adını girin"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marka</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => updateFormData('brand', e.target.value)}
                  placeholder="Marka adı"
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => updateFormData('model', e.target.value)}
                  placeholder="Model adı"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="barcode">Barkod</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => updateFormData('barcode', e.target.value)}
                  placeholder="Ürün barkodu"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => updateFormData('sku', e.target.value)}
                    placeholder="Stok kodu"
                  />
                  <Button type="button" variant="outline" onClick={generateSKU}>
                    Oluştur
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="category">Kategori *</Label>
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => updateFormData('category_id', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value={0}>Kategori seçin</option>
                <option value={1}>Elektronik</option>
                <option value={2}>Moda</option>
                <option value={3}>Ev & Yaşam</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Satış Fiyatı (₺) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="compare_price">Karşılaştırma Fiyatı (₺)</Label>
                <Input
                  id="compare_price"
                  type="number"
                  value={formData.compare_price}
                  onChange={(e) => updateFormData('compare_price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock_quantity">Stok Adedi *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => updateFormData('stock_quantity', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="min_stock_level">Minimum Stok Seviyesi</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  value={formData.min_stock_level}
                  onChange={(e) => updateFormData('min_stock_level', parseInt(e.target.value) || 0)}
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="weight">Ağırlık (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Ürün Görselleri (En az 1, en fazla 10)</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                JPG, PNG formatında, maksimum 5MB boyutunda olmalıdır.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Görselleri sürükleyip bırakın veya tıklayın
                </p>
                <Input
                  type="url"
                  placeholder="Veya görsel URL'si girin"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const url = (e.target as HTMLInputElement).value;
                      if (url) {
                        addImage(url);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>

            {formData.images.length > 0 && (
              <div>
                <Label>Yüklenen Görseller</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Ürün görseli ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs">
                          Ana Görsel
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="short_description">Kısa Açıklama *</Label>
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) => updateFormData('short_description', e.target.value)}
                placeholder="Ürününüzün kısa açıklaması (160 karakter)"
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.short_description.length}/160 karakter
              </p>
            </div>

            <div>
              <Label htmlFor="description">Detaylı Açıklama *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Ürününüzün detaylı açıklaması, özellikleri, kullanım alanları..."
                rows={6}
              />
            </div>

            <div>
              <Label>Ürün Özellikleri</Label>
              <div className="space-y-2">
                {Object.entries(formData.attributes).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <Input value={key} readOnly className="flex-1" />
                    <Input value={value} readOnly className="flex-1" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeAttribute(key)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Özellik adı (ör: Renk)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const key = (e.target as HTMLInputElement).value;
                        const valueInput = (e.target as HTMLInputElement).parentElement?.children[1] as HTMLInputElement;
                        const value = valueInput?.value;
                        if (key && value) {
                          addAttribute(key, value);
                          (e.target as HTMLInputElement).value = '';
                          valueInput.value = '';
                        }
                      }
                    }}
                  />
                  <Input
                    placeholder="Değer (ör: Siyah)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        const keyInput = (e.target as HTMLInputElement).parentElement?.children[0] as HTMLInputElement;
                        const key = keyInput?.value;
                        if (key && value) {
                          addAttribute(key, value);
                          keyInput.value = '';
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Özellik eklemek için her iki alanı doldurup Enter'a basın
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Ürün Ekle</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500 to-red-500 text-white' 
                    : isCompleted
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Önceki
          </Button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Adım {currentStep} / {steps.length}
          </div>

          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Sonraki
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-red-500 text-white"
            >
              {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
