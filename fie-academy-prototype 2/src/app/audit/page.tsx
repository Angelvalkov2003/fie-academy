import AuditView from "@/components/admin/Audit";
import { PageShell } from "@/components/Shell";

export const metadata = { title: "Activity log — FIE Fencing Academy" };

export default function AuditPage() {
  return (
    <PageShell>
      <AuditView />
    </PageShell>
  );
}
