
-- Cebeuygun.com Örnek Veri Seti
-- Bu dosya veritabanına örnek veriler eklemek için kullanılır

-- Kullanıcılar (Admin ve normal kullanıcılar)
INSERT INTO kullanicilar (email, telefon, sifre_hash, ad, soyad, durum, email_dogrulandi, telefon_dogrulandi) VALUES
('admin@cebeuygun.com', '+905551234567', '$2b$10$example_hash_admin', 'Admin', 'Kullanıcı', 'aktif', true, true),
('satici1@example.com', '+905551234568', '$2b$10$example_hash_1', 'Ahmet', 'Yılmaz', 'aktif', true, true),
('satici2@example.com', '+905551234569', '$2b$10$example_hash_2', 'Mehmet', 'Kaya', 'aktif', true, true),
('satici3@example.com', '+905551234570', '$2b$10$example_hash_3', 'Ayşe', 'Demir', 'aktif', true, true),
('satici4@example.com', '+905551234571', '$2b$10$example_hash_4', 'Fatma', 'Çelik', 'aktif', true, true),
('musteri1@example.com', '+905551234572', '$2b$10$example_hash_5', 'Ali', 'Özkan', 'aktif', true, true),
('musteri2@example.com', '+905551234573', '$2b$10$example_hash_6', 'Zeynep', 'Arslan', 'aktif', true, true);

-- Admin Kullanıcıları
INSERT INTO admin_kullanicilari (kullanici_id, rol, yetkiler, durum) VALUES
(1, 'super_admin', '{"urun_yonetimi": true, "kategori_yonetimi": true, "satici_yonetimi": true, "siparis_yonetimi": true, "raporlama": true, "sistem_ayarlari": true}', 'aktif');

-- Satıcılar
INSERT INTO saticilar (kullanici_id, sirket_adi, vergi_no, kategori, durum, performans_puani, komisyon_orani, minimum_siparis_tutari, teslimat_suresi_dk, aciklama) VALUES
(2, 'TechWorld Elektronik', '1234567890', 'genel', 'aktif', 4.8, 8.5, 100.00, 120, 'Elektronik ürünlerde uzman mağaza'),
(3, 'Lezzet Durağı Restaurant', '2345678901', 'restoran', 'aktif', 4.6, 12.0, 35.00, 45, 'Geleneksel Türk mutfağı'),
(4, 'Hızlı Market Express', '3456789012', 'market', 'aktif', 4.9, 15.0, 25.00, 15, '15 dakikada teslim hızlı market'),
(5, 'Moda Dünyası Butik', '4567890123', 'genel', 'beklemede', 0.0, 10.0, 150.00, 180, 'Kadın ve erkek giyim mağazası');

-- Restoranlar
INSERT INTO restoranlar (satici_id, mutfak_tipi, minimum_siparis_tutari, ortalama_hazirlama_suresi, kapasitesi, hijyen_puani, teslimat_bolgesi) VALUES
(3, 'Türk Mutfağı', 35.00, 30, 150, 4.8, '{"sehirler": ["İstanbul", "Ankara"], "ilceler": ["Kadıköy", "Beşiktaş", "Çankaya"]}');

-- Marketler
INSERT INTO marketler (satici_id, market_tipi, depo_kapasitesi, soguk_zincir, teslimat_suresi_dk, teslimat_bolgesi) VALUES
(4, 'hizli_market', 5000, true, 15, '{"sehirler": ["İstanbul"], "ilceler": ["Kadıköy", "Üsküdar", "Beşiktaş"]}');

-- Ürün Kategorileri (Hiyerarşik)
INSERT INTO urun_kategorileri (parent_id, ad, slug, aciklama, sira_no, aktif) VALUES
-- Ana Kategoriler
(NULL, 'Elektronik', 'elektronik', 'Teknoloji ürünleri ve elektronik cihazlar', 1, true),
(NULL, 'Giyim & Aksesuar', 'giyim-aksesuar', 'Kadın, erkek ve çocuk giyim ürünleri', 2, true),
(NULL, 'Ev & Yaşam', 'ev-yasam', 'Ev dekorasyonu ve yaşam ürünleri', 3, true),
(NULL, 'Yemek & İçecek', 'yemek-icecek', 'Gıda ürünleri ve içecekler', 4, true),
(NULL, 'Sağlık & Kişisel Bakım', 'saglik-kisisel-bakim', 'Sağlık ve kişisel bakım ürünleri', 5, true),
(NULL, 'Spor & Outdoor', 'spor-outdoor', 'Spor malzemeleri ve outdoor ürünleri', 6, true),

