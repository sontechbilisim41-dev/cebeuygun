export const PRODUCT_TEMPLATES = {
  // Fast Food Products
  fastFood: [
    {
      name: 'Big Mac Menü',
      description: 'İki köfte, özel sos, marul, peynir, turşu, soğan ile sesam ekmekte. Patates kızartması ve içecek dahil.',
      basePrice: 4500, // 45 TL
      weight: 0.5,
      preparationTime: 8,
      tags: ['hamburger', 'menü', 'popüler'],
      attributes: { calories: 563, allergens: ['gluten', 'dairy', 'sesame'] }
    },
    {
      name: 'Margherita Pizza (Büyük)',
      description: 'Taze mozzarella, domates sosu ve fesleğen ile klasik İtalyan pizzası.',
      basePrice: 3800,
      weight: 0.8,
      preparationTime: 15,
      tags: ['pizza', 'vegetarian', 'italian'],
      attributes: { size: 'large', diameter: '32cm', allergens: ['gluten', 'dairy'] }
    },
    {
      name: 'Chicken Döner Porsiyon',
      description: 'Taze tavuk döner, pilav, salata ve ayran ile servis edilir.',
      basePrice: 2800,
      weight: 0.6,
      preparationTime: 5,
      tags: ['döner', 'tavuk', 'geleneksel'],
      attributes: { spiceLevel: 'medium', allergens: ['dairy'] }
    },
    {
      name: 'Fish & Chips',
      description: 'Çıtır balık fileto ve patates kızartması, tartar sos ile.',
      basePrice: 3200,
      weight: 0.4,
      preparationTime: 12,
      tags: ['balık', 'deniz ürünleri', 'british'],
      attributes: { fishType: 'cod', allergens: ['fish', 'gluten'] }
    }
  ],

  // Turkish Cuisine
  turkishCuisine: [
    {
      name: 'Adana Kebap',
      description: 'Acılı kıyma kebabı, bulgur pilavı, közlenmiş domates ve biber ile.',
      basePrice: 4200,
      weight: 0.7,
      preparationTime: 20,
      tags: ['kebap', 'acılı', 'geleneksel'],
      attributes: { spiceLevel: 'hot', region: 'Adana', allergens: [] }
    },
    {
      name: 'İskender Kebap',
      description: 'Döner eti, pide üzerinde, domates sosu ve tereyağı ile.',
      basePrice: 4800,
      weight: 0.8,
      preparationTime: 15,
      tags: ['iskender', 'döner', 'bursa'],
      attributes: { region: 'Bursa', allergens: ['gluten', 'dairy'] }
    },
    {
      name: 'Mantı',
      description: 'El açması hamur içinde kıyma, yoğurt ve tereyağlı sos ile.',
      basePrice: 3500,
      weight: 0.4,
      preparationTime: 25,
      tags: ['mantı', 'hamur işi', 'geleneksel'],
      attributes: { pieces: 40, allergens: ['gluten', 'dairy', 'eggs'] }
    },
    {
      name: 'Lahmacun',
      description: 'İnce hamur üzerinde kıymalı karışım, maydanoz ve limon ile.',
      basePrice: 1800,
      weight: 0.2,
      preparationTime: 10,
      tags: ['lahmacun', 'ince hamur', 'geleneksel'],
      attributes: { size: 'medium', allergens: ['gluten'] }
    }
  ],

  // Beverages
  beverages: [
    {
      name: 'Türk Kahvesi',
      description: 'Geleneksel Türk kahvesi, şeker seçeneği ile.',
      basePrice: 800,
      weight: 0.1,
      preparationTime: 5,
      tags: ['kahve', 'geleneksel', 'sıcak'],
      attributes: { caffeine: 'medium', temperature: 'hot' }
    },
    {
      name: 'Taze Sıkılmış Portakal Suyu',
      description: 'Günlük taze sıkılmış portakal suyu, %100 doğal.',
      basePrice: 1200,
      weight: 0.3,
      preparationTime: 3,
      tags: ['meyve suyu', 'taze', 'vitamin'],
      attributes: { vitaminC: 'high', natural: true }
    },
    {
      name: 'Ayran',
      description: 'Geleneksel Türk içeceği, yoğurt, su ve tuz karışımı.',
      basePrice: 600,
      weight: 0.25,
      preparationTime: 2,
      tags: ['ayran', 'geleneksel', 'probiyotik'],
      attributes: { probiotics: true, allergens: ['dairy'] }
    }
  ],

  // Electronics
  electronics: [
    {
      name: 'iPhone 15 Pro Max 256GB',
      description: 'Apple iPhone 15 Pro Max, 256GB depolama, ProRAW kamera sistemi.',
      basePrice: 6499900, // 64,999 TL
      weight: 0.221,
      preparationTime: 0,
      tags: ['iphone', 'apple', 'flagship'],
      attributes: { storage: '256GB', color: 'Natural Titanium', warranty: '2 years' }
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Samsung Galaxy S24 Ultra, S Pen dahil, 512GB depolama.',
      basePrice: 5799900,
      weight: 0.232,
      preparationTime: 0,
      tags: ['samsung', 'android', 'flagship'],
      attributes: { storage: '512GB', color: 'Titanium Black', spen: true }
    },
    {
      name: 'MacBook Air M3 13"',
      description: 'Apple MacBook Air M3 çip, 13 inç Liquid Retina ekran, 512GB SSD.',
      basePrice: 4999900,
      weight: 1.24,
      preparationTime: 0,
      tags: ['macbook', 'apple', 'laptop'],
      attributes: { processor: 'M3', screen: '13.6"', storage: '512GB SSD' }
    }
  ],

  // Fashion
  fashion: [
    {
      name: 'Levi\'s 501 Original Jean',
      description: 'Klasik straight fit jean, %100 pamuk, vintage yıkama.',
      basePrice: 89900,
      weight: 0.6,
      preparationTime: 0,
      tags: ['jean', 'levis', 'klasik'],
      attributes: { material: '100% Cotton', fit: 'Straight', wash: 'Medium Blue' }
    },
    {
      name: 'Nike Air Max 270',
      description: 'Nike Air Max 270 spor ayakkabı, maksimum hava yastığı teknolojisi.',
      basePrice: 179900,
      weight: 0.8,
      preparationTime: 0,
      tags: ['nike', 'spor ayakkabı', 'air max'],
      attributes: { brand: 'Nike', technology: 'Air Max', color: 'Black/White' }
    }
  ],

  // Home & Living
  homeLiving: [
    {
      name: 'IKEA MALM Yatak Odası Takımı',
      description: 'Modern yatak odası takımı, yatak, komodin ve dolap dahil.',
      basePrice: 899900,
      weight: 85.0,
      preparationTime: 0,
      tags: ['yatak odası', 'ikea', 'mobilya'],
      attributes: { material: 'Particle Board', color: 'White', assembly: 'Required' }
    },
    {
      name: 'Philips Hue Akıllı Ampul Seti',
      description: '4\'lü renkli LED ampul seti, WiFi kontrolü, 16 milyon renk.',
      basePrice: 149900,
      weight: 0.4,
      preparationTime: 0,
      tags: ['akıllı ev', 'led', 'philips'],
      attributes: { connectivity: 'WiFi', colors: '16M', wattage: '9W' }
    }
  ]
};

