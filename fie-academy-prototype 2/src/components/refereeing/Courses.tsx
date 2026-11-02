"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import {
  LEVELS,
  PASS_MARK,
  TEST_SIZE,
  fmtDuration,
  lessonBySlug,
  lessonHref,
  lessonKey,
} from "@/lib/refereeing";
import { levelProgress, useStore, type Lang } from "@/lib/store";
import { Breadcrumb } from "../Breadcrumb";
import { ArrowRight, CheckIcon, ChevronRight, LockIcon } from "../Icons";
import { Bar, StatusBadge, levelName, moduleName } from "./common";

export const fmtDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export function CoursesView() {
  const t = useT();
  const completed = useStore((s) => s.completed);
  const passed = useStore((s) => s.passed);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "FIE Fencing Academy", href: "/" },
          { label: t("ref.title"), href: "/refereeing" },
          { label: t("sec.courses") },
        ]}
      />
      <section className="weapon-head">
        <h1 className="display-h1">{t("sec.courses")}</h1>
        <p className="lede">{t("sec.courses.desc")}</p>
      </section>

      <div className="level-list">
        {LEVELS.map((lv, i) => {
          const p = levelProgress(completed, passed, i);
          const body = (
            <>
              <div className="level-card-main">
                <div className="level-card-head">
                  <span className="eyebrow">
                    {t("course.levelN", { n: i + 1 })}
                  </span>
                  <StatusBadge p={p} t={t} />
                </div>
                <h2 className="level-card-title">{levelName(t, lv.slug)}</h2>
                <ul className="level-card-modules">
                  {lv.modules.map((m, mi) => (
                    <li key={m.slug}>
                      <span className="meta">
                        {t("course.moduleN", { n: mi + 1 })}
                      </span>
                      {moduleName(t, m.slug)}
                    </li>
                  ))}
                  <li>
                    <span className="meta">{t("course.test")}</span>
                    {t("course.testDesc", {
                      size: TEST_SIZE,
                      pct: PASS_MARK * 100,
                    })}
                  </li>
                </ul>
                {p.unlocked ? (
                  <div className="level-card-progress">
                    <Bar value={(p.done / p.total) * 100} color={lv.color} />
                    <span className="meta">
                      {t("course.done", { done: p.done, total: p.total })}
                    </span>
                  </div>
                ) : (
                  <p className="meta locked-hint">
                    <LockIcon size={13} />
                    {t("course.lockedHint", {
                      level: levelName(t, LEVELS[i - 1].slug),
                    })}
                  </p>
                )}
              </div>
              {p.unlocked && (
                <ChevronRight size={18} className="level-card-chev" />
              )}
            </>
          );
          return p.unlocked ? (
            <Link
              key={lv.slug}
              href={`/refereeing/courses/${lv.slug}`}
              className="level-card"
            >
              {body}
            </Link>
          ) : (
            <div
              key={lv.slug}
              className="level-card locked"
              aria-disabled="true"
            >
              {body}
            </div>
          );
        })}
      </div>
    </>
  );
}

export function LevelView({ slug }: { slug: string }) {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const completed = useStore((s) => s.completed);
  const passed = useStore((s) => s.passed);
  const idx = LEVELS.findIndex((l) => l.slug === slug);
  const lv = LEVELS[idx];
  const p = levelProgress(completed, passed, idx);
  const name = levelName(t, lv.slug);
  const testHref = `/refereeing/courses/${lv.slug}/test`;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "FIE Fencing Academy", href: "/" },
          { label: t("ref.title"), href: "/refereeing" },
          { label: t("sec.courses"), href: "/refereeing/courses" },
          { label: name, square: lv.color },
        ]}
      />
      <section className="level-head">
        <div className="eyebrow" style={{ color: lv.ink }}>
          {t("course.levelN", { n: idx + 1 })}
        </div>
        <h1 className="display-h1">{name}</h1>
        <div className="level-head-meta">
          <StatusBadge p={p} t={t} />
          {p.unlocked && (
            <span className="meta">
              {t("course.done", { done: p.done, total: p.total })}
            </span>
          )}
        </div>
        {p.unlocked && (
          <Bar value={(p.done / p.total) * 100} color={lv.color} />
        )}
      </section>

      {!p.unlocked ? (
        <div className="notice">
          <LockIcon size={16} />
          <span>
            {t("course.lockedHint", {
              level: levelName(t, LEVELS[idx - 1].slug),
            })}
          </span>
          <Link href="/refereeing/courses" className="link-muted">
            {t("sec.courses")}
          </Link>
        </div>
      ) : (
        <>
          <div className="module-grid">
            {lv.modules.map((m, mi) => (
              <section key={m.slug} className="module-card">
                <div className="eyebrow">
                  {t("course.moduleN", { n: mi + 1 })}
                </div>
                <h2 className="module-title">{moduleName(t, m.slug)}</h2>
                <span className="meta">
                  {t("course.lessons", { n: m.lessons.length })}
                </span>
                <ol className="module-lessons">
                  {m.lessons.map((ls, li) => {
                    const lesson = lessonBySlug(ls)!;
                    const done = completed.includes(
                      lessonKey(lv.slug, m.slug, ls),
                    );
                    return (
                      <li key={ls}>
                        <Link
                          href={lessonHref(lv.slug, m.slug, ls)}
                          className={done ? "done" : ""}
                        >
                          <span
                            className="lesson-check"
                            style={
                              done
                                ? {
                                    background: lv.color,
                                    borderColor: lv.color,
                                  }
                                : undefined
                            }
                          >
                            {done ? (
                              <CheckIcon size={11} strokeWidth={3} />
                            ) : (
                              li + 1
                            )}
                          </span>
                          <span className="lesson-check-title">
                            {lesson.title}
                          </span>
                          <span className="meta">
                            {fmtDuration(lesson.video.duration)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>

          <section
            className="test-card"
            style={{ background: lv.tint, borderColor: lv.tintBorder }}
          >
            <div>
              <div className="eyebrow" style={{ color: lv.ink }}>
                {t("course.test")}
              </div>
              <h2 className="module-title">
                {t("quiz.title", { level: name })}
              </h2>
              <p className="meta">
                {t("course.testDesc", {
                  size: TEST_SIZE,
                  pct: PASS_MARK * 100,
                })}
              </p>
              {!p.ready && (
                <p className="meta locked-hint">
                  <LockIcon size={13} />
                  {t("course.testLocked")}
                </p>
              )}
            </div>
            {p.ready ? (
              <Link href={testHref} className="btn-primary">
                {p.passed ? t("course.retake") : t("course.takeTest")}
                <ArrowRight />
              </Link>
            ) : (
              <span className="btn-primary disabled" aria-disabled="true">
                {t("course.takeTest")}
              </span>
            )}
          </section>

          <section className="attempts">
            <h3>{t("course.history")}</h3>
            {p.attempts.length === 0 ? (
              <p className="meta">{t("course.noAttempts")}</p>
            ) : (
              <ul>
                {p.attempts.map((a) => (
                  <li key={a.date}>
                    <span>{fmtDate(a.date, lang)}</span>
                    <span className="status-badge passed">
                      <CheckIcon size={12} strokeWidth={3} />
                      {t("quiz.score", { score: a.score, size: TEST_SIZE })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