-- Alt Kategoriler - Elektronik
(1, 'Telefon & Tablet', 'telefon-tablet', 'Akıllı telefonlar ve tabletler', 1, true),
(1, 'Bilgisayar', 'bilgisayar', 'Laptop, masaüstü ve bilgisayar aksesuarları', 2, true),
(1, 'TV & Ses Sistemleri', 'tv-ses-sistemleri', 'Televizyon ve ses sistemleri', 3, true),
(1, 'Beyaz Eşya', 'beyaz-esya', 'Buzdolabı, çamaşır makinesi vb.', 4, true),

-- Alt Kategoriler - Giyim
(2, 'Kadın Giyim', 'kadin-giyim', 'Kadın giyim ürünleri', 1, true),
(2, 'Erkek Giyim', 'erkek-giyim', 'Erkek giyim ürünleri', 2, true),
(2, 'Çocuk Giyim', 'cocuk-giyim', 'Çocuk giyim ürünleri', 3, true),
(2, 'Ayakkabı', 'ayakkabi', 'Kadın, erkek ve çocuk ayakkabıları', 4, true),

-- Alt Kategoriler - Ev & Yaşam
(3, 'Mobilya', 'mobilya', 'Ev mobilyaları', 1, true),
(3, 'Dekorasyon', 'dekorasyon', 'Ev dekorasyon ürünleri', 2, true),
(3, 'Mutfak Gereçleri', 'mutfak-gerecleri', 'Mutfak araç gereçleri', 3, true),
(3, 'Banyo Ürünleri', 'banyo-urunleri', 'Banyo aksesuarları', 4, true),

-- Alt Kategoriler - Yemek & İçecek
(4, 'Temel Gıda', 'temel-gida', 'Temel gıda maddeleri', 1, true),
(4, 'Süt Ürünleri', 'sut-urunleri', 'Süt, peynir, yoğurt vb.', 2, true),
(4, 'Et & Tavuk', 'et-tavuk', 'Et ve tavuk ürünleri', 3, true),
(4, 'Meyve & Sebze', 'meyve-sebze', 'Taze meyve ve sebzeler', 4, true),
(4, 'İçecekler', 'icecekler', 'Soğuk ve sıcak içecekler', 5, true);

-- Ürünler
INSERT INTO urunler (satici_id, kategori_id, ad, slug, aciklama, kisa_aciklama, fiyat, indirimli_fiyat, stok_miktari, minimum_stok, birim, durum, sira_no) VALUES
-- Elektronik Ürünleri
(2, 7, 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 'Apple iPhone 15 Pro Max 256GB Doğal Titanyum. A17 Pro çip, ProRAW fotoğraf çekimi, 4K video kayıt.', 'Apple iPhone 15 Pro Max 256GB', 54999.00, 52999.00, 25, 5, 'adet', 'aktif', 1),
(2, 7, 'Samsung Galaxy S24 Ultra 512GB', 'samsung-galaxy-s24-ultra-512gb', 'Samsung Galaxy S24 Ultra 512GB. S Pen dahil, 200MP kamera, 5000mAh batarya.', 'Samsung Galaxy S24 Ultra 512GB', 49999.00, 47999.00, 18, 3, 'adet', 'aktif', 2),
(2, 8, 'MacBook Air M2 13" 256GB', 'macbook-air-m2-13-256gb', 'Apple MacBook Air 13" M2 çip 256GB SSD. 18 saate kadar pil ömrü, Liquid Retina ekran.', 'MacBook Air M2 13" 256GB', 24999.00, 23999.00, 12, 2, 'adet', 'aktif', 3),
(2, 8, 'ASUS ROG Strix G15 Gaming Laptop', 'asus-rog-strix-g15-gaming', 'ASUS ROG Strix G15 Gaming Laptop. AMD Ryzen 7, RTX 4060, 16GB RAM, 512GB SSD.', 'ASUS ROG Gaming Laptop', 32999.00, NULL, 8, 2, 'adet', 'aktif', 4),
(2, 9, 'Samsung 55" 4K Smart TV', 'samsung-55-4k-smart-tv', 'Samsung 55" Crystal UHD 4K Smart TV. Tizen OS, HDR10+, Ambient Mode.', 'Samsung 55" 4K Smart TV', 12999.00, 11999.00, 15, 3, 'adet', 'aktif', 5),
(2, 9, 'Sony WH-1000XM5 Kablosuz Kulaklık', 'sony-wh-1000xm5-kulaklik', 'Sony WH-1000XM5 Kablosuz Gürültü Önleyici Kulaklık. 30 saat pil ömrü, Hi-Res Audio.', 'Sony WH-1000XM5 Kulaklık', 2499.00, 2299.00, 35, 5, 'adet', 'aktif', 6),

