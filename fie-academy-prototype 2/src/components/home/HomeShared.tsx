"use client";

import Link from "next/link";
import { useT, type Key } from "@/lib/i18n";
import { Logo } from "../Logo";
import { AccountMenu, LangToggle } from "../TopBar";

export type HomeVariant = "strip" | "featured" | "spotlight" | "classic";

const VARIANTS: { id: HomeVariant; href: string; key: Key }[] = [
  { id: "featured", href: "/", key: "home.layoutFeatured" },
  { id: "strip", href: "/?v=strip", key: "home.layoutStrip" },
  { id: "spotlight", href: "/?v=spotlight", key: "home.layoutSpotlight" },
  { id: "classic", href: "/?v=classic", key: "home.layoutClassic" },
];

/** Demo-only switch so the home layouts can be compared. */
function LayoutSwitch({ variant }: { variant: HomeVariant }) {
  const t = useT();
  return (
    <div
      className="lang layout-switch"
      role="group"
      aria-label={t("home.layout")}
    >
      {VARIANTS.map((v) => (
        <Link
          key={v.id}
          href={v.href}
          className={variant === v.id ? "on" : ""}
          aria-current={variant === v.id || undefined}
        >
          {t(v.key)}
        </Link>
      ))}
    </div>
  );
}

export function HomeHeader({
  variant,
  dark,
}: {
  variant: HomeVariant;
  dark?: boolean;
}) {
  return (
    <header className={`home-header${dark ? " dark" : ""}`}>
      <div className="utils">
        <LayoutSwitch variant={variant} />
        <LangToggle />
        <AccountMenu />
      </div>
    </header>
  );
}

export function HomeTitle() {
  const t = useT();
  return (
    <div className="hero-title">
      <div className="hero-eyebrow">{t("home.eyebrow")}</div>
      <h1 className="hero-h1">
        <Logo height={120} color="var(--navy)" className="hero-logo" />
      </h1>
      <p className="hero-prompt">{t("home.choose")}</p>
    </div>
  );
}

export { SiteFooter as HomeFooter } from "../Shell";
