
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, X, Clock, Truck } from "lucide-react";
import { useState } from "react";

export function FoodDeliveryFilters() {
  const [deliveryTimeRange, setDeliveryTimeRange] = useState([0, 60]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  const features = [
    "Free Delivery",
    "Fast Delivery (< 30 min)",
    "Open Now",
    "Accepts Vouchers",
    "New Restaurant",
    "Popular",
    "Promoted",
    "Halal",
  ];

  const offers = [
    "Buy 1 Get 1 Free",
    "20% Off",
    "Free Dessert",
    "Combo Deals",
    "Student Discount",
    "First Order Discount",
    "Weekend Special",
    "Happy Hour",
  ];

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const toggleOffer = (offer: string) => {
    setSelectedOffers(prev => 
      prev.includes(offer) 
        ? prev.filter(o => o !== offer)
        : [...prev, offer]
    );
  };

  const clearAllFilters = () => {
    setDeliveryTimeRange([0, 60]);
    setSelectedFeatures([]);
    setSelectedRating(null);
    setSelectedOffers([]);
  };

  const activeFiltersCount = selectedFeatures.length + selectedOffers.length + 
    (selectedRating ? 1 : 0) + (deliveryTimeRange[0] > 0 || deliveryTimeRange[1] < 60 ? 1 : 0);

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
              {selectedFeatures.map(feature => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleFeature(feature)}
                  />
                </Badge>
              ))}
              {selectedOffers.map(offer => (
                <Badge key={offer} variant="secondary" className="text-xs">
                  {offer}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleOffer(offer)}
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

      {/* Delivery Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Delivery Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={deliveryTimeRange}
            onValueChange={setDeliveryTimeRange}
            max={60}
            step={5}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{deliveryTimeRange[0]} min</span>
            <span>{deliveryTimeRange[1]}+ min</span>
          </div>
        </CardContent>
      </Card>

      {/* Customer Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Customer Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[5, 4, 3, 2].map(rating => (
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

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Truck className="h-4 w-4" />
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
                className="text-sm cursor-pointer"
              >
                {feature}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Offers & Deals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Offers & Deals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {offers.map(offer => (
            <div key={offer} className="flex items-center space-x-2">
              <Checkbox
                id={`offer-${offer}`}
                checked={selectedOffers.includes(offer)}
                onCheckedChange={() => toggleOffer(offer)}
              />
              <label 
                htmlFor={`offer-${offer}`}
                className="text-sm cursor-pointer"
              >
                {offer}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
