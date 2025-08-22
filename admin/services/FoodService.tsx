
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  UtensilsCrossed, 
  Search, 
  Plus, 
  Edit, 
  Eye,
  Star,
  Clock,
  CheckCircle,
  MapPin,
  Phone
} from 'lucide-react';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  cuisine_types: string[];
  phone: string;
  email?: string;
  address: string;
  min_order_amount: number;
  delivery_fee: number;
  delivery_time_min: number;
  delivery_time_max: number;
  is_active: boolean;
  is_open: boolean;
  rating: number;
  total_orders: number;
  create_time: string;
}

interface MenuItem {
  id: number;
  restaurant_id: number;
  restaurant_name: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  is_available: boolean;
  is_popular: boolean;
  preparation_time: number;
}

export function FoodService() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'restaurants' | 'menu'>('restaurants');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock restaurants data
      const mockRestaurants: Restaurant[] = [
        {
          id: 1,
          name: 'Pizza Palace',
          slug: 'pizza-palace',
          cuisine_types: ['Italian', 'Pizza'],
          phone: '+90 212 555 0101',
          email: 'info@pizzapalace.com',
          address: 'Taksim Mah. İstiklal Cad. No:45, Beyoğlu, İstanbul',
          min_order_amount: 50.00,
          delivery_fee: 8.50,
          delivery_time_min: 25,
          delivery_time_max: 40,
          is_active: true,
          is_open: true,
          rating: 4.6,
          total_orders: 2450,
          create_time: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Burger House',
          slug: 'burger-house',
          cuisine_types: ['American', 'Fast Food'],
          phone: '+90 212 555 0102',
          address: 'Kadıköy Mah. Bahariye Cad. No:78, Kadıköy, İstanbul',
          min_order_amount: 40.00,
          delivery_fee: 7.00,
          delivery_time_min: 20,
          delivery_time_max: 35,
          is_active: true,
          is_open: false,
          rating: 4.3,
          total_orders: 1890,
          create_time: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          name: 'Sushi Zen',
          slug: 'sushi-zen',
          cuisine_types: ['Japanese', 'Sushi'],
          phone: '+90 212 555 0103',
          email: 'orders@sushizen.com',
          address: 'Nişantaşı Mah. Teşvikiye Cad. No:12, Şişli, İstanbul',
          min_order_amount: 80.00,
          delivery_fee: 12.00,
          delivery_time_min: 35,
          delivery_time_max: 50,
          is_active: false,
          is_open: false,
          rating: 4.8,
          total_orders: 756,
          create_time: '2024-01-03T00:00:00Z'
        }
      ];

      // Mock menu items data
      const mockMenuItems: MenuItem[] = [
        {
          id: 1,
          restaurant_id: 1,
          restaurant_name: 'Pizza Palace',
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
          price: 45.00,
          category: 'Pizza',
          is_available: true,
          is_popular: true,
          preparation_time: 15
        },
        {
          id: 2,
          restaurant_id: 1,
          restaurant_name: 'Pizza Palace',
          name: 'Pepperoni Pizza',
          description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
          price: 52.00,
          category: 'Pizza',
          is_available: true,
          is_popular: true,
          preparation_time: 15
        },
        {
          id: 3,
          restaurant_id: 2,
          restaurant_name: 'Burger House',
          name: 'Classic Cheeseburger',
          description: 'Beef patty with cheese, lettuce, tomato, and special sauce',
          price: 38.00,
          category: 'Burgers',
          is_available: true,
          is_popular: false,
          preparation_time: 12
        },
        {
          id: 4,
          restaurant_id: 3,
          restaurant_name: 'Sushi Zen',
          name: 'Salmon Sashimi',
          description: 'Fresh salmon slices served with wasabi and ginger',
          price: 65.00,
          category: 'Sashimi',
          is_available: false,
          is_popular: true,
          preparation_time: 10
        }
      ];
      
      setTimeout(() => {
        setRestaurants(mockRestaurants);
        setMenuItems(mockMenuItems);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine_types.some(cuisine => 
      cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getCuisineBadges = (cuisines: string[]) => {
    return cuisines.map((cuisine, index) => (
      <Badge key={index} variant="outline" className="text-xs">
        {cuisine}
      </Badge>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Food Service Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage restaurants, menus, and food delivery operations
          </p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-red-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add New Restaurant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Restaurants
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  156
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Open Now
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  89
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Menu Items
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  3,240
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Prep Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  22min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'restaurants'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Restaurants
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'menu'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Menu Items
        </button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'restaurants' ? 'Restaurant Management' : 'Menu Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={
                  activeTab === 'restaurants' 
                    ? "Search restaurants by name, cuisine, or address..." 
                    : "Search menu items by name, restaurant, or category..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              Filter
            </Button>
            <Button variant="outline">
              Export
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : activeTab === 'restaurants' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Cuisine</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Delivery Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {restaurant.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          @{restaurant.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getCuisineBadges(restaurant.cuisine_types)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {restaurant.phone}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-32">
                            {restaurant.address}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>
                          Min: {formatPrice(restaurant.min_order_amount)}
                        </div>
                        <div>
                          Fee: {formatPrice(restaurant.delivery_fee)}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {restaurant.delivery_time_min}-{restaurant.delivery_time_max} min
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          variant={restaurant.is_active ? 'default' : 'secondary'}
                          className={restaurant.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                        >
                          {restaurant.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {restaurant.is_active && (
                          <Badge 
                            variant={restaurant.is_open ? 'default' : 'secondary'}
                            className={restaurant.is_open ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                          >
                            {restaurant.is_open ? 'Open' : 'Closed'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderRating(restaurant.rating)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {restaurant.total_orders.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Prep Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-64">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {item.restaurant_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatPrice(item.price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">
                          {item.preparation_time} min
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          variant={item.is_available ? 'default' : 'secondary'}
                          className={item.is_available ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                        >
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                        {item.is_popular && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
