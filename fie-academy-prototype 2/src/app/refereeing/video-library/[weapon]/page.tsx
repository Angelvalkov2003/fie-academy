import { notFound } from "next/navigation";
import { VideoLibraryView } from "@/components/refereeing/Videos";
import { RefShell } from "@/components/Shell";
import { WEAPON_SLUGS, type Weapon } from "@/lib/refereeing";

type Params = { weapon: string };

const NAMES: Record<Weapon, string> = {
  epee: "Épée",
  foil: "Foil",
  sabre: "Sabre",
};
const isWeapon = (w: string): w is Weapon =>
  (WEAPON_SLUGS as string[]).includes(w);

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return WEAPON_SLUGS.map((weapon) => ({ weapon }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { weapon } = await params;
  return {
    title: isWeapon(weapon)
      ? `${NAMES[weapon]} videos — Refereeing · FIE Fencing Academy`
      : "FIE Fencing Academy",
  };
}

export default async function WeaponVideosPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { weapon } = await params;
  if (!isWeapon(weapon)) notFound();
  return (
    <RefShell>
      <VideoLibraryView weapon={weapon} />
    </RefShell>
  );
}
