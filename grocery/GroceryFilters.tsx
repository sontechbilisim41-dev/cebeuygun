
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Leaf, Zap, Shield } from "lucide-react";
import { useState } from "react";

export function GroceryFilters() {
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  const brands = [
    { name: "Migros", count: 850 },
    { name: "Carrefour", count: 720 },
    { name: "BIM", count: 650 },
    { name: "Şok", count: 580 },
    { name: "A101", count: 520 },
    { name: "Metro", count: 450 },
    { name: "Macro", count: 380 },
    { name: "Real", count: 320 },
  ];

  const features = [
    "Fresh Today",
    "Organic",
    "Local Product",
    "Best Price",
    "Fast Delivery",
    "Bulk Discount",
    "New Arrival",
    "Popular",
  ];

  const dietary = [
    "Organic",
    "Gluten-Free",
    "Vegan",
    "Vegetarian",
    "Sugar-Free",
    "Low-Fat",
    "Halal",
    "Kosher",
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

  const toggleDietary = (dietary_item: string) => {
    setSelectedDietary(prev => 
      prev.includes(dietary_item) 
        ? prev.filter(d => d !== dietary_item)
        : [...prev, dietary_item]
    );
  };

  const clearAllFilters = () => {
    setPriceRange([0, 100]);
    setSelectedBrands([]);
    setSelectedFeatures([]);
    setSelectedDietary([]);
  };

  const activeFiltersCount = selectedBrands.length + selectedFeatures.length + selectedDietary.length +
    (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0);

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
              {selectedDietary.map(dietary_item => (
                <Badge key={dietary_item} variant="secondary" className="text-xs">
                  {dietary_item}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleDietary(dietary_item)}
                  />
                </Badge>
              ))}
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
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₺{priceRange[0]}</span>
            <span>₺{priceRange[1]}+</span>
          </div>
        </CardContent>
      </Card>

      {/* Stores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Stores</CardTitle>
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
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Features
          </CardTitle>
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
                className="text-sm cursor-pointer flex items-center gap-1"
              >
                {feature === "Organic" && <Leaf className="h-3 w-3 text-green-600" />}
                {feature === "Fast Delivery" && <Zap className="h-3 w-3 text-blue-600" />}
                {feature === "Best Price" && <Shield className="h-3 w-3 text-purple-600" />}
                {feature}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dietary Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Dietary Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dietary.map(dietary_item => (
            <div key={dietary_item} className="flex items-center space-x-2">
              <Checkbox
                id={`dietary-${dietary_item}`}
                checked={selectedDietary.includes(dietary_item)}
                onCheckedChange={() => toggleDietary(dietary_item)}
              />
              <label 
                htmlFor={`dietary-${dietary_item}`}
                className="text-sm cursor-pointer"
              >
                {dietary_item}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
