import AdminView from "@/components/admin/Admin";
import { PageShell } from "@/components/Shell";

export const metadata = {
  title: "Content administration — FIE Fencing Academy",
};

export default function AdminPage() {
  return (
    <PageShell>
      <AdminView />
    </PageShell>
  );
}
