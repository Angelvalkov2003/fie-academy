"use client";

import Link from "next/link";
import { ACADEMIES, type Academy } from "@/lib/data";
import { useT, type Key } from "@/lib/i18n";
import { LEVELS, lessonBySlug } from "@/lib/refereeing";
import { courseProgress, levelProgress, nextStep, useStore } from "@/lib/store";
import { ArrowRight, CheckIcon, LockIcon } from "../Icons";
import { levelName } from "../refereeing/common";
import { PisteHero } from "./HomeFeatured";
import { HomeFooter } from "./HomeShared";

const mine = ACADEMIES.find((a) => a.enrolled) as Academy;
const others = ACADEMIES.filter((a) => a !== mine);

export default function HomeSpotlight() {
  const t = useT();
  const completed = useStore((s) => s.completed);
  const passed = useStore((s) => s.passed);
  const progress = courseProgress(completed, passed);
  const next = nextStep(completed, passed);
  const nextLesson = lessonBySlug(next.href.split("/").pop() ?? "");
  const nextLabel = nextLesson
    ? nextLesson.title
    : `${t("course.test")} · ${levelName(t, LEVELS[next.level].slug)}`;

  return (
    <div className="home-page feat">
      <PisteHero variant="spotlight" activeM={7} />

      <main className="feat-main spot-main">
        <Link href={mine.href} className="feat-card">
          <div className="feat-card-main">
            <span className="sc-status mine">{t("home.yours")}</span>
            <h2 className="feat-card-name">
              {t(`academy.${mine.slug}` as Key)}
            </h2>
            <p className="feat-card-desc">{mine.desc}</p>
            <ol className="feat-levels">
              {LEVELS.map((lv, i) => {
                const p = levelProgress(completed, passed, i);
                return (
                  <li key={lv.slug} className={p.unlocked ? "" : "locked"}>
                    <span
                      className="level-square"
                      style={{ background: lv.color }}
                    />
                    {levelName(t, lv.slug)}
                    {p.passed && <CheckIcon size={12} strokeWidth={3} />}
                    {!p.unlocked && <LockIcon size={11} />}
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="feat-card-side">
            <div className="feat-pct">{progress}%</div>
            <span className="sc-track">
              <span style={{ width: `${progress}%` }} />
            </span>
            <div className="eyebrow" style={{ marginTop: 18 }}>
              {t("home.nextUp")}
            </div>
            <div className="feat-next">{nextLabel}</div>
            <span className="btn-primary feat-cta">
              {t("home.continue")}
              <ArrowRight />
            </span>
          </div>
        </Link>

        <div className="eyebrow spot-others-title">{t("home.others")}</div>
        <div className="spot-grid">
          {others.map((a) => {
            const soon = a.status === "soon";
            const body = (
              <>
                <span className="sc-status">
                  {soon ? t("home.opens") : t("home.open")}
                </span>
                <span className="sc-name">
                  {t(`academy.${a.slug}` as Key)}
                  {a.sub && <span className="fa-sub">{a.sub}</span>}
                </span>
                <span className="sc-meta">{a.meta}</span>
                <span className="sc-desc">{a.desc}</span>
                {!soon && (
                  <span className="sc-cta">
                    {t("home.enter")}
                    <ArrowRight />
                  </span>
                )}
              </>
            );
            return soon ? (
              <div
                key={a.slug}
                className="strip-card soon"
                aria-disabled="true"
              >
                {body}
              </div>
            ) : (
              <Link key={a.slug} href={a.href} className="strip-card">
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
