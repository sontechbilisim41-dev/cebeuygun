
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  return (
    <section className="relative bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Everything You Need,
          <span className="text-red-600 dark:text-red-400"> Delivered Fast</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Shop from thousands of products, order delicious food, or get groceries delivered in 30 minutes. 
          All in one platform.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for products, restaurants, or groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-0 focus-visible:ring-0 text-lg"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Enter your location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-12 border-0 focus-visible:ring-0 text-lg"
              />
            </div>
            <Button size="lg" className="h-12 px-8 bg-red-600 hover:bg-red-700">
              Search
            </Button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/marketplace">
            <Button variant="outline" size="lg" className="h-12 px-6">
              Browse Marketplace
            </Button>
          </Link>
          <Link href="/food-delivery">
            <Button variant="outline" size="lg" className="h-12 px-6">
              Order Food
            </Button>
          </Link>
          <Link href="/grocery">
            <Button variant="outline" size="lg" className="h-12 px-6">
              Quick Grocery
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
