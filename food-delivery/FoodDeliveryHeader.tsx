
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FoodDeliveryFilters } from "./FoodDeliveryFilters";

export function FoodDeliveryHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Kadıköy, Istanbul");

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Food Delivery
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Order from your favorite restaurants and get it delivered hot & fresh
              </p>
            </div>
            
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FoodDeliveryFilters />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Location and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Location */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium">Deliver to</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{location}</div>
              </div>
              <Button variant="ghost" size="sm" className="text-green-600">
                Change
              </Button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search for restaurants, cuisines, or dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-800"
                />
              </div>
              <Button size="lg" className="px-8 bg-green-600 hover:bg-green-700">
                Search
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Average delivery: 30-45 min</span>
            </div>
            <div>•</div>
            <div>2,500+ restaurants available</div>
            <div>•</div>
            <div>Free delivery on orders over ₺50</div>
          </div>
        </div>
      </div>
    </div>
  );
}
