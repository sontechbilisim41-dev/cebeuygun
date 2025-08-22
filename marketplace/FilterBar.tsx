
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useState } from "react";

const sortOptions = [
  { value: "relevance", label: "En Uygun" },
  { value: "price_asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "price_desc", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "rating", label: "En Yüksek Puan" },
  { value: "newest", label: "En Yeni" },
  { value: "bestseller", label: "En Çok Satan" }
];

export function FilterBar() {
  const [sortBy, setSortBy] = useState("relevance");
  const [activeFilters, setActiveFilters] = useState([
    "Elektronik",
    "Apple",
    "1000₺ - 5000₺"
  ]);

  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-background border rounded-lg">
      {/* Active Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Filtreler:</span>
        {activeFilters.length > 0 ? (
          <>
            {activeFilters.map((filter) => (
              <Badge key={filter} variant="secondary" className="gap-1">
                {filter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => removeFilter(filter)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground"
            >
              Tümünü Temizle
            </Button>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Filtre seçilmedi</span>
        )}
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Sırala:</span>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
