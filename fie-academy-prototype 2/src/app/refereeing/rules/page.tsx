import { RulesView } from "@/components/refereeing/Docs";
import { RefShell } from "@/components/Shell";

export const metadata = { title: "Rules — Refereeing · FIE Fencing Academy" };

export default function RulesPage() {
  return (
    <RefShell>
      <RulesView />
    </RefShell>
  );
}
