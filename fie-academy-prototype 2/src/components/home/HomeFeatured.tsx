"use client";

import Link from "next/link";
import { useState } from "react";
import { ACADEMIES, type Academy } from "@/lib/data";
import { useT, type Key } from "@/lib/i18n";
import { LEVELS, lessonBySlug } from "@/lib/refereeing";
import { courseProgress, nextStep, useStore } from "@/lib/store";
import { ArrowRight } from "../Icons";
import { Logo } from "../Logo";
import { levelName } from "../refereeing/common";
import { HomeFooter, HomeHeader, type HomeVariant } from "./HomeShared";

// Academies sit on the five interior markings of a 14 m piste, left to right.
const ITEMS = [
  { slug: "event-manager", m: 2 },
  { slug: "coach", m: 5 },
  { slug: "refereeing", m: 7 },
  { slug: "semi-technical", m: 9 },
  { slug: "administration", m: 12 },
].map((x) => ({
  ...x,
  a: ACADEMIES.find((a) => a.slug === x.slug) as Academy,
}));
const METRES = [0, ...ITEMS.map((x) => x.m), 14];
// Nothing highlighted until hover/focus, so no academy is favoured; the referee waits on the centre line.
const NONE = -1;
const pct = (m: number) => `${(m / 14) * 100}%`;

/** Navy band with logo and the piste in perspective; `activeM` lights a marking. */
export function PisteHero({
  variant,
  activeM,
}: {
  variant: HomeVariant;
  activeM: number | null;
}) {
  const t = useT();
  const refereeM = activeM ?? 7;
  return (
    <section className="feat-hero">
      <HomeHeader variant={variant} dark />
      <div className="feat-hero-inner">
        <div className="hero-eyebrow">{t("home.eyebrow")}</div>
        <h1 className="hero-h1">
          <Logo height={96} className="feat-logo" />
        </h1>
        <p className="hero-prompt">{t("home.choose")}</p>
      </div>

      <div className="feat-piste-wrap" aria-hidden>
        <div className="feat-piste">
          <span className="fp-warn" style={{ left: 0 }} />
          <span className="fp-warn" style={{ right: 0 }} />
          {ITEMS.map(({ m }) => (
            <span
              key={m}
              className={`fp-line${m === 7 ? " centre" : ""}${m === activeM ? " on" : ""}`}
              style={{ left: pct(m) }}
            />
          ))}
          <span className="fp-referee" style={{ left: pct(refereeM) }} />
          {METRES.map((m) => (
            <span
              key={m}
              className={`fp-metre${m === 0 ? " start" : m === 14 ? " end" : ""}${m === activeM ? " on" : ""}`}
              style={{ left: pct(m) }}
            >
              {m} m
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomeFeatured() {
  const t = useT();
  const completed = useStore((s) => s.completed);
  const passed = useStore((s) => s.passed);
  const progress = courseProgress(completed, passed);
  const next = nextStep(completed, passed);
  const nextLesson = lessonBySlug(next.href.split("/").pop() ?? "");
  const nextLabel = nextLesson
    ? nextLesson.title
    : `${t("course.test")} · ${levelName(t, LEVELS[next.level].slug)}`;
  const [active, setActive] = useState(NONE);

  return (
    <div className="home-page feat">
      <PisteHero
        variant="featured"
        activeM={active === NONE ? null : ITEMS[active].m}
      />

      <main
        className="feat-main"
        onPointerLeave={() => setActive(NONE)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null))
            setActive(NONE);
        }}
      >
        <div className="feat-grid">
          {ITEMS.map(({ a, m }, i) => {
            const soon = a.status === "soon";
            const mine = !!a.enrolled;
            const cls = `strip-card feat-acad${soon ? " soon" : ""}${i === active ? " on" : ""}`;
            const body = (
              <>
                <span className="fa-top">
                  <span className={`sc-status${mine ? " mine" : ""}`}>
                    {soon
                      ? t("home.opens")
                      : mine
                        ? t("home.yours")
                        : t("home.open")}
                  </span>
                  <span className="fa-metre">{m} m</span>
                </span>
                <span className="sc-name">
                  {t(`academy.${a.slug}` as Key)}
                  {a.sub && <span className="fa-sub">{a.sub}</span>}
                </span>
                <span className="sc-meta">{a.meta}</span>
                <span className="sc-desc">{a.desc}</span>
                {mine && (
                  <>
                    <span className="sc-progress">
                      <span className="sc-track">
                        <span style={{ width: `${progress}%` }} />
                      </span>
                      {progress}%
                    </span>
                    <span className="fa-next">
                      {t("home.nextUp")}: <strong>{nextLabel}</strong>
                    </span>
                  </>
                )}
                {!soon && (
                  <span className="sc-cta">
                    {mine ? t("home.continue") : t("home.enter")}
                    <ArrowRight />
                  </span>
                )}
              </>
            );
            return soon ? (
              <div
                key={a.slug}
                className={cls}
                aria-disabled="true"
                onPointerEnter={() => setActive(i)}
              >
                {body}
              </div>
            ) : (
              <Link
                key={a.slug}
                href={a.href}
                className={cls}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                {body}
              </Link>
            );
          })}
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