-- Giyim Ürünleri
(5, 11, 'Kadın Triko Kazak', 'kadin-triko-kazak', 'Yumuşak dokulu kadın triko kazak. %100 pamuk, çeşitli renk seçenekleri.', 'Kadın Triko Kazak', 149.90, 119.90, 45, 10, 'adet', 'beklemede', 7),
(5, 12, 'Erkek Polo T-Shirt', 'erkek-polo-tshirt', 'Erkek polo yaka t-shirt. %100 pamuk, slim fit kesim.', 'Erkek Polo T-Shirt', 89.90, NULL, 60, 15, 'adet', 'beklemede', 8),
(5, 14, 'Nike Air Max 270 Spor Ayakkabı', 'nike-air-max-270-spor-ayakkabi', 'Nike Air Max 270 erkek spor ayakkabı. Air Max teknolojisi, hafif ve rahat.', 'Nike Air Max 270', 899.00, 799.00, 22, 5, 'adet', 'aktif', 9),

-- Market Ürünleri
(4, 19, 'Ekmek 500g', 'ekmek-500g', 'Günlük taze ekmek 500g. Geleneksel fırın ekmeği.', 'Taze Ekmek 500g', 4.50, NULL, 200, 50, 'adet', 'aktif', 10),
(4, 19, 'Makarna Spagetti 500g', 'makarna-spagetti-500g', 'Durum buğdayından üretilen spagetti makarna 500g.', 'Spagetti Makarna 500g', 8.75, NULL, 150, 30, 'paket', 'aktif', 11),
(4, 19, 'Pirinç 1kg', 'pirinc-1kg', 'Kaliteli baldo pirinç 1kg. Türk pirinci.', 'Baldo Pirinç 1kg', 18.90, NULL, 80, 20, 'kg', 'aktif', 12),
(4, 20, 'Süt 1L', 'sut-1l', 'Tam yağlı süt 1 litre. UHT işlem görmüş.', 'Tam Yağlı Süt 1L', 12.50, NULL, 120, 25, 'adet', 'aktif', 13),
(4, 20, 'Beyaz Peynir 500g', 'beyaz-peynir-500g', 'Tam yağlı beyaz peynir 500g. Geleneksel lezzet.', 'Beyaz Peynir 500g', 65.00, 59.90, 45, 10, 'paket', 'aktif', 14),
(4, 20, 'Yumurta 10 Adet', 'yumurta-10-adet', 'Taze tavuk yumurtası 10 adet. L boy.', 'Tavuk Yumurtası 10 Adet', 28.90, NULL, 90, 20, 'paket', 'aktif', 15),
(4, 22, 'Domates 1kg', 'domates-1kg', 'Taze domates 1kg. Sera domatesi.', 'Taze Domates 1kg', 15.75, NULL, 60, 15, 'kg', 'aktif', 16),
(4, 22, 'Patates 2kg', 'patates-2kg', 'Taze patates 2kg torba. Yerli üretim.', 'Taze Patates 2kg', 12.90, NULL, 40, 10, 'kg', 'aktif', 17),
(4, 23, 'Su 5L', 'su-5l', 'İçme suyu 5 litre. Doğal kaynak suyu.', 'Doğal Kaynak Suyu 5L', 8.50, NULL, 100, 25, 'adet', 'aktif', 18),
(4, 23, 'Çay 500g', 'cay-500g', 'Siyah çay 500g. Rize çayı.', 'Rize Çayı 500g', 45.00, 42.50, 35, 8, 'paket', 'aktif', 19);

