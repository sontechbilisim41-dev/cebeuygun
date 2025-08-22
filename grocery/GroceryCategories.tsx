
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function GroceryCategories() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Products", emoji: "🛒", count: "10K+" },
    { id: "fruits", name: "Fruits", emoji: "🍎", count: "500+" },
    { id: "vegetables", name: "Vegetables", emoji: "🥕", count: "400+" },
    { id: "dairy", name: "Dairy", emoji: "🥛", count: "300+" },
    { id: "meat", name: "Meat & Fish", emoji: "🥩", count: "250+" },
    { id: "bakery", name: "Bakery", emoji: "🍞", count: "200+" },
    { id: "beverages", name: "Beverages", emoji: "🥤", count: "350+" },
    { id: "snacks", name: "Snacks", emoji: "🍿", count: "400+" },
    { id: "frozen", name: "Frozen", emoji: "🧊", count: "180+" },
    { id: "household", name: "Household", emoji: "🧽", count: "300+" },
    { id: "personal", name: "Personal Care", emoji: "🧴", count: "250+" },
    { id: "baby", name: "Baby Care", emoji: "🍼", count: "150+" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Badge variant="secondary" className="text-xs">
          {selectedCategory === "all" ? "All" : categories.find(c => c.id === selectedCategory)?.name}
        </Badge>
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 h-auto py-3 px-4 flex flex-col items-center gap-2 min-w-[90px] ${
                  isSelected ? "bg-orange-600 hover:bg-orange-700" : ""
                }`}
              >
                <div className="text-2xl">{category.emoji}</div>
                <div className="text-center">
                  <div className="text-xs font-medium">{category.name}</div>
                  <div className="text-xs opacity-70">{category.count}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
