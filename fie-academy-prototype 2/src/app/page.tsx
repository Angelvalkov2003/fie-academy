import HomePiste from "@/components/HomePiste";
import HomeFeatured from "@/components/home/HomeFeatured";
import HomeSpotlight from "@/components/home/HomeSpotlight";
import HomeStrip from "@/components/home/HomeStrip";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  if (v === "classic") return <HomePiste />;
  if (v === "strip") return <HomeStrip />;
  if (v === "spotlight") return <HomeSpotlight />;
  return <HomeFeatured />;
}
