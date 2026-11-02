"use client";

import Link from "next/link";
import { useState } from "react";
import { ACADEMIES, type Academy } from "@/lib/data";
import { useT, type Key } from "@/lib/i18n";
import { courseProgress, useStore } from "@/lib/store";
import { ArrowRight } from "../Icons";
import { HomeFooter, HomeHeader, HomeTitle } from "./HomeShared";

// The five interior markings of a 14 m piste; the referee stands on the centre line.
const STRIP: { slug: string; m: number }[] = [
  { slug: "event-manager", m: 2 },
  { slug: "coach", m: 5 },
  { slug: "refereeing", m: 7 },
  { slug: "semi-technical", m: 9 },
  { slug: "administration", m: 12 },
];
const PISTE_M = 14;
/** Column gap in % so card centres can be computed exactly for the connectors. */
const GAP = 1.25;
const COL = (100 - GAP * (STRIP.length - 1)) / STRIP.length;
const cardX = (i: number) => COL * (i + 0.5) + GAP * i;
const markX = (m: number) => (m / PISTE_M) * 100;

const ITEMS = STRIP.map((s) => ({
  ...s,
  a: ACADEMIES.find((a) => a.slug === s.slug) as Academy,
}));
const DEFAULT = Math.max(
  0,
  ITEMS.findIndex((x) => x.a.enrolled),
);

export default function HomeStrip() {
  const t = useT();
  const completed = useStore((s) => s.completed);
  const passed = useStore((s) => s.passed);
  const refPct = courseProgress(completed, passed);
  const [active, setActive] = useState(DEFAULT);

  return (
    <div className="home-page">
      <HomeHeader variant="strip" />

      <main className="hero">
        <div className="hero-spacer" />
        <HomeTitle />

        <div
          className="strip"
          onPointerLeave={() => setActive(DEFAULT)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null))
              setActive(DEFAULT);
          }}
        >
          <div className="strip-cards" style={{ columnGap: `${GAP}%` }}>
            {ITEMS.map(({ a, m }, i) => {
              const soon = a.status === "soon";
              const mine = !!a.enrolled;
              const progress =
                a.slug === "refereeing" ? refPct : (a.progress ?? 0);
              const cls = `strip-card${mine ? " mine" : ""}${soon ? " soon" : ""}${i === active ? " on" : ""}`;
              const body = (
                <>
                  <span className="sc-mark">{m} m</span>
                  <span className="sc-status">
                    {soon
                      ? t("home.opens")
                      : mine
                        ? t("home.yours")
                        : t("home.open")}
                  </span>
                  <span className="sc-name">
                    {t(`academy.${a.slug}` as Key)}
                    {a.sub && <span className="sc-sub"> · {a.sub}</span>}
                  </span>
                  <span className="sc-meta">{a.meta}</span>
                  <span className="sc-desc">{a.desc}</span>
                  {mine && (
                    <span className="sc-progress">
                      <span className="sc-track">
                        <span style={{ width: `${progress}%` }} />
                      </span>
                      {progress}%
                    </span>
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

          <svg
            className="strip-connectors"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {ITEMS.map(({ m }, i) => (
              <line
                key={m}
                x1={cardX(i)}
                y1={0}
                x2={markX(m)}
                y2={100}
                className={i === active ? "on" : ""}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          <div className="strip-piste" aria-hidden>
            <span className="strip-warn" style={{ left: 0 }} />
            <span className="strip-warn" style={{ right: 0 }} />
            {ITEMS.map(({ m }, i) => (
              <span
                key={m}
                className={`strip-line${m === 7 ? " centre" : ""}${i === active ? " on" : ""}`}
                style={{ left: `${markX(m)}%` }}
              />
            ))}
            <span
              className="strip-referee"
              style={{ left: `${markX(ITEMS[active].m)}%` }}
            />
          </div>

          <div className="strip-labels" aria-hidden>
            <span className="end-l">0 m</span>
            {ITEMS.map(({ m }, i) => (
              <span
                key={m}
                className={i === active ? "on" : ""}
                style={{ left: `${markX(m)}%` }}
              >
                {m} m
              </span>
            ))}
            <span className="end-r">14 m</span>
          </div>
        </div>

        <div className="hero-spacer" />
      </main>

      <HomeFooter />
    </div>
  );
}
