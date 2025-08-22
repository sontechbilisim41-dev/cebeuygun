
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MarketplaceFilters } from "./MarketplaceFilters";

export function MarketplaceHeader() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-white dark:bg-gray-900 border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Marketplace
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Discover millions of products from thousands of vendors
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
                  <MarketplaceFilters />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button size="lg" className="px-8">
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
