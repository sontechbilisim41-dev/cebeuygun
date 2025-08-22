
import { MainLayout } from "@/components/layout/MainLayout";
import { FoodDeliveryHeader } from "@/components/food-delivery/FoodDeliveryHeader";
import { CuisineFilter } from "@/components/food-delivery/CuisineFilter";
import { RestaurantGrid } from "@/components/food-delivery/RestaurantGrid";
import { FoodDeliveryFilters } from "@/components/food-delivery/FoodDeliveryFilters";

export default function FoodDeliveryPage() {
  return (
    <MainLayout>
      <div className="w-full">
        <FoodDeliveryHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <FoodDeliveryFilters />
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              <CuisineFilter />
              <RestaurantGrid />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
