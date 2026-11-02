import Overview from "@/components/refereeing/Overview";
import { RefShell } from "@/components/Shell";

export const metadata = { title: "Refereeing — FIE Fencing Academy" };

export default function RefereeingIndex() {
  return (
    <RefShell>
      <Overview />
    </RefShell>
  );
}
