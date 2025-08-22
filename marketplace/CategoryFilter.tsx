
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Smartphone, 
  Laptop, 
  Shirt, 
  Home, 
  Gamepad2, 
  Book, 
  Car,
  Heart,
  Baby,
  Dumbbell
} from "lucide-react";
import { useState } from "react";

export function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Categories", icon: null, count: "1M+" },
    { id: "electronics", name: "Electronics", icon: Smartphone, count: "150K+" },
    { id: "computers", name: "Computers", icon: Laptop, count: "80K+" },
    { id: "fashion", name: "Fashion", icon: Shirt, count: "200K+" },
    { id: "home", name: "Home & Garden", icon: Home, count: "120K+" },
    { id: "gaming", name: "Gaming", icon: Gamepad2, count: "45K+" },
    { id: "books", name: "Books", icon: Book, count: "90K+" },
    { id: "automotive", name: "Automotive", icon: Car, count: "35K+" },
    { id: "health", name: "Health & Beauty", icon: Heart, count: "75K+" },
    { id: "baby", name: "Baby & Kids", icon: Baby, count: "60K+" },
    { id: "sports", name: "Sports", icon: Dumbbell, count: "55K+" },
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
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 h-auto py-3 px-4 flex flex-col items-center gap-2 min-w-[100px] ${
                  isSelected ? "bg-red-600 hover:bg-red-700" : ""
                }`}
              >
                {IconComponent && <IconComponent className="h-5 w-5" />}
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
