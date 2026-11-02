import { notFound } from "next/navigation";
import LessonView from "@/components/refereeing/Lesson";
import { LEVELS, lessonBySlug, levelBySlug } from "@/lib/refereeing";

type Params = { level: string; module: string; lesson: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return LEVELS.flatMap((lv) =>
    lv.modules.flatMap((m) =>
      m.lessons.map((lesson) => ({ level: lv.slug, module: m.slug, lesson })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const l = lessonBySlug((await params).lesson);
  return {
    title: l
      ? `${l.title} — Refereeing · FIE Fencing Academy`
      : "FIE Fencing Academy",
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { level, module, lesson } = await params;
  const valid = levelBySlug(level)
    ?.modules.find((m) => m.slug === module)
    ?.lessons.includes(lesson);
  if (!valid) notFound();
  return (
    <LessonView levelSlug={level} moduleSlug={module} lessonSlug={lesson} />
  );
}
