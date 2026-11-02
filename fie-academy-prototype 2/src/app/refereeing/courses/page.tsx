import { CoursesView } from "@/components/refereeing/Courses";
import { RefShell } from "@/components/Shell";

export const metadata = { title: "Courses — Refereeing · FIE Fencing Academy" };

export default function CoursesPage() {
  return (
    <RefShell>
      <CoursesView />
    </RefShell>
  );
}
