import { TurkishCity } from '@/types';

export const TURKISH_CITIES: TurkishCity[] = [
  {
    name: 'İstanbul',
    latitude: 41.0082,
    longitude: 28.9784,
    population: 15519267,
    districts: [
      'Kadıköy', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Fatih', 'Üsküdar',
      'Bakırköy', 'Zeytinburnu', 'Maltepe', 'Pendik', 'Kartal', 'Ataşehir',
      'Başakşehir', 'Beylikdüzü', 'Esenyurt', 'Küçükçekmece', 'Bahçelievler',
      'Esenler', 'Gaziosmanpaşa', 'Sultangazi', 'Arnavutköy', 'Çatalca'
    ]
  },
  {
    name: 'Ankara',
    latitude: 39.9334,
    longitude: 32.8597,
    population: 5663322,
    districts: [
      'Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Sincan', 'Etimesgut',
      'Altındağ', 'Gölbaşı', 'Pursaklar', 'Elmadağ', 'Kalecik', 'Kızılcahamam'
    ]
  },
  {
    name: 'İzmir',
    latitude: 38.4192,
    longitude: 27.1287,
    population: 4394694,
    districts: [
      'Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Çiğli', 'Gaziemir',
      'Balçova', 'Narlıdere', 'Bayraklı', 'Karabağlar', 'Torbalı', 'Menemen'
    ]
  },
  {
    name: 'Bursa',
    latitude: 40.1826,
    longitude: 29.0665,
    population: 3139744,
    districts: [
      'Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya', 'Gemlik', 'İnegöl',
      'Orhangazi', 'Karacabey', 'Mustafakemalpaşa', 'Büyükorhan'
    ]
  },
  {
    name: 'Antalya',
    latitude: 36.8969,
    longitude: 30.7133,
    population: 2619832,
    districts: [
      'Muratpaşa', 'Kepez', 'Konyaaltı', 'Aksu', 'Döşemealtı', 'Alanya',
      'Manavgat', 'Serik', 'Kaş', 'Demre', 'Finike', 'Kumluca'
    ]
  },
  {
    name: 'Adana',
    latitude: 37.0000,
    longitude: 35.3213,
    population: 2274106,
    districts: [
      'Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Karaisalı', 'Pozantı',
      'Kozan', 'Feke', 'Saimbeyli', 'Tufanbeyli', 'İmamoğlu', 'Karataş'
    ]
  }
];

export const getRandomCity = (): TurkishCity => {
  return TURKISH_CITIES[Math.floor(Math.random() * TURKISH_CITIES.length)];
};

export const getRandomDistrict = (city: TurkishCity): string => {
  return city.districts[Math.floor(Math.random() * city.districts.length)];
};

export const generateRandomCoordinates = (city: TurkishCity, radiusKm: number = 20): {
  latitude: number;
  longitude: number;
} => {
  // Generate random coordinates within radius of city center
  const radiusInDegrees = radiusKm / 111; // Rough conversion
  const randomRadius = Math.random() * radiusInDegrees;
  const randomAngle = Math.random() * 2 * Math.PI;
  
  const latitude = city.latitude + randomRadius * Math.cos(randomAngle);
  const longitude = city.longitude + randomRadius * Math.sin(randomAngle);
  
  return { latitude, longitude };
};