# Kurye Kazanç & Ödeme Planı Sistemi

Kurye kazançlarını hesaplayan ve haftalık ödeme raporları üreten kapsamlı mikroservis. Teslimat başı ücret, kilometre başı ücret ve pik saat bonuslarını otomatik olarak hesaplayarak detaylı ödeme dökümleri oluşturur.

## 🎯 **Temel Özellikler**

### **Tarife Motoru**
- **Teslimat Başı Sabit Ücret**: Araç tipine göre değişken temel ücret
- **Kilometre Bazlı Ücret**: Mesafe tabanlı değişken ücretlendirme
- **Pik Saat Bonusları**: Öğle (12:00-14:00) ve akşam (19:00-21:00) bonus ödemeleri
- **Araç Tipi Çarpanları**: Yürüyerek (1.0x), Bisiklet (1.1x), Motosiklet (1.2x), Araba (1.3x)

### **Ödeme Sistemi**
- **Haftalık Ödeme Döngüsü**: Pazartesi sabahları otomatik ödeme hesaplama
- **Minimum Ödeme Tutarı**: 50 TRY altındaki ödemeler bir sonraki döneme aktarılır
- **Event Tetikleme**: `courier.payout.generated` event'i ile ödeme sürecini başlatma
- **Bulk İşlemler**: Tüm kuryeler için toplu ödeme hesaplama

## 💰 **Kazanç Hesaplama Sistemi**

### **Hesaplama Bileşenleri**
1. **Temel Ücret**: Teslimat başı sabit ücret (8 TRY varsayılan)
2. **Mesafe Ücreti**: Kilometre başı değişken ücret (1.5 TRY/km varsayılan)
3. **Pik Saat Bonusu**: Yoğun saatlerde %25 bonus
4. **Araç Bonusu**: Araç tipine göre ek ücret
5. **Express Bonus**: Express teslimatlar için %50 ek ücret

### **Örnek Hesaplama**
```
Teslimat: 3.5 km, Motosiklet, Pik Saat (13:30)
- Temel Ücret: 8.00 TRY
- Mesafe Ücreti: 3.5 km × 1.5 TRY = 5.25 TRY
- Araç Bonusu: (8.00 + 5.25) × 0.2 = 2.65 TRY
- Pik Saat Bonusu: (8.00 + 5.25 + 2.65) × 0.25 = 3.98 TRY
- Toplam Kazanç: 19.88 TRY
```

## 📊 **API Endpoints**

### **Kazanç Hesaplama**
- **`POST /api/v1/payout/calculate`**: Belirli dönem için kazanç hesaplama
- **`POST /api/v1/payout/weekly/{courierId}`**: Haftalık ödeme hesaplama
- **`POST /api/v1/payout/bulk`**: Toplu ödeme hesaplama

### **Rapor Üretimi**
- **`POST /api/v1/reports/generate`**: PDF/CSV rapor oluşturma
- **`GET /api/v1/earnings/{courierId}`**: Kazanç geçmişi sorgulama
- **`GET /api/v1/payouts/{courierId}`**: Ödeme geçmişi sorgulama

### **Tarife Yönetimi**
- **`POST /api/v1/tariffs`**: Yeni tarife oranı oluşturma
- **`PUT /api/v1/tariffs/{id}`**: Tarife oranı güncelleme

## 🔄 **Event Mimarisi**

### **Kafka Entegrasyonu**
- **Dinlenen Event**: `order.delivered` - Teslimat tamamlandığında
- **Yayınlanan Event**: `courier.payout.generated` - Ödeme hesaplandığında

### **Event İşleme Süreci**
1. `order.delivered` event'i alınır
2. Teslimat verileri parse edilir ve doğrulanır
3. Kazanç hesaplaması yapılır ve veritabanına kaydedilir
4. Ödeme dönemi kontrolü yapılır
5. Gerekirse `courier.payout.generated` event'i yayınlanır

## 📄 **Rapor Sistemi**

### **PDF Raporları**
- **Puppeteer**: Yüksek kaliteli PDF oluşturma
- **Handlebars Templates**: Esnek rapor şablonları
- **Türkçe Lokalizasyon**: Tam Türkçe dil desteği
- **Detaylı Breakdown**: Günlük, saatlik ve teslimat bazlı analiz

### **CSV Export**
- **Veri Analizi**: Excel uyumlu CSV formatı
- **Detaylı Veriler**: Tüm hesaplama detayları
- **Filtreleme**: Tarih ve kurye bazlı filtreleme

