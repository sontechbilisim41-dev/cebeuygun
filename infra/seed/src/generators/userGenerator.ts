import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { SeedUser } from '@/types';
import { getRandomUserAvatar } from '@/data/images';

// Set Turkish locale for realistic names
faker.locale = 'tr';

export class UserGenerator {
  private static readonly DEMO_USERS = [
    {
      email: 'admin@cebeuygun.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+90 555 000 0001',
      role: 'admin' as const,
      description: 'Platform yöneticisi - tüm özelliklere erişim'
    },
    {
      email: 'customer@demo.com',
      password: 'demo123',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      phone: '+90 555 123 4567',
      role: 'customer' as const,
      description: 'Demo müşteri hesabı - sipariş verme ve takip'
    },
    {
      email: 'courier@demo.com',
      password: 'demo123',
      firstName: 'Mehmet',
      lastName: 'Kaya',
      phone: '+90 555 987 6543',
      role: 'courier' as const,
      description: 'Demo kurye hesabı - teslimat yapma'
    },
    {
      email: 'seller@demo.com',
      password: 'demo123',
      firstName: 'Fatma',
      lastName: 'Özkan',
      phone: '+90 555 456 7890',
      role: 'seller' as const,
      description: 'Demo satıcı hesabı - ürün yönetimi'
    }
  ];

  static async generateUsers(count: number): Promise<SeedUser[]> {
    const users: SeedUser[] = [];
    
    // Add demo users first
    for (const demoUser of this.DEMO_USERS) {
      const hashedPassword = await bcrypt.hash(demoUser.password, 10);
      
      users.push({
        id: uuidv4(),
        email: demoUser.email,
        password_hash: hashedPassword,
        phone: demoUser.phone,
        first_name: demoUser.firstName,
        last_name: demoUser.lastName,
        role: demoUser.role,
        status: 'active',
        email_verified: true,
        phone_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Generate additional random users
    const remainingCount = count - this.DEMO_USERS.length;
    
    for (let i = 0; i < remainingCount; i++) {
      const role = this.getRandomRole();
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const hashedPassword = await bcrypt.hash('demo123', 10);
      
      users.push({
        id: uuidv4(),
        email: faker.internet.email(firstName, lastName).toLowerCase(),
        password_hash: hashedPassword,
        phone: this.generateTurkishPhone(),
        first_name: firstName,
        last_name: lastName,
        role,
        status: faker.helpers.weightedArrayElement([
          { weight: 85, value: 'active' },
          { weight: 10, value: 'pending' },
          { weight: 4, value: 'suspended' },
          { weight: 1, value: 'banned' }
        ]),
        email_verified: faker.datatype.boolean(0.8),
        phone_verified: faker.datatype.boolean(0.7),
        created_at: faker.date.between({
          from: '2023-01-01',
          to: new Date()
        }).toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return users;
  }

  private static getRandomRole(): 'customer' | 'seller' | 'courier' | 'admin' {
    return faker.helpers.weightedArrayElement([
      { weight: 70, value: 'customer' },
      { weight: 20, value: 'seller' },
      { weight: 9, value: 'courier' },
      { weight: 1, value: 'admin' }
    ]);
  }

  private static generateTurkishPhone(): string {
    const operators = ['530', '531', '532', '533', '534', '535', '536', '537', '538', '539'];
    const operator = faker.helpers.arrayElement(operators);
    const number = faker.string.numeric(7);
    return `+90 ${operator} ${number.substring(0, 3)} ${number.substring(3)}`;
  }

  static getDemoCredentials() {
    return this.DEMO_USERS.map(user => ({
      email: user.email,
      password: user.password,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
      description: user.description
    }));
  }
}