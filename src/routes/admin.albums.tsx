import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard } from "@/components/admin-guard";
import { AlbumAdminList } from "@/components/admin-entities";

export const Route = createFileRoute("/admin/albums")({
  component: () => (
    <AdminGuard>
      <AlbumAdminList />
    </AdminGuard>
  ),
});
