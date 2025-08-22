
import { MainLayout } from "@/components/layout/MainLayout";
import { GroceryHeader } from "@/components/grocery/GroceryHeader";
import { GroceryCategories } from "@/components/grocery/GroceryCategories";
import { GroceryGrid } from "@/components/grocery/GroceryGrid";
import { GroceryFilters } from "@/components/grocery/GroceryFilters";

export default function GroceryPage() {
  return (
    <MainLayout>
      <div className="w-full">
        <GroceryHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <GroceryFilters />
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              <GroceryCategories />
              <GroceryGrid />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