-- Ürün Resimleri
INSERT INTO urun_resimleri (urun_id, resim_url, alt_text, sira_no, ana_resim) VALUES
(1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop', 'iPhone 15 Pro Max', 1, true),
(2, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop', 'Samsung Galaxy S24 Ultra', 1, true),
(3, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop', 'MacBook Air M2', 1, true),
(4, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=500&fit=crop', 'ASUS ROG Gaming Laptop', 1, true),
(5, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop', 'Samsung 4K Smart TV', 1, true),
(6, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', 'Sony WH-1000XM5', 1, true),
(7, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop', 'Kadın Triko Kazak', 1, true),
(8, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop', 'Erkek Polo T-Shirt', 1, true),
(9, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop', 'Nike Air Max 270', 1, true),
(10, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop', 'Taze Ekmek', 1, true),
(11, 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=500&h=500&fit=crop', 'Spagetti Makarna', 1, true),
(12, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=500&fit=crop', 'Baldo Pirinç', 1, true),
(13, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop', 'Tam Yağlı Süt', 1, true),
(14, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop', 'Beyaz Peynir', 1, true),
(15, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=500&fit=crop', 'Tavuk Yumurtası', 1, true),
(16, 'https://images.unsplash.com/photo-1546470427-e5380b6d0b66?w=500&h=500&fit=crop', 'Taze Domates', 1, true),
(17, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&h=500&fit=crop', 'Taze Patates', 1, true),
(18, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=500&fit=crop', 'Doğal Kaynak Suyu', 1, true),
(19, 'https://images.unsplash.com/photo-1594631661960-0e4c8d0e3d66?w=500&h=500&fit=crop', 'Rize Çayı', 1, true);

-- Ürün Varyantları
INSERT INTO urun_varyantlari (urun_id, varyant_tipi, varyant_degeri, ek_fiyat, stok_miktari, aktif) VALUES
-- iPhone renk varyantları
(1, 'renk', 'Doğal Titanyum', 0.00, 10, true),
(1, 'renk', 'Mavi Titanyum', 0.00, 8, true),
(1, 'renk', 'Beyaz Titanyum', 0.00, 7, true),

-- Samsung renk varyantları
(2, 'renk', 'Titanyum Gri', 0.00, 6, true),
(2, 'renk', 'Titanyum Siyah', 0.00, 7, true),
(2, 'renk', 'Titanyum Mor', 0.00, 5, true),

-- Kazak beden varyantları
(7, 'beden', 'S', 0.00, 12, true),
(7, 'beden', 'M', 0.00, 15, true),
(7, 'beden', 'L', 0.00, 10, true),
(7, 'beden', 'XL', 0.00, 8, true),

-- T-shirt beden varyantları
(8, 'beden', 'S', 0.00, 15, true),
(8, 'beden', 'M', 0.00, 20, true),
(8, 'beden', 'L', 0.00, 15, true),
(8, 'beden', 'XL', 0.00, 10, true),

-- Ayakkabı numara varyantları
(9, 'numara', '40', 0.00, 3, true),
(9, 'numara', '41', 0.00, 5, true),
(9, 'numara', '42', 0.00, 6, true),
(9, 'numara', '43', 0.00, 4, true),
(9, 'numara', '44', 0.00, 4, true);

-- Siparişler
INSERT INTO siparisler (siparis_no, kullanici_id, satici_id, siparis_tipi, durum, ara_toplam, kargo_ucreti, indirim_tutari, vergi_tutari, toplam_tutar, odeme_durumu, teslimat_adresi, tahmini_teslimat_suresi) VALUES
('SP1703001001', 6, 2, 'genel', 'teslim_edildi', 52999.00, 0.00, 2000.00, 9539.82, 60538.82, 'odendi', '{"ad_soyad": "Ali Özkan", "telefon": "+905551234572", "adres": "Bağdat Cad. No:123 Kadıköy/İstanbul", "sehir": "İstanbul", "ilce": "Kadıköy"}', 120),
('SP1703001002', 7, 4, 'market', 'kargoda', 85.40, 0.00, 0.00, 15.37, 100.77, 'odendi', '{"ad_soyad": "Zeynep Arslan", "telefon": "+905551234573", "adres": "Acıbadem Mah. Çeçen Sok. No:45 Üsküdar/İstanbul", "sehir": "İstanbul", "ilce": "Üsküdar"}', 15),
('SP1703001003', 6, 3, 'yemek', 'hazirlaniyor', 125.50, 8.99, 12.55, 22.59, 144.53, 'odendi', '{"ad_soyad": "Ali Özkan", "telefon": "+905551234572", "adres": "Bağdat Cad. No:123 Kadıköy/İstanbul", "sehir": "İstanbul", "ilce": "Kadıköy"}', 45),
('SP1703001004', 7, 2, 'genel', 'beklemede', 2299.00, 15.99, 200.00, 413.82, 2528.81, 'beklemede', '{"ad_soyad": "Zeynep Arslan", "telefon": "+905551234573", "adres": "Acıbadem Mah. Çeçen Sok. No:45 Üsküdar/İstanbul", "sehir": "İstanbul", "ilce": "Üsküdar"}', 120);

-- Sipariş Kalemleri
INSERT INTO siparis_kalemleri (siparis_id, urun_id, miktar, birim_fiyat, toplam_fiyat, urun_adi) VALUES
(1, 1, 1, 52999.00, 52999.00, 'iPhone 15 Pro Max 256GB'),
(2, 10, 2, 4.50, 9.00, 'Ekmek 500g'),
(2, 13, 3, 12.50, 37.50, 'Süt 1L'),
(2, 15, 1, 28.90, 28.90, 'Yumurta 10 Adet'),
(2, 19, 1, 42.50, 42.50, 'Çay 500g'),
(3, 6, 1, 2299.00, 2299.00, 'Sony WH-1000XM5 Kablosuz Kulaklık');

-- Ödeme İşlemleri
INSERT INTO odeme_islemleri (siparis_id, odeme_no, tutar, odeme_yontemi, durum, islem_tarihi) VALUES
(1, 'PAY1703001001', 60538.82, 'kredi_karti', 'basarili', '2024-01-15 10:30:00+03'),
(2, 'PAY1703001002', 100.77, 'kredi_karti', 'basarili', '2024-01-15 14:45:00+03'),
(3, 'PAY1703001003', 144.53, 'nakit', 'basarili', '2024-01-15 19:20:00+03');

-- Kuryeler
INSERT INTO kuryeler (kullanici_id, kurye_kodu, durum, arac_tipi, plaka, telefon, performans_puani, toplam_teslimat, musaitlik_durumu) VALUES
(6, 'KUR001', 'aktif', 'motosiklet', '34ABC123', '+905551234572', 4.7, 245, 'musait'),
(7, 'KUR002', 'aktif', 'bisiklet', '', '+905551234573', 4.9, 189, 'teslimat_yapıyor');

-- Teslimat Takibi
INSERT INTO teslimat_takibi (siparis_id, kurye_id, durum, konum, aciklama, tahmini_varis_suresi) VALUES
(1, 1, 'teslim_edildi', '{"lat": 40.9923, "lng": 29.0244}', 'Sipariş başarıyla teslim edildi', 0),
(2, 1, 'yolda', '{"lat": 41.0082, "lng": 28.9784}', 'Kurye teslimat adresine doğru yolda', 8),
(3, 2, 'hazirlaniyor', '{"lat": 40.9923, "lng": 29.0244}', 'Sipariş restoranda hazırlanıyor', 25);

-- Yorumlar
INSERT INTO yorumlar (kullanici_id, siparis_id, hedef_id, hedef_tipi, puan, baslik, yorum, durum) VALUES
(6, 1, 1, 'urun', 5, 'Mükemmel telefon!', 'iPhone 15 Pro Max gerçekten harika. Kamera kalitesi ve performans çok iyi. Kesinlikle tavsiye ederim.', 'onaylandi'),
(7, 2, 4, 'satici', 5, 'Hızlı teslimat', 'Hızlı Market Express gerçekten 15 dakikada teslim etti. Ürünler taze ve kaliteliydi.', 'onaylandi'),
(6, 3, 3, 'satici', 4, 'Lezzetli yemekler', 'Lezzet Durağı Restaurant\'tan sipariş ettiğim yemekler çok lezzetliydi. Sadece biraz geç geldi.', 'onaylandi');

-- Kampanyalar
INSERT INTO kampanyalar (ad, aciklama, kampanya_tipi, indirim_degeri, minimum_tutar, maksimum_indirim, kullanim_limiti, baslangic_tarihi, bitis_tarihi, hedef_kategori, durum) VALUES
('Elektronik Ürünlerde %10 İndirim', 'Tüm elektronik ürünlerde geçerli %10 indirim kampanyası', 'yuzde', 10.00, 500.00, 1000.00, 1000, '2024-01-01 00:00:00+03', '2024-02-29 23:59:59+03', '{"kategori_ids": [1]}', 'aktif'),
('Hızlı Market İlk Sipariş', 'Hızlı market ilk siparişinizde 25 TL indirim', 'sabit', 25.00, 50.00, 25.00, 500, '2024-01-01 00:00:00+03', '2024-12-31 23:59:59+03', '{"satici_ids": [4]}', 'aktif'),
('Yemek Siparişlerinde Ücretsiz Kargo', 'Tüm yemek siparişlerinde kargo ücretsiz', 'kargo', 0.00, 35.00, NULL, NULL, '2024-01-01 00:00:00+03', '2024-03-31 23:59:59+03', '{"siparis_tipi": "yemek"}', 'aktif');

-- Ürün Onay Süreci
INSERT INTO urun_onay_sureci (urun_id, admin_id, onceki_durum, yeni_durum, onay_notu) VALUES
(1, 1, 'beklemede', 'aktif', 'Ürün bilgileri ve görseller uygun, onaylandı'),
(2, 1, 'beklemede', 'aktif', 'Ürün bilgileri ve görseller uygun, onaylandı'),
(3, 1, 'beklemede', 'aktif', 'Ürün bilgileri ve görseller uygun, onaylandı'),
(7, 1, 'aktif', 'beklemede', 'Ürün görselleri yeniden incelenmek üzere beklemede'),
(8, 1, 'aktif', 'beklemede', 'Ürün açıklaması eksik, düzeltilmesi gerekiyor');

-- AI Moderasyon Sonuçları
INSERT INTO ai_moderasyon_sonuclari (hedef_id, hedef_tipi, moderasyon_tipi, sonuc, guven_skoru, detaylar) VALUES
(1, 'urun', 'icerik_moderasyonu', 'onaylandi', 95.5, '{"kontrol_edilen": ["baslik", "aciklama", "resimler"], "risk_seviyesi": "dusuk"}'),
(2, 'urun', 'icerik_moderasyonu', 'onaylandi', 92.3, '{"kontrol_edilen": ["baslik", "aciklama", "resimler"], "risk_seviyesi": "dusuk"}'),
(7, 'urun', 'icerik_moderasyonu', 'inceleme_gerekli', 78.2, '{"kontrol_edilen": ["baslik", "aciklama", "resimler"], "risk_seviyesi": "orta", "uyari": "Ürün görselleri kalite standartlarının altında"}'),
(1, 'yorum', 'spam_tespiti', 'onaylandi', 88.7, '{"spam_riski": "dusuk", "duygu_analizi": "pozitif"}'),
(2, 'yorum', 'spam_tespiti', 'onaylandi', 91.2, '{"spam_riski": "dusuk", "duygu_analizi": "pozitif"}'),
(3, 'yorum', 'spam_tespiti', 'onaylandi', 85.4, '{"spam_riski": "dusuk", "duygu_analizi": "notr"}');

-- Sistem Ayarları
INSERT INTO sistem_ayarlari (anahtar, deger, aciklama, kategori) VALUES
('platform_adi', 'Cebeuygun.com', 'Platform adı', 'genel'),
('minimum_siparis_tutari', '25.00', 'Minimum sipariş tutarı (TL)', 'siparis'),
('ucretsiz_kargo_limiti', '150.00', 'Ücretsiz kargo için minimum tutar (TL)', 'kargo'),
('komisyon_orani_genel', '10.00', 'Genel ürünler için varsayılan komisyon oranı (%)', 'komisyon'),
('komisyon_orani_yemek', '15.00', 'Yemek siparişleri için komisyon oranı (%)', 'komisyon'),
('komisyon_orani_market', '12.00', 'Market siparişleri için komisyon oranı (%)', 'komisyon'),
('ai_moderasyon_aktif', 'true', 'AI moderasyon sisteminin aktif olup olmadığı', 'moderasyon'),
('ai_guven_esigi', '80.0', 'AI moderasyon güven eşiği (%)', 'moderasyon'),
('maksimum_teslimat_suresi', '180', 'Maksimum teslimat süresi (dakika)', 'teslimat'),
('hizli_market_teslimat_suresi', '15', 'Hızlı market teslimat süresi (dakika)', 'teslimat');

-- Toplu İşlem Logları
INSERT INTO toplu_islem_loglari (admin_id, islem_tipi, dosya_adi, toplam_kayit, basarili_kayit, hatali_kayit, durum) VALUES
(1, 'urun_import', 'elektronik_urunler_2024.csv', 150, 145, 5, 'tamamlandi'),
(1, 'kategori_import', 'yeni_kategoriler.xml', 25, 25, 0, 'tamamlandi'),
(1, 'stok_guncelleme', 'stok_guncelleme_ocak.csv', 500, 485, 15, 'tamamlandi');
