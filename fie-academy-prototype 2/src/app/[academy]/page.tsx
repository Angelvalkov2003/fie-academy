import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PageShell } from "@/components/Shell";
import { T, type Key } from "@/lib/i18n";
import { ACADEMIES } from "@/lib/data";

const SOON = ACADEMIES.filter((a) => a.status === "soon");

export const dynamicParams = false;

export function generateStaticParams() {
  return SOON.map((a) => ({ academy: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ academy: string }>;
}) {
  const { academy } = await params;
  const a = SOON.find((x) => x.slug === academy);
  return {
    title: a ? `${a.tab} — FIE Fencing Academy` : "FIE Fencing Academy",
  };
}

// Placeholder: academy landing pages for unopened academies are not designed yet.
export default async function ComingSoonPage({
  params,
}: {
  params: Promise<{ academy: string }>;
}) {
  const { academy } = await params;
  const a = SOON.find((x) => x.slug === academy);
  if (!a) notFound();

  return (
    <PageShell active={a.slug}>
      <Breadcrumb
        items={[
          { label: "FIE Fencing Academy", href: "/" },
          { label: <T k={`academy.${a.slug}` as Key} /> },
        ]}
      />
      <section className="weapon-head">
        <div>
          <h1 className="display-h1">
            <T k={`academy.${a.slug}` as Key} />
          </h1>
          <span className="display-fr">{a.meta}</span>
        </div>
        <p className="lede">{a.desc}</p>
      </section>
      <div
        className="chips"
        style={{ justifyContent: "flex-start", marginBottom: 28 }}
      >
        {a.branches.map((b) => (
          <span key={b.t} className="chip">
            <span className="diamond" style={{ background: "#94A3B8" }} />
            {b.t}
          </span>
        ))}
      </div>
      <span className="soon-badge" aria-disabled="true">
        <T k="home.opens" />
      </span>
    </PageShell>
  );
}