export const PRODUCT_BRANDS = [
  // Food Brands
  'McDonald\'s', 'Burger King', 'KFC', 'Domino\'s Pizza', 'Pizza Hut',
  'Starbucks', 'Kahve Dünyası', 'Simit Sarayı', 'Popeyes', 'Subway',
  
  // Electronics Brands
  'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Sony', 'LG', 'HP', 'Dell',
  'Asus', 'Lenovo', 'Microsoft', 'Google', 'OnePlus', 'Oppo',
  
  // Fashion Brands
  'Nike', 'Adidas', 'Zara', 'H&M', 'Mango', 'LC Waikiki', 'Koton',
  'Defacto', 'Levi\'s', 'Tommy Hilfiger', 'Lacoste', 'Polo Ralph Lauren',
  
  // Home Brands
  'IKEA', 'Bellona', 'Yataş', 'Kelebek Mobilya', 'Philips', 'Bosch',
  'Siemens', 'Arçelik', 'Vestel', 'Beko', 'Tefal', 'Karaca'
];

export const generateProductVariations = (baseProduct: any, count: number = 3) => {
  const variations = [];
  const colors = ['Siyah', 'Beyaz', 'Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Pembe', 'Gri'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  
  for (let i = 0; i < count; i++) {
    const variation = {
      ...baseProduct,
      name: `${baseProduct.name} - ${colors[i % colors.length]}`,
      attributes: {
        ...baseProduct.attributes,
        color: colors[i % colors.length],
        size: sizes[i % sizes.length],
        variant: i + 1
      },
      basePrice: baseProduct.basePrice + (Math.random() * 1000 - 500) // ±5 TL variation
    };
    variations.push(variation);
  }
  
  return variations;
};