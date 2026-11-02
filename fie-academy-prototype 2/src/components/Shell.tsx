"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useT, type Key } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Logo } from "./Logo";
import { TopBar } from "./TopBar";

export const REF_SECTIONS: { href: string; key: Key; exact?: boolean }[] = [
  { href: "/refereeing", key: "sec.overview", exact: true },
  { href: "/refereeing/courses", key: "sec.courses" },
  { href: "/refereeing/fie-rules", key: "sec.fieRules" },
  { href: "/refereeing/rules-interpretation", key: "sec.interpretation" },
  { href: "/refereeing/rules", key: "sec.rules", exact: true },
  { href: "/refereeing/video-library", key: "sec.videos" },
];

export function ContentLangNote() {
  const lang = useStore((s) => s.lang);
  const t = useT();
  if (lang === "en") return null;
  return <div className="lang-note">{t("demo.contentEnglish")}</div>;
}

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo height={30} color="var(--navy)" />
          <span>© 2026 {t("footer.fie")}</span>
        </div>
        <div className="site-footer-links">
          {(["footer.contact", "footer.privacy", "footer.terms"] as const).map(
            (l) => (
              <a
                key={l}
                href="#"
                className="link-muted"
                onClick={(e) => e.preventDefault()}
              >
                {t(l)}
              </a>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}

/** Top bar + Refereeing section navigation. */
export function RefShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useT();
  return (
    <div className="page-shell">
      <div className="sticky-head">
        <TopBar active="refereeing" />
        <nav className="subnav" aria-label={t("ref.title")}>
          <span className="subnav-label">{t("ref.title")}</span>
          {REF_SECTIONS.map((s) => {
            const on = s.exact
              ? pathname === s.href
              : pathname.startsWith(s.href);
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`tab${on ? " on" : ""}`}
                aria-current={on ? "page" : undefined}
              >
                {t(s.key)}
              </Link>
            );
          })}
        </nav>
        <ContentLangNote />
      </div>
      <main className="page-main">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageShell({
  active,
  children,
}: {
  active?: string;
  children: ReactNode;
}) {
  return (
    <div className="page-shell">
      <div className="sticky-head">
        <TopBar active={active} />
      </div>
      <main className="page-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
