import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { SeedCourier, SeedServiceArea, SeedWorkingHours } from '@/types';
import { TURKISH_CITIES, generateRandomCoordinates } from '@/data/cities';

export class CourierGenerator {
  static generateCouriers(userIds: string[], count: number = 20): {
    couriers: SeedCourier[];
    serviceAreas: SeedServiceArea[];
    workingHours: SeedWorkingHours[];
  } {
    const couriers: SeedCourier[] = [];
    const serviceAreas: SeedServiceArea[] = [];
    const workingHours: SeedWorkingHours[] = [];

    // Filter courier user IDs
    const courierUserIds = userIds.slice(0, Math.min(count, userIds.length));

    courierUserIds.forEach((userId, index) => {
      const vehicleType = faker.helpers.weightedArrayElement([
        { weight: 40, value: 'MOTORBIKE' },
        { weight: 30, value: 'BICYCLE' },
        { weight: 20, value: 'CAR' },
        { weight: 10, value: 'WALKING' }
      ]);

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email(firstName, lastName).toLowerCase();
      const phone = this.generateTurkishPhone();

      const courier: SeedCourier = {
        id: uuidv4(),
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        vehicle_type: vehicleType,
        vehicle_plate: vehicleType !== 'WALKING' ? this.generateVehiclePlate() : undefined,
        status: faker.helpers.weightedArrayElement([
          { weight: 60, value: 'ACTIVE' },
          { weight: 20, value: 'INACTIVE' },
          { weight: 10, value: 'BUSY' },
          { weight: 10, value: 'OFFLINE' }
        ]),
        rating: parseFloat((faker.number.float({ min: 3.5, max: 5.0 })).toFixed(2)),
        completed_orders: faker.number.int({ min: 0, max: 1000 }),
        is_online: faker.datatype.boolean(0.3),
        created_at: faker.date.between({
          from: '2023-06-01',
          to: new Date()
        }).toISOString(),
        updated_at: new Date().toISOString()
      };

      couriers.push(courier);

      // Generate service areas (1-3 per courier)
      const areaCount = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < areaCount; i++) {
        const city = faker.helpers.arrayElement(TURKISH_CITIES);
        const coordinates = generateRandomCoordinates(city, 15);
        const district = faker.helpers.arrayElement(city.districts);

        serviceAreas.push({
          id: uuidv4(),
          courier_id: courier.id,
          center_lat: coordinates.latitude,
          center_lng: coordinates.longitude,
          radius_km: this.getRadiusByVehicleType(vehicleType),
          city: city.name,
          district,
          is_active: true,
          created_at: courier.created_at,
          updated_at: courier.updated_at
        });
      }

      // Generate working hours (5-7 days per week)
      const workingDays = faker.helpers.arrayElements([0, 1, 2, 3, 4, 5, 6], { min: 5, max: 7 });
      
      workingDays.forEach(dayOfWeek => {
        const startHour = faker.number.int({ min: 8, max: 11 });
        const endHour = faker.number.int({ min: 18, max: 23 });

        workingHours.push({
          id: uuidv4(),
          courier_id: courier.id,
          day_of_week: dayOfWeek,
          start_time: `${startHour.toString().padStart(2, '0')}:00:00`,
          end_time: `${endHour.toString().padStart(2, '0')}:00:00`,
          is_active: true,
          created_at: courier.created_at,
          updated_at: courier.updated_at
        });
      });
    });

    return { couriers, serviceAreas, workingHours };
  }

  private static generateTurkishPhone(): string {
    const operators = ['530', '531', '532', '533', '534', '535', '536', '537', '538', '539'];
    const operator = faker.helpers.arrayElement(operators);
    const number = faker.string.numeric(7);
    return `+90 ${operator} ${number.substring(0, 3)} ${number.substring(3)}`;
  }

  private static generateVehiclePlate(): string {
    const cityCode = faker.number.int({ min: 1, max: 81 }).toString().padStart(2, '0');
    const letters = faker.string.alpha({ length: 3, casing: 'upper' });
    const numbers = faker.string.numeric(3);
    return `${cityCode} ${letters} ${numbers}`;
  }

  private static getRadiusByVehicleType(vehicleType: string): number {
    switch (vehicleType) {
      case 'WALKING': return faker.number.float({ min: 1, max: 3 });
      case 'BICYCLE': return faker.number.float({ min: 3, max: 8 });
      case 'MOTORBIKE': return faker.number.float({ min: 5, max: 15 });
      case 'CAR': return faker.number.float({ min: 10, max: 25 });
      default: return 10;
    }
  }
}