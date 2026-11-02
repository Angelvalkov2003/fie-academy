import { InterpretationList } from "@/components/refereeing/Interpretation";
import { RefShell } from "@/components/Shell";

export const metadata = {
  title: "Rules & Interpretation — Refereeing · FIE Fencing Academy",
};

export default function InterpretationPage() {
  return (
    <RefShell>
      <InterpretationList />
    </RefShell>
  );
}