## 🗄 **Veritabanı Şeması**

### **Temel Tablolar**

**tariff_rates**: Tarife oranları ve kuralları
- Araç tipi ve bölge bazlı tarife yapılandırması
- Etkili tarih aralıkları ile versiyonlama
- Minimum/maksimum kazanç limitleri

**courier_earnings**: Teslimat bazlı kazanç hesaplamaları
- Her teslimat için detaylı kazanç breakdown'u
- JSONB ile esnek hesaplama detayları
- Audit trail için değişmez kayıtlar

**courier_payouts**: Haftalık ödeme kayıtları
- Dönemsel ödeme özetleri
- Rapor dosya yolları
- İşlem durumu takibi

**earnings_audit**: Kazanç hesaplama audit kayıtları
- Tüm kazanç işlemlerinin izlenebilirliği
- Değişiklik geçmişi
- Admin müdahale kayıtları

## ⚡ **Performans Özellikleri**

### **Optimizasyon Stratejileri**
- **Batch Processing**: 10'lu gruplar halinde teslimat işleme
- **Database Indexing**: Kurye ve tarih bazlı hızlı sorgular
- **JSONB Indexing**: Hesaplama detayları için optimize edilmiş
- **Connection Pooling**: Veritabanı bağlantı optimizasyonu

### **Ölçeklenebilirlik**
- **Kafka Consumer**: Yüksek throughput event işleme
- **Concurrent Processing**: Paralel kazanç hesaplaması
- **Memory Management**: Efficient resource utilization
- **Error Recovery**: Robust error handling and retry logic

## 🧪 **Test Senaryoları**

### **Kazanç Hesaplama Testleri**
- ✅ Temel ücret hesaplama doğruluğu
- ✅ Mesafe bazlı ücret hesaplama
- ✅ Pik saat bonus hesaplama
- ✅ Araç tipi bonus hesaplama
- ✅ Express teslimat bonus hesaplama
- ✅ Minimum/maksimum limit kontrolü

### **Tarife Motor Testleri**
- ✅ Araç tipi bazlı tarife seçimi
- ✅ Bölgesel tarife uygulaması
- ✅ Tarih aralığı geçerliliği
- ✅ Varsayılan tarife fallback'i
- ✅ Pik saat tespiti doğruluğu

### **Ödeme Döngüsü Testleri**
- ✅ Haftalık ödeme hesaplama
- ✅ Minimum tutar kontrolü
- ✅ Toplu ödeme işleme
- ✅ Rapor oluşturma doğruluğu
- ✅ Event yayınlama

## 🚀 **Kurulum ve Çalıştırma**

### **Geliştirme Ortamı**
```bash
# Bağımlılıkları yükle
npm install

# Çevre değişkenlerini kopyala
cp .env.example .env

# Veritabanı migration'larını çalıştır
# (PostgreSQL'de migration'lar manuel olarak çalıştırılmalı)

# Geliştirme sunucusunu başlat
npm run dev
```

### **Rapor Oluşturma**
```bash
# Tüm kuryeler için geçen hafta raporu
npm run generate-reports

# Belirli hafta için rapor
npm run generate-reports -- --week=2025-01-13

# Belirli kurye için rapor
npm run generate-reports -- --courier=123e4567-e89b-12d3-a456-426614174000
```

### **Docker Deployment**
```bash
# Docker image oluştur
docker build -t courier-earnings-service .

# Container çalıştır
docker run -p 8011:8011 \
  -e DATABASE_URL=postgres://... \
  -e KAFKA_BROKERS=kafka:9092 \
  courier-earnings-service
```

## 📈 **Monitoring & Analytics**

### **Performans Metrikleri**
- Kazanç hesaplama süresi
- Rapor oluşturma performansı
- Event işleme gecikmesi
- Veritabanı sorgu performansı

### **İş Metrikleri**
- Toplam kurye kazançları
- Ortalama teslimat başı kazanç
- Pik saat kullanım oranları
- Bölgesel kazanç dağılımı

### **Audit & Compliance**
- Tüm kazanç hesaplamaları loglanır
- Tarife değişiklikleri izlenir
- Ödeme işlemleri audit edilir
- Finansal raporlama için veri sağlanır

Bu Kurye Kazanç & Ödeme Sistemi, kurye operasyonlarının finansal yönetimini otomatikleştirerek şeffaf, adil ve güvenilir bir ödeme süreci sağlar. Sistem hem kuryeler hem de operasyon ekibi için detaylı kazanç analizi ve raporlama imkanı sunar.