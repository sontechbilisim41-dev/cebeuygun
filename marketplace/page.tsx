
import { MainLayout } from "@/components/layout/MainLayout";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { CategoryFilter } from "@/components/marketplace/CategoryFilter";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";

export default function MarketplacePage() {
  return (
    <MainLayout>
      <div className="w-full">
        <MarketplaceHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <MarketplaceFilters />
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              <CategoryFilter />
              <ProductGrid />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
