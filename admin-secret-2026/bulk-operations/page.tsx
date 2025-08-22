
import { AdminLayout } from "@/components/admin/AdminLayout";
import { BulkOperations } from "@/components/admin/BulkOperations";

export default function BulkOperationsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Toplu İşlemler</h1>
          <p className="text-muted-foreground">
            Ürün, kategori ve stok bilgilerini toplu olarak yönetin
          </p>
        </div>
        <BulkOperations />
      </div>
    </AdminLayout>
  );
}
