
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AIModeration } from "@/components/admin/AIModeration";

export default function AIModerationPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Moderasyon</h1>
          <p className="text-muted-foreground">
            Yapay zeka destekli içerik moderasyonu ve spam tespiti
          </p>
        </div>
        <AIModeration />
      </div>
    </AdminLayout>
  );
}
