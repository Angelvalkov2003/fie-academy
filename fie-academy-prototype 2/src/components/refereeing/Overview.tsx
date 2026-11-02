"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { useT, type Key } from "@/lib/i18n";
import { LEVELS } from "@/lib/refereeing";
import { courseProgress, levelProgress, nextStep, useStore } from "@/lib/store";
import { Breadcrumb } from "../Breadcrumb";
import {
  ArrowRight,
  BookIcon,
  FileIcon,
  LayersIcon,
  ScaleIcon,
  VideoIcon,
} from "../Icons";
import { Bar, StatusBadge, levelName } from "./common";

const CARDS: {
  href: string;
  key: Key;
  desc: Key;
  Icon: ComponentType<{ size?: number }>;
}[] = [
  {
    href: "/refereeing/courses",
    key: "sec.courses",
    desc: "sec.courses.desc",
    Icon: LayersIcon,
  },
  {
    href: "/refereeing/fie-rules",
    key: "sec.fieRules",
    desc: "sec.fieRules.desc",
    Icon: FileIcon,
  },
  {
    href: "/refereeing/rules-interpretation",
    key: "sec.interpretation",
    desc: "sec.interpretation.desc",
    Icon: ScaleIcon,
  },
  {
    href: "/refereeing/rules",
    key: "sec.rules",
    desc: "sec.rules.desc",
    Icon: BookIcon,
  },
  {
    href: "/refereeing/video-library",
    key: "sec.videos",
    desc: "sec.videos.desc",
    Icon: VideoIcon,
  },
];

export default function Overview() {
  const t = useT();
  const completed = useStore((s) => s.completed);
  const passed = useStore((s) => s.passed);
  const pct = courseProgress(completed, passed);
  const next = nextStep(completed, passed);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "FIE Fencing Academy", href: "/" },
          { label: t("ref.title") },
        ]}
      />
      <section className="weapon-head">
        <h1 className="display-h1">{t("ref.title")}</h1>
        <p className="lede">{t("ref.lede")}</p>
      </section>

      <section className="progress-card">
        <div className="progress-card-top">
          <div>
            <div className="eyebrow">{t("ref.yourProgress")}</div>
            <div className="progress-big">{pct}%</div>
          </div>
          <Link href={next.href} className="btn-primary">
            {t("ref.continue")} · {levelName(t, LEVELS[next.level].slug)}
            <ArrowRight />
          </Link>
        </div>
        <Bar value={pct} color="var(--green)" />
        <ol className="level-steps">
          {LEVELS.map((lv, i) => {
            const p = levelProgress(completed, passed, i);
            return (
              <li key={lv.slug}>
                <span
                  className="level-square"
                  style={{ background: lv.color }}
                />
                <span className="level-step-name">{levelName(t, lv.slug)}</span>
                <StatusBadge p={p} t={t} />
              </li>
            );
          })}
        </ol>
      </section>

      <div className="section-grid">
        {CARDS.map(({ href, key, desc, Icon }) => (
          <Link key={href} href={href} className="section-card">
            <span className="section-icon">
              <Icon size={20} />
            </span>
            <span className="section-title">{t(key)}</span>
            <span className="section-desc">{t(desc)}</span>
            <ArrowRight className="section-arrow" />
          </Link>
        ))}
      </div>
    </>
  );
}
