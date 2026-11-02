import { notFound } from "next/navigation";
import { LevelView } from "@/components/refereeing/Courses";
import { RefShell } from "@/components/Shell";
import { LEVELS, levelBySlug } from "@/lib/refereeing";

type Params = { level: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return LEVELS.map((l) => ({ level: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const lv = levelBySlug((await params).level);
  return {
    title: lv
      ? `${lv.name} — Refereeing · FIE Fencing Academy`
      : "FIE Fencing Academy",
  };
}

export default async function LevelPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { level } = await params;
  if (!levelBySlug(level)) notFound();
  return (
    <RefShell>
      <LevelView slug={level} />
    </RefShell>
  );
}
