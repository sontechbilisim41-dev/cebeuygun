
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Zap, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GroceryFilters } from "./GroceryFilters";

export function GroceryHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Beşiktaş, Istanbul");

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-b">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Rapid Grocery
                </h1>
                <Badge className="bg-orange-600 text-white">
                  <Zap className="h-3 w-3 mr-1" />
                  30 min delivery
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Fresh groceries delivered to your door in 30 minutes or less
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
                  <GroceryFilters />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Location and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Location */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border">
              <MapPin className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-sm font-medium">Deliver to</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{location}</div>
              </div>
              <Button variant="ghost" size="sm" className="text-orange-600">
                Change
              </Button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search for groceries, brands, or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-800"
                />
              </div>
              <Button size="lg" className="px-8 bg-orange-600 hover:bg-orange-700">
                Search
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>30-minute delivery guarantee</span>
            </div>
            <div>•</div>
            <div>50+ dark stores in your area</div>
            <div>•</div>
            <div>Fresh products daily</div>
          </div>
        </div>
      </div>
    </div>
  );
}
