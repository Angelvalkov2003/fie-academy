"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { ACADEMIES, type Academy } from "@/lib/data";
import { useT, type Key, type TFn } from "@/lib/i18n";
import { courseProgress, useStore } from "@/lib/store";
import { ChevronRight } from "./Icons";
import { HomeFooter, HomeHeader, HomeTitle } from "./home/HomeShared";

const DEFAULT = Math.max(
  0,
  ACADEMIES.findIndex((a) => a.enrolled),
);
const pct = (m: number) => `${((m / 18) * 100).toFixed(3)}%`;
const LINES = [2, 4, 7, 9, 11, 14, 16];
const TICKS = Array.from({ length: 29 }, (_, i) => i);

const nameOf = (t: TFn, a: Academy) => t(`academy.${a.slug}` as Key);

function ctaLabel(t: TFn, a: Academy, progress: number) {
  if (a.status === "soon") return t("home.opens");
  if (a.status === "live") return `${t("home.continue")} · ${progress}%  →`;
  return `${t("home.enter")} ${nameOf(t, a)}  →`;
}

export default function HomePiste() {
  const t = useT();
  const completed = useStore((s) => s.completed);
  const passed = useStore((s) => s.passed);
  const refPct = courseProgress(completed, passed);
  const progressOf = (a: Academy) =>
    a.slug === "refereeing" ? refPct : (a.progress ?? 0);
  const [h, setH] = useState(DEFAULT);
  const pointerType = useRef("mouse");
  // Station the pointer actually rested on; brief pass-overs on the way to the CTA don't count.
  const committed = useRef(DEFAULT);
  const timers = useRef<number[]>([]);
  const act = ACADEMIES[h];

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const enterStation = (i: number) => {
    clearTimers();
    timers.current.push(
      window.setTimeout(() => setH(i), 80),
      window.setTimeout(() => (committed.current = i), 300),
    );
  };
  const select = (i: number) => {
    clearTimers();
    committed.current = i;
    setH(i);
  };
  const enterPanel = () => {
    clearTimers();
    setH(committed.current);
  };

  const onZoneBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null))
      select(DEFAULT);
  };

  return (
    <div className="home-page">
      <HomeHeader variant="classic" />

      <main className="hero">
        <div className="hero-spacer" />

        <HomeTitle />

        {/* Hover zone spans piste + info panel so the CTA stays reachable. */}
        <div
          className="piste-zone"
          onPointerLeave={(e) => e.pointerType === "mouse" && select(DEFAULT)}
          onBlur={onZoneBlur}
        >
          <div className="stage">
            <div className="piste" aria-hidden>
              <div className="piste-body" />
              <div className="piste-warn" style={{ left: "11.111%" }} />
              <div className="piste-warn" style={{ left: "77.778%" }} />
              <div className="piste-track" />
              {LINES.map((m) => {
                const w = m === 9 ? 2 : 1;
                const color =
                  act.m === m
                    ? "transparent"
                    : m === 2 || m === 16
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.7)";
                return (
                  <div
                    key={m}
                    className="piste-line"
                    style={{
                      left: pct(m),
                      width: w,
                      marginLeft: -w / 2,
                      background: color,
                    }}
                  />
                );
              })}
              {ACADEMIES.map((a, i) => (
                <div
                  key={a.slug}
                  className="piste-marker"
                  style={{ left: pct(a.m), opacity: i === h ? 0 : 1 }}
                />
              ))}
              <div className="piste-cursor" style={{ left: pct(act.m) }} />
            </div>

            <div className="ruler" aria-hidden>
              {TICKS.map((i) => (
                <div
                  key={i}
                  className="tick"
                  style={{
                    left: `${((i / 28) * 100).toFixed(3)}%`,
                    height: i % 2 === 0 ? 7 : 4,
                  }}
                />
              ))}
              {TICKS.filter((i) => i % 4 === 0).map((i) => (
                <span
                  key={i}
                  className="tick-label"
                  style={{ left: `${((i / 28) * 100).toFixed(3)}%` }}
                >
                  {i / 2} m
                </span>
              ))}
            </div>

            {ACADEMIES.map((a, i) => {
              const soon = a.status === "soon";
              return (
                <Link
                  key={a.slug}
                  href={soon ? "#" : a.href}
                  className={`station ${a.up ? "up" : "down"}${i === h ? " on" : ""}`}
                  style={{ left: pct(a.m) }}
                  aria-disabled={soon || undefined}
                  aria-label={`${nameOf(t, a)}${a.sub ? " " + a.sub : ""} — ${a.meta}`}
                  onClick={(e) => {
                    // On touch, the first tap previews the academy; the second tap opens it.
                    if (soon || (pointerType.current !== "mouse" && i !== h)) {
                      e.preventDefault();
                      select(i);
                    }
                  }}
                  onPointerDown={(e) => (pointerType.current = e.pointerType)}
                  onPointerEnter={(e) =>
                    e.pointerType === "mouse" && enterStation(i)
                  }
                  onPointerLeave={(e) =>
                    e.pointerType === "mouse" && clearTimers()
                  }
                  onFocus={() => select(i)}
                >
                  <span className="blade">
                    <span className="blade-inner">
                      <span className="blade-name">{nameOf(t, a)}</span>
                      {a.sub && <span className="blade-sub">{a.sub}</span>}
                    </span>
                  </span>
                  <span className="station-meta">{a.meta}</span>
                  {a.enrolled && (
                    <>
                      <span className="yours">
                        <span
                          className="diamond"
                          style={{ background: "var(--blue)" }}
                        />
                        {t("home.yours")} · {progressOf(a)}%
                      </span>
                      <span className="yours-track">
                        <span style={{ width: `${progressOf(a)}%` }} />
                      </span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>

          <div
            className="info-panel"
            aria-live="polite"
            onPointerEnter={(e) => e.pointerType === "mouse" && enterPanel()}
          >
            <div className="chips">
              {act.branches.map((b) => (
                <span key={b.t} className="chip">
                  <span
                    className="diamond"
                    style={{ background: b.c ?? "#94A3B8" }}
                  />
                  {b.t}
                </span>
              ))}
            </div>
            <p className="info-desc">{act.desc}</p>
            {act.status === "soon" ? (
              <span className="cta disabled" aria-disabled="true">
                {ctaLabel(t, act, progressOf(act))}
              </span>
            ) : (
              <Link href={act.href} className="cta">
                {ctaLabel(t, act, progressOf(act))}
              </Link>
            )}
          </div>
        </div>

        <nav className="piste-v" aria-label={t("nav.academies")}>
          {ACADEMIES.map((a) => {
            const soon = a.status === "soon";
            return (
              <Link
                key={a.slug}
                href={soon ? "#" : a.href}
                className={`pv-row${a.enrolled ? " mine" : ""}${soon ? " soon" : ""}`}
                aria-disabled={soon || undefined}
                onClick={soon ? (e) => e.preventDefault() : undefined}
              >
                <span className="pv-marker" />
                <span className="pv-text">
                  <span className="pv-name">
                    {nameOf(t, a)}
                    {a.sub && <span className="pv-sub"> · {a.sub}</span>}
                  </span>
                  <span className="pv-meta">{a.meta}</span>
                  {a.enrolled && (
                    <span className="yours">
                      <span
                        className="diamond"
                        style={{ background: "var(--blue)" }}
                      />
                      {t("home.yours")} · {progressOf(a)}%
                    </span>
                  )}
                </span>
                {soon ? (
                  <span className="pv-soon">2027</span>
                ) : (
                  <ChevronRight size={16} />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hero-spacer" style={{ minHeight: 16 }} />
      </main>

      <HomeFooter />
    </div>
  );
}
