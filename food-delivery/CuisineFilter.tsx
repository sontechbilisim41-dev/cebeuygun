
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function CuisineFilter() {
  const [selectedCuisine, setSelectedCuisine] = useState("all");

  const cuisines = [
    { id: "all", name: "All Cuisines", emoji: "🍽️", count: "2.5K+" },
    { id: "turkish", name: "Turkish", emoji: "🥙", count: "850+" },
    { id: "pizza", name: "Pizza", emoji: "🍕", count: "320+" },
    { id: "burger", name: "Burgers", emoji: "🍔", count: "280+" },
    { id: "asian", name: "Asian", emoji: "🍜", count: "240+" },
    { id: "italian", name: "Italian", emoji: "🍝", count: "180+" },
    { id: "mexican", name: "Mexican", emoji: "🌮", count: "150+" },
    { id: "indian", name: "Indian", emoji: "🍛", count: "120+" },
    { id: "chinese", name: "Chinese", emoji: "🥡", count: "110+" },
    { id: "seafood", name: "Seafood", emoji: "🦐", count: "95+" },
    { id: "dessert", name: "Desserts", emoji: "🍰", count: "200+" },
    { id: "healthy", name: "Healthy", emoji: "🥗", count: "160+" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Cuisines</h2>
        <Badge variant="secondary" className="text-xs">
          {selectedCuisine === "all" ? "All" : cuisines.find(c => c.id === selectedCuisine)?.name}
        </Badge>
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4">
          {cuisines.map((cuisine) => {
            const isSelected = selectedCuisine === cuisine.id;
            
            return (
              <Button
                key={cuisine.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCuisine(cuisine.id)}
                className={`flex-shrink-0 h-auto py-3 px-4 flex flex-col items-center gap-2 min-w-[90px] ${
                  isSelected ? "bg-green-600 hover:bg-green-700" : ""
                }`}
              >
                <div className="text-2xl">{cuisine.emoji}</div>
                <div className="text-center">
                  <div className="text-xs font-medium">{cuisine.name}</div>
                  <div className="text-xs opacity-70">{cuisine.count}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
