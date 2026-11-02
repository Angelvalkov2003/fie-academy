import { FieRulesView } from "@/components/refereeing/Docs";
import { RefShell } from "@/components/Shell";

export const metadata = {
  title: "FIE Rules — Refereeing · FIE Fencing Academy",
};

export default function FieRulesPage() {
  return (
    <RefShell>
      <FieRulesView />
    </RefShell>
  );
}
