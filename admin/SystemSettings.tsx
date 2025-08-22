
'use client';

import { useState, useEffect } from 'react';
import { Save, Settings, Globe, CreditCard, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { queries } from '@/lib/database/queries';

export function SystemSettings() {
  const [settings, setSettings] = useState<any>({});
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const systemSettings = queries.system.getSettings();
    const payments = queries.system.getPaymentMethods();
    const shipping = queries.system.getShippingMethods();
    
    setSettings(systemSettings);
    setPaymentMethods(payments);
    setShippingMethods(shipping);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    alert('Ayarlar başarıyla kaydedildi!');
  };

  const generalSettings = [
    { key: 'platform_name', label: 'Platform Adı', value: settings.platform_name || 'cebeuygun.com' },
    { key: 'default_currency', label: 'Varsayılan Para Birimi', value: settings.default_currency || 'TRY' },
    { key: 'min_order_amount', label: 'Minimum Sipariş Tutarı (₺)', value: settings.min_order_amount || '25' },
    { key: 'free_delivery_threshold', label: 'Ücretsiz Kargo Limiti (₺)', value: settings.free_delivery_threshold || '100' },
    { key: 'express_delivery_time', label: 'Hızlı Teslimat Süresi (dk)', value: settings.express_delivery_time || '30' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h2>
          <p className="text-gray-600">Platform ayarlarını yönetin</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="payment">Ödeme</TabsTrigger>
          <TabsTrigger value="shipping">Kargo</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Genel Ayarlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generalSettings.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <Label htmlFor={setting.key}>{setting.label}</Label>
                    <Input
                      id={setting.key}
                      value={setting.value}
                      onChange={(e) => setSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Platform Özellikleri</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Yeni Kullanıcı Kayıtları</Label>
                      <p className="text-sm text-gray-500">Yeni kullanıcıların kayıt olmasına izin ver</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Misafir Alışverişi</Label>
                      <p className="text-sm text-gray-500">Kayıt olmadan alışveriş yapılabilsin</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Ürün İncelemeleri</Label>
                      <p className="text-sm text-gray-500">Müşterilerin ürün incelemesi yazmasına izin ver</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Otomatik Ürün Onayı</Label>
                      <p className="text-sm text-gray-500">Satıcı ürünleri otomatik olarak onaylansın</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ödeme Yöntemleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-gray-500">
                          {method.type === 'credit_card' ? 'Kredi Kartı' : 
                           method.type === 'cash_on_delivery' ? 'Kapıda Ödeme' : method.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {method.is_active ? (
                        <Badge className="bg-green-500">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary">Pasif</Badge>
                      )}
                      <Switch defaultChecked={method.is_active} />
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium">Ödeme Ayarları</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Komisyon Oranı (%)</Label>
                    <Input defaultValue="2.5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Sabit Komisyon (₺)</Label>
                    <Input defaultValue="0.50" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Kargo Yöntemleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shippingMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Truck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">₺{method.base_cost}</p>
                        <p className="text-sm text-gray-500">
                          {method.estimated_delivery_time_min}-{method.estimated_delivery_time_max} dk
                        </p>
                      </div>
                      {method.is_active ? (
                        <Badge className="bg-green-500">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary">Pasif</Badge>
                      )}
                      <Switch defaultChecked={method.is_active} />
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium">Teslimat Ayarları</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maksimum Teslimat Mesafesi (km)</Label>
                    <Input defaultValue="15" />
                  </div>
                  <div className="space-y-2">
                    <Label>Teslimat Ücreti (₺/km)</Label>
                    <Input defaultValue="0.50" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Güvenlik Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>İki Faktörlü Kimlik Doğrulama</Label>
                    <p className="text-sm text-gray-500">Admin hesapları için 2FA zorunlu olsun</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Şifre Karmaşıklığı</Label>
                    <p className="text-sm text-gray-500">Güçlü şifre kuralları uygulansın</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Oturum Zaman Aşımı</Label>
                    <p className="text-sm text-gray-500">Belirli süre sonra otomatik çıkış yapılsın</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>IP Kısıtlaması</Label>
                    <p className="text-sm text-gray-500">Admin paneline IP bazlı erişim kısıtlaması</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Güvenlik Parametreleri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Oturum Süresi (dakika)</Label>
                    <Input defaultValue="60" />
                  </div>
                  <div className="space-y-2">
                    <Label>Maksimum Giriş Denemesi</Label>
                    <Input defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Hesap Kilitleme Süresi (dakika)</Label>
                    <Input defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Şifre Geçerlilik Süresi (gün)</Label>
                    <Input defaultValue="90" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Veri Koruma</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Veri Şifreleme</Label>
                      <p className="text-sm text-gray-500">Hassas veriler şifrelensin</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Otomatik Yedekleme</Label>
                      <p className="text-sm text-gray-500">Günlük otomatik veri yedeklemesi</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Aktivite Logları</Label>
                      <p className="text-sm text-gray-500">Tüm kullanıcı aktiviteleri kayıt edilsin</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
