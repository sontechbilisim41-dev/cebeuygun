
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Smartphone, 
  Laptop, 
  Shirt, 
  Home, 
  Car, 
  Book,
  Gamepad2,
  Heart,
  Baby,
  Dumbbell,
  ChevronRight,
  Star
} from "lucide-react";
import { useState } from "react";

const categories = [
  { id: 1, name: "Elektronik", icon: Smartphone, count: 2500000, subcategories: ["Telefon", "Bilgisayar", "TV", "Ses Sistemleri"] },
  { id: 2, name: "Moda", icon: Shirt, count: 1800000, subcategories: ["Kadın", "Erkek", "Çocuk", "Ayakkabı"] },
  { id: 3, name: "Ev & Yaşam", icon: Home, count: 1200000, subcategories: ["Mobilya", "Dekorasyon", "Mutfak", "Banyo"] },
  { id: 4, name: "Otomotiv", icon: Car, count: 800000, subcategories: ["Yedek Parça", "Aksesuar", "Bakım", "Lastik"] },
  { id: 5, name: "Kitap", icon: Book, count: 500000, subcategories: ["Roman", "Akademik", "Çocuk", "Dergi"] },
  { id: 6, name: "Oyun", icon: Gamepad2, count: 300000, subcategories: ["Konsol", "PC Oyun", "Mobil", "Aksesuar"] },
  { id: 7, name: "Sağlık", icon: Heart, count: 250000, subcategories: ["Vitamin", "Kozmetik", "Medikal", "Fitness"] },
  { id: 8, name: "Bebek", icon: Baby, count: 200000, subcategories: ["Giyim", "Oyuncak", "Beslenme", "Bakım"] },
  { id: 9, name: "Spor", icon: Dumbbell, count: 180000, subcategories: ["Fitness", "Outdoor", "Takım Sporları", "Su Sporları"] }
];

const brands = [
  { name: "Apple", count: 15000 },
  { name: "Samsung", count: 12000 },
  { name: "Nike", count: 8000 },
  { name: "Adidas", count: 7500 },
  { name: "Sony", count: 6000 },
  { name: "LG", count: 5500 },
  { name: "Zara", count: 4800 },
  { name: "H&M", count: 4200 }
];

export function CategorySidebar() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kategoriler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <div key={category.id}>
                <Button
                  variant={isSelected ? "secondary" : "ghost"}
                  className="w-full justify-between h-auto p-3"
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {(category.count / 1000).toFixed(0)}K
                    </Badge>
                    <ChevronRight className={`h-3 w-3 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </Button>
                
                {isSelected && (
                  <div className="ml-6 mt-2 space-y-1">
                    {category.subcategories.map((sub, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs text-muted-foreground"
                      >
                        {sub}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fiyat Aralığı</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={10000}
              step={50}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </CardContent>
      </Card>

      {/* Brands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Markalar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {brands.map((brand) => (
            <div key={brand.name} className="flex items-center space-x-2">
              <Checkbox
                id={brand.name}
                checked={selectedBrands.includes(brand.name)}
                onCheckedChange={() => toggleBrand(brand.name)}
              />
              <label
                htmlFor={brand.name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
              >
                {brand.name}
              </label>
              <Badge variant="outline" className="text-xs">
                {brand.count}
              </Badge>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full">
            Daha Fazla Göster
          </Button>
        </CardContent>
      </Card>

      {/* Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Değerlendirme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={minRating === rating ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
            >
              <div className="flex items-center space-x-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`}
                  />
                ))}
                <span className="text-sm">ve üzeri</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Clear Filters */}
      <Button variant="outline" className="w-full">
        Filtreleri Temizle
      </Button>
    </div>
  );
}
