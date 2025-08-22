
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, X } from "lucide-react";
import { useState } from "react";

export function MarketplaceFilters() {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const brands = [
    { name: "Apple", count: 1250 },
    { name: "Samsung", count: 980 },
    { name: "Nike", count: 750 },
    { name: "Adidas", count: 650 },
    { name: "Sony", count: 540 },
    { name: "LG", count: 420 },
    { name: "Xiaomi", count: 380 },
    { name: "Huawei", count: 320 },
  ];

  const features = [
    "Free Shipping",
    "Fast Delivery",
    "Best Seller",
    "On Sale",
    "New Arrival",
    "Premium Quality",
    "Eco Friendly",
    "Local Vendor",
  ];

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const clearAllFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedBrands([]);
    setSelectedRating(null);
    setSelectedFeatures([]);
  };

  const activeFiltersCount = selectedBrands.length + selectedFeatures.length + 
    (selectedRating ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {selectedBrands.map(brand => (
                <Badge key={brand} variant="secondary" className="text-xs">
                  {brand}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleBrand(brand)}
                  />
                </Badge>
              ))}
              {selectedFeatures.map(feature => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleFeature(feature)}
                  />
                </Badge>
              ))}
              {selectedRating && (
                <Badge variant="secondary" className="text-xs">
                  {selectedRating}+ Stars
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSelectedRating(null)}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₺{priceRange[0]}</span>
            <span>₺{priceRange[1]}+</span>
          </div>
        </CardContent>
      </Card>

      {/* Customer Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Customer Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedRating === rating}
                onCheckedChange={(checked) => 
                  setSelectedRating(checked ? rating : null)
                }
              />
              <label 
                htmlFor={`rating-${rating}`}
                className="flex items-center gap-1 text-sm cursor-pointer"
              >
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${
                        i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-gray-600">& up</span>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Brands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Brands</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {brands.map(brand => (
            <div key={brand.name} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.name}`}
                checked={selectedBrands.includes(brand.name)}
                onCheckedChange={() => toggleBrand(brand.name)}
              />
              <label 
                htmlFor={`brand-${brand.name}`}
                className="flex items-center justify-between w-full text-sm cursor-pointer"
              >
                <span>{brand.name}</span>
                <span className="text-gray-500 text-xs">({brand.count})</span>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {features.map(feature => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={`feature-${feature}`}
                checked={selectedFeatures.includes(feature)}
                onCheckedChange={() => toggleFeature(feature)}
              />
              <label 
                htmlFor={`feature-${feature}`}
                className="text-sm cursor-pointer"
              >
                {feature}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
