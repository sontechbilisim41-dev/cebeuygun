import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { SeedProduct, SeedProductMedia } from '@/types';
import { PRODUCT_TEMPLATES, PRODUCT_BRANDS, generateProductVariations } from '@/data/products';
import { getRandomImage } from '@/data/images';

export class ProductGenerator {
  static generateProducts(categoryIds: string[], count: number = 5000): {
    products: SeedProduct[];
    productMedia: SeedProductMedia[];
  } {
    const products: SeedProduct[] = [];
    const productMedia: SeedProductMedia[] = [];

    // Generate products based on templates
    const templates = Object.values(PRODUCT_TEMPLATES).flat();
    const productsPerCategory = Math.ceil(count / categoryIds.length);

    categoryIds.forEach(categoryId => {
      for (let i = 0; i < productsPerCategory && products.length < count; i++) {
        const template = faker.helpers.arrayElement(templates);
        const brand = faker.helpers.arrayElement(PRODUCT_BRANDS);
        
        const product = this.createProductFromTemplate(template, categoryId, brand);
        products.push(product);

        // Generate product images (1-4 per product)
        const imageCount = faker.number.int({ min: 1, max: 4 });
        for (let j = 0; j < imageCount; j++) {
          const media = this.generateProductMedia(product.id, j);
          productMedia.push(media);
        }
      }
    });

    return { products, productMedia };
  }

  private static createProductFromTemplate(
    template: any,
    categoryId: string,
    brand: string
  ): SeedProduct {
    const sku = this.generateSKU(brand);
    const barcode = this.generateBarcode();
    
    // Add some price variation
    const priceVariation = faker.number.float({ min: 0.8, max: 1.2 });
    const basePrice = Math.round(template.basePrice * priceVariation);

    return {
      id: uuidv4(),
      name: template.name,
      description: this.enhanceDescription(template.description),
      category_id: categoryId,
      brand,
      sku,
      barcode,
      base_price: basePrice,
      currency: 'TRY',
      tax_rate: faker.helpers.weightedArrayElement([
        { weight: 70, value: 18 }, // Standard VAT
        { weight: 20, value: 8 },  // Reduced VAT
        { weight: 10, value: 1 }   // Special VAT
      ]),
      base_stock: faker.number.int({ min: 0, max: 500 }),
      min_stock: faker.number.int({ min: 5, max: 20 }),
      max_stock: faker.number.int({ min: 100, max: 1000 }),
      weight: template.weight || faker.number.float({ min: 0.1, max: 2.0 }),
      dimensions: this.generateDimensions(),
      tags: template.tags || [],
      attributes: {
        ...template.attributes,
        featured: faker.datatype.boolean(0.1),
        organic: faker.datatype.boolean(0.15),
        localProduct: faker.datatype.boolean(0.3)
      },
      is_active: faker.datatype.boolean(0.9),
      is_express_delivery: faker.datatype.boolean(0.3),
      preparation_time: template.preparationTime || faker.number.int({ min: 0, max: 30 }),
      created_at: faker.date.between({
        from: '2023-01-01',
        to: new Date()
      }).toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private static generateProductMedia(productId: string, sortOrder: number): SeedProductMedia {
    const imageUrl = this.getRandomProductImage();
    const fileName = `product_${productId}_${sortOrder + 1}.jpg`;
    
    return {
      id: uuidv4(),
      product_id: productId,
      type: 'image',
      url: imageUrl,
      file_name: fileName,
      file_size: faker.number.int({ min: 50000, max: 500000 }),
      mime_type: 'image/jpeg',
      alt_text: faker.lorem.sentence(3),
      sort_order: sortOrder,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private static generateSKU(brand: string): string {
    const brandCode = brand.substring(0, 3).toUpperCase();
    const randomCode = faker.string.alphanumeric(6).toUpperCase();
    return `${brandCode}-${randomCode}`;
  }

  private static generateBarcode(): string {
    // Generate EAN-13 barcode
    const countryCode = '869'; // Turkey
    const manufacturerCode = faker.string.numeric(4);
    const productCode = faker.string.numeric(5);
    const checkDigit = faker.string.numeric(1);
    return `${countryCode}${manufacturerCode}${productCode}${checkDigit}`;
  }

  private static generateDimensions(): string {
    const length = faker.number.int({ min: 5, max: 50 });
    const width = faker.number.int({ min: 5, max: 50 });
    const height = faker.number.int({ min: 2, max: 30 });
    return `${length}x${width}x${height} cm`;
  }

  private static enhanceDescription(baseDescription: string): string {
    const enhancements = [
      'Taze malzemelerle hazırlanır.',
      'Günlük taze üretim.',
      'Özel tarifle hazırlanmıştır.',
      'Hijyenik koşullarda üretilmiştir.',
      'Doğal ve katkısız.',
      'Uzman aşçılar tarafından hazırlanır.',
      'Premium kalite garantisi.',
      'Müşteri memnuniyeti garantili.'
    ];
    
    const enhancement = faker.helpers.arrayElement(enhancements);
    return `${baseDescription} ${enhancement}`;
  }

  private static getRandomProductImage(): string {
    const categories = ['hamburger', 'pizza', 'kebab', 'sushi', 'coffee', 'fruits', 'vegetables', 'dairy'];
    const category = faker.helpers.arrayElement(categories);
    return getRandomImage(category as any);
  }

  static generateFeaturedProducts(products: SeedProduct[], count: number = 20): SeedProduct[] {
    return faker.helpers.arrayElements(products, count).map(product => ({
      ...product,
      attributes: {
        ...product.attributes,
        featured: true,
        featuredOrder: faker.number.int({ min: 1, max: count })
      }
    }));
  }

  static generatePopularProducts(products: SeedProduct[], count: number = 50): SeedProduct[] {
    return faker.helpers.arrayElements(products, count).map(product => ({
      ...product,
      attributes: {
        ...product.attributes,
        popular: true,
        orderCount: faker.number.int({ min: 100, max: 1000 }),
        rating: faker.number.float({ min: 4.0, max: 5.0 })
      }
    }));
  }
}