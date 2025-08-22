
# Cebeuygun.com Admin Panel

Bu dokümantasyon, Cebeuygun.com platformunun admin paneli hakkında detaylı bilgi içermektedir.

## 🎨 Renk Teması

Platform turkuaz ve kırmızı renk temasını kullanmaktadır:
- **Primary (Turkuaz)**: `oklch(0.55 0.12 195)` - Ana renkler için
- **Destructive (Kırmızı)**: `oklch(0.55 0.22 15)` - Uyarı ve hata durumları için

## 🔐 Admin Panel Erişimi

Admin paneline erişim URL'si: `/admin-secret-2026`

## 📊 Ana Özellikler

### 1. Ürün ve Kategori Yönetimi
- **Ürün Listesi**: Tüm ürünlerin görüntülenmesi ve yönetimi
- **Gelişmiş Filtreleme**: Kategori, satıcı, durum bazlı filtreleme
- **Hızlı Arama**: Ürün adı ile anlık arama
- **Durum Yönetimi**: Aktif, beklemede, pasif durumları
- **Stok Takibi**: Az stok uyarıları ve stok durumu gösterimi
- **Fiyat Yönetimi**: Normal ve indirimli fiyat desteği
- **Varyant Desteği**: Renk, beden, numara vb. varyantlar

### 2. Kategori Yönetimi
- **Hiyerarşik Yapı**: Ana kategori > Alt kategori sistemi
- **Sürükle-Bırak**: Kategori sıralaması
- **Toplu İşlemler**: Çoklu kategori düzenleme

### 3. AI Destekli Moderasyon
- **İçerik Moderasyonu**: Ürün açıklamaları ve görsellerin otomatik kontrolü
- **Spam Tespiti**: Yorum ve içeriklerde spam tespiti
- **Güven Skoru**: Her moderasyon için güvenilirlik puanı
- **Manuel Onay**: Düşük güven skorlu içeriklerin manuel kontrolü

### 4. Toplu İşlemler
- **CSV/Excel İçe Aktarma**: Toplu ürün ekleme
- **XML/JSON Desteği**: Kategori yapısı içe aktarma
- **Stok Güncelleme**: Toplu stok miktarı güncelleme
- **Dışa Aktarma**: Ürün ve kategori verilerini dışa aktarma
- **İşlem Takibi**: Toplu işlem durumu ve başarı oranları

### 5. İstatistikler ve Raporlama
- **Gerçek Zamanlı İstatistikler**: Ürün, stok, durum sayıları
- **Performans Metrikleri**: AI moderasyon başarı oranları
- **İşlem Geçmişi**: Tüm admin işlemlerinin loglanması

## 🗄️ Veritabanı Yapısı

### Temel Tablolar
- `kullanicilar`: Kullanıcı bilgileri
- `admin_kullanicilari`: Admin yetkileri
- `saticilar`: Satıcı bilgileri
- `urun_kategorileri`: Hiyerarşik kategori yapısı
- `urunler`: Ürün bilgileri
- `urun_varyantlari`: Ürün varyantları
- `urun_resimleri`: Ürün görselleri
- `siparisler`: Sipariş bilgileri
- `ai_moderasyon_sonuclari`: AI moderasyon sonuçları
- `toplu_islem_loglari`: Toplu işlem kayıtları

### Örnek Veriler
Sistem örnek verilerle doldurulmuştur:
- 7 kullanıcı (1 admin, 4 satıcı, 2 müşteri)
- 4 satıcı (Elektronik, Restoran, Market, Giyim)
- 23 kategori (hiyerarşik yapıda)
- 19 ürün (farklı kategorilerde)
- 4 sipariş (farklı durumlar)
- AI moderasyon sonuçları
- Toplu işlem örnekleri

## 🔧 Teknik Detaylar

### Frontend
- **Next.js 15**: App Router kullanımı
- **TypeScript**: Tip güvenliği
- **Tailwind CSS**: Styling
- **Shadcn/UI**: Komponent kütüphanesi
- **Lucide React**: İkonlar

### Backend
- **Next.js API Routes**: RESTful API
- **PostgreSQL**: Veritabanı
- **PostgREST**: Veritabanı API katmanı

### Özellikler
- **Responsive Design**: Mobil uyumlu tasarım
- **Dark/Light Mode**: Tema desteği
- **Real-time Updates**: Anlık güncellemeler
- **Error Handling**: Kapsamlı hata yönetimi
- **Loading States**: Yükleme durumları
- **Toast Notifications**: Kullanıcı bildirimleri

## 🚀 Kurulum ve Çalıştırma

1. **Bağımlılıkları yükleyin**:
   ```bash
   pnpm install
   ```

2. **Veritabanını hazırlayın**:
   - PostgreSQL veritabanı oluşturun
   - `src/data/sample-data.sql` dosyasını çalıştırın

3. **Ortam değişkenlerini ayarlayın**:
   ```env
   POSTGREST_URL=your_postgrest_url
   POSTGREST_SCHEMA=public
   POSTGREST_API_KEY=your_api_key
   ```

4. **Uygulamayı çalıştırın**:
   ```bash
   pnpm dev
   ```

5. **Admin paneline erişin**:
   `http://localhost:3000/admin-secret-2026`

## 📱 Mobil Uyumluluk

Admin panel mobil cihazlarda da kullanılabilir:
- Responsive tasarım
- Touch-friendly arayüz
- Mobil menü sistemi
- Optimized table görünümü

## 🔒 Güvenlik

- Admin panel özel URL ile korunmaktadır
- Rol tabanlı erişim kontrolü
- API endpoint'leri korunmaktadır
- Input validasyonu
- XSS koruması

## 📈 Performans

- Lazy loading
- Optimized queries
- Caching strategies
- Image optimization
- Bundle optimization

## 🎯 Gelecek Özellikler

- [ ] Gelişmiş raporlama
- [ ] Grafik ve chart'lar
- [ ] Email bildirimleri
- [ ] Webhook entegrasyonları
- [ ] API rate limiting
- [ ] Audit logging
- [ ] Multi-language support
- [ ] Advanced search filters
