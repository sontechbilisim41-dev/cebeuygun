export const PRODUCT_CATEGORIES = [
  // Food & Beverages
  {
    name: 'Yiyecek & İçecek',
    description: 'Taze gıda ürünleri ve içecekler',
    children: [
      {
        name: 'Fast Food',
        description: 'Hamburger, pizza, döner ve hızlı yemek seçenekleri',
        children: [
          { name: 'Hamburger', description: 'Çeşitli hamburger menüleri' },
          { name: 'Pizza', description: 'İtalyan ve Türk usulü pizzalar' },
          { name: 'Döner & Kebap', description: 'Geleneksel Türk lezzetleri' },
          { name: 'Tavuk Ürünleri', description: 'Kızarmış tavuk ve yan ürünler' },
          { name: 'Sandviç & Wrap', description: 'Tost, sandviç ve wrap çeşitleri' }
        ]
      },
      {
        name: 'Türk Mutfağı',
        description: 'Geleneksel Türk yemekleri',
        children: [
          { name: 'Ana Yemekler', description: 'Et ve sebze yemekleri' },
          { name: 'Çorbalar', description: 'Sıcak çorba çeşitleri' },
          { name: 'Meze & Salata', description: 'Soğuk ve sıcak mezeler' },
          { name: 'Pilav & Makarna', description: 'Pilav ve makarna çeşitleri' },
          { name: 'Tatlılar', description: 'Geleneksel Türk tatlıları' }
        ]
      },
      {
        name: 'Dünya Mutfağı',
        description: 'Uluslararası lezzetler',
        children: [
          { name: 'Çin Mutfağı', description: 'Çin yemekleri ve dim sum' },
          { name: 'Japon Mutfağı', description: 'Sushi, ramen ve Japon lezzetleri' },
          { name: 'İtalyan Mutfağı', description: 'Pasta, risotto ve İtalyan klasikleri' },
          { name: 'Meksika Mutfağı', description: 'Taco, burrito ve Meksika lezzetleri' },
          { name: 'Hint Mutfağı', description: 'Curry ve baharatlı Hint yemekleri' }
        ]
      },
      {
        name: 'İçecekler',
        description: 'Soğuk ve sıcak içecekler',
        children: [
          { name: 'Kahve & Çay', description: 'Sıcak içecekler' },
          { name: 'Soğuk İçecekler', description: 'Gazlı ve gazsız içecekler' },
          { name: 'Taze Sıkılmış Meyve Suları', description: 'Doğal meyve suları' },
          { name: 'Smoothie & Milkshake', description: 'Kremsi içecekler' },
          { name: 'Alkollü İçecekler', description: 'Bira, şarap ve kokteyl' }
        ]
      }
    ]
  },
  
  // Grocery & Market
  {
    name: 'Market & Gıda',
    description: 'Günlük ihtiyaç ürünleri',
    children: [
      {
        name: 'Meyve & Sebze',
        description: 'Taze meyve ve sebzeler',
        children: [
          { name: 'Mevsim Meyveleri', description: 'Taze mevsim meyveleri' },
          { name: 'Tropik Meyveler', description: 'İthal tropik meyveler' },
          { name: 'Yapraklı Sebzeler', description: 'Salata ve yapraklı yeşillikler' },
          { name: 'Kök Sebzeler', description: 'Patates, havuç, soğan' },
          { name: 'Organik Ürünler', description: 'Sertifikalı organik ürünler' }
        ]
      },
      {
        name: 'Et & Tavuk & Balık',
        description: 'Protein kaynakları',
        children: [
          { name: 'Kırmızı Et', description: 'Dana ve kuzu eti' },
          { name: 'Tavuk Ürünleri', description: 'Taze tavuk ve parçaları' },
          { name: 'Balık & Deniz Ürünleri', description: 'Taze balık ve deniz ürünleri' },
          { name: 'Şarküteri', description: 'Sucuk, salam ve şarküteri ürünleri' },
          { name: 'Donuk Ürünler', description: 'Dondurulmuş et ve balık' }
        ]
      },
      {
        name: 'Süt Ürünleri',
        description: 'Süt ve süt ürünleri',
        children: [
          { name: 'Süt & Ayran', description: 'Taze süt ve ayran' },
          { name: 'Peynir Çeşitleri', description: 'Beyaz peynir, kaşar ve özel peynirler' },
          { name: 'Yoğurt', description: 'Sade ve meyveli yoğurt çeşitleri' },
          { name: 'Tereyağı & Margarin', description: 'Tereyağı ve margarin' },
          { name: 'Dondurma', description: 'Çeşitli dondurma markaları' }
        ]
      }
    ]
  },

  // Electronics & Technology
  {
    name: 'Elektronik & Teknoloji',
    description: 'Teknoloji ürünleri ve aksesuarları',
    children: [
      {
        name: 'Telefon & Tablet',
        description: 'Akıllı telefon ve tablet bilgisayarlar',
        children: [
          { name: 'Akıllı Telefonlar', description: 'Android ve iOS telefonlar' },
          { name: 'Tablet Bilgisayarlar', description: 'iPad ve Android tabletler' },
          { name: 'Telefon Aksesuarları', description: 'Kılıf, şarj aleti ve aksesuarlar' },
          { name: 'Kulaklık & Hoparlör', description: 'Bluetooth ve kablolu ses cihazları' }
        ]
      },
      {
        name: 'Bilgisayar & Laptop',
        description: 'Masaüstü ve taşınabilir bilgisayarlar',
        children: [
          { name: 'Laptop Bilgisayar', description: 'Dizüstü bilgisayarlar' },
          { name: 'Masaüstü Bilgisayar', description: 'Desktop PC sistemleri' },
          { name: 'Bilgisayar Parçaları', description: 'RAM, SSD, ekran kartı' },
          { name: 'Monitör & Ekran', description: 'LCD, LED ve gaming monitörler' }
        ]
      }
    ]
  },

  // Fashion & Clothing
  {
    name: 'Moda & Giyim',
    description: 'Kadın, erkek ve çocuk giyim',
    children: [
      {
        name: 'Kadın Giyim',
        description: 'Kadın kıyafetleri ve aksesuarları',
        children: [
          { name: 'Elbise', description: 'Günlük ve özel elbiseler' },
          { name: 'Bluz & Gömlek', description: 'İş ve günlük bluzlar' },
          { name: 'Pantolon & Etek', description: 'Jean, kumaş pantolon ve etekler' },
          { name: 'Ayakkabı', description: 'Topuklu, spor ve günlük ayakkabılar' },
          { name: 'Çanta & Aksesuar', description: 'El çantası, sırt çantası ve aksesuarlar' }
        ]
      },
      {
        name: 'Erkek Giyim',
        description: 'Erkek kıyafetleri ve aksesuarları',
        children: [
          { name: 'Gömlek & T-shirt', description: 'İş ve günlük gömlekler' },
          { name: 'Pantolon & Şort', description: 'Jean, kumaş pantolon ve şortlar' },
          { name: 'Ceket & Mont', description: 'Blazer, mont ve dış giyim' },
          { name: 'Ayakkabı', description: 'Klasik, spor ve günlük ayakkabılar' },
          { name: 'Aksesuar', description: 'Kemer, kravat ve aksesuarlar' }
        ]
      }
    ]
  },

  // Home & Garden
  {
    name: 'Ev & Yaşam',
    description: 'Ev eşyaları ve yaşam ürünleri',
    children: [
      {
        name: 'Ev Dekorasyonu',
        description: 'Dekoratif ev eşyaları',
        children: [
          { name: 'Aydınlatma', description: 'Avize, lamba ve aydınlatma' },
          { name: 'Halı & Kilim', description: 'Ev halıları ve kilimler' },
          { name: 'Perde & Jaluzi', description: 'Pencere süsleme ürünleri' },
          { name: 'Duvar Dekorasyonu', description: 'Tablo, ayna ve duvar süsleri' }
        ]
      },
      {
        name: 'Mutfak Eşyaları',
        description: 'Mutfak gereçleri ve aletleri',
        children: [
          { name: 'Pişirme Gereçleri', description: 'Tencere, tava ve pişirme aletleri' },
          { name: 'Küçük Ev Aletleri', description: 'Blender, mikser ve mutfak robotları' },
          { name: 'Sofra Takımları', description: 'Tabak, çatal, kaşık takımları' },
          { name: 'Saklama Kapları', description: 'Gıda saklama ve organizasyon' }
        ]
      }
    ]
  }
];

export const getAllCategories = (): Array<{
  name: string;
  description: string;
  parentName?: string;
  level: number;
}> => {
  const categories: Array<{
    name: string;
    description: string;
    parentName?: string;
    level: number;
  }> = [];

  TURKISH_CITIES.forEach(mainCategory => {
    categories.push({
      name: mainCategory.name,
      description: mainCategory.description,
      level: 0
    });

    mainCategory.children?.forEach(subCategory => {
      categories.push({
        name: subCategory.name,
        description: subCategory.description,
        parentName: mainCategory.name,
        level: 1
      });

      subCategory.children?.forEach(subSubCategory => {
        categories.push({
          name: subSubCategory.name,
          description: subSubCategory.description,
          parentName: subCategory.name,
          level: 2
        });
      });
    });
  });

  return categories;
};