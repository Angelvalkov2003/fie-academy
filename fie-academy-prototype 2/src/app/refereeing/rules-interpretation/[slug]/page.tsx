import { notFound } from "next/navigation";
import { InterpretationDetail } from "@/components/refereeing/Interpretation";
import { RefShell } from "@/components/Shell";
import { INTERPRETATIONS } from "@/lib/refereeing";

type Params = { slug: string };

const WITH_VIDEO = INTERPRETATIONS.filter((i) => i.video);

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return WITH_VIDEO.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const it = WITH_VIDEO.find((i) => i.slug === slug);
  return {
    title: it
      ? `${it.ref} ${it.title} — Refereeing · FIE Fencing Academy`
      : "FIE Fencing Academy",
  };
}

export default async function InterpretationDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!WITH_VIDEO.some((i) => i.slug === slug)) notFound();
  return (
    <RefShell>
      <InterpretationDetail slug={slug} />
    </RefShell>
  );
}
