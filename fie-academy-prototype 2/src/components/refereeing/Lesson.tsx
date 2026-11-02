"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type MouseEvent } from "react";
import type { Block } from "@/lib/data";
import { useT, type TFn } from "@/lib/i18n";
import {
  LEVELS,
  lessonBySlug,
  lessonHref,
  lessonKey,
  type Level,
} from "@/lib/refereeing";
import { completeLesson, levelProgress, useStore } from "@/lib/store";
import { Breadcrumb } from "../Breadcrumb";
import {
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  LightbulbIcon,
  LockIcon,
  MenuIcon,
} from "../Icons";
import { ContentLangNote, SiteFooter } from "../Shell";
import { TopBar } from "../TopBar";
import { VideoPlayer } from "../VideoPlayer";
import { levelName, moduleName } from "./common";

/** Renders `*text*` as italic. */
function inline(text: string) {
  return text
    .split("*")
    .map((part, i) =>
      i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>,
    );
}

function BlockView({ b, level, t }: { b: Block; level: Level; t: TFn }) {
  switch (b.type) {
    case "h2":
      return <h2 id={b.id}>{b.text}</h2>;
    case "p":
      return <p>{inline(b.text)}</p>;
    case "ul":
      return (
        <ul>
          {b.items.map((it) => (
            <li key={it}>{inline(it)}</li>
          ))}
        </ul>
      );
    case "figure":
      return (
        <figure className="diagram">
          <div className="diagram-area">
            <span>diagram · {b.file}</span>
          </div>
          <figcaption>{b.caption}</figcaption>
        </figure>
      );
    case "keypoints":
      return (
        <div
          id={b.id}
          className="keypoints"
          style={{ background: level.tint, borderColor: level.tintBorder }}
        >
          <div className="keypoints-head" style={{ color: level.ink }}>
            <LightbulbIcon />
            {t("lesson.keyPoints")}
          </div>
          <ul>
            {b.items.map((it) => (
              <li key={it}>{inline(it)}</li>
            ))}
          </ul>
        </div>
      );
  }
}

export default function LessonView({
  levelSlug,
  moduleSlug,
  lessonSlug,
}: {
  levelSlug: string;
  moduleSlug: string;
  lessonSlug: string;
}) {
  const t = useT();
  const completed = useStore((s) => s.completed);
  const passed = useStore((s) => s.passed);
  const levelIdx = LEVELS.findIndex((l) => l.slug === levelSlug);
  const level = LEVELS[levelIdx];
  const moduleIdx = level.modules.findIndex((m) => m.slug === moduleSlug);
  const lesson = lessonBySlug(lessonSlug)!;
  const progress = levelProgress(completed, passed, levelIdx);
  const key = lessonKey(levelSlug, moduleSlug, lessonSlug);
  const done = completed.includes(key);
  const testHref = `/refereeing/courses/${levelSlug}/test`;

  const seq = level.modules.flatMap((m) =>
    m.lessons.map((l) => ({ module: m.slug, lesson: l })),
  );
  const pos = seq.findIndex(
    (x) => x.module === moduleSlug && x.lesson === lessonSlug,
  );
  const prev = seq[pos - 1];
  const next = seq[pos + 1];
  const lessonIdx = level.modules[moduleIdx].lessons.indexOf(lessonSlug);

  const toc = lesson.blocks.flatMap((b) =>
    b.type === "h2"
      ? [{ id: b.id, label: b.text }]
      : b.type === "keypoints"
        ? [{ id: b.id, label: t("lesson.keyPoints") }]
        : [],
  );

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LEVELS.map((l) => [l.slug, l.slug === levelSlug])),
  );
  const [drawer, setDrawer] = useState(false);
  const [readPct, setReadPct] = useState(0);
  const [activeId, setActiveId] = useState(toc[0]?.id);
  const readingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sc = readingRef.current;
    if (!sc) return;
    const ids = toc.map((x) => x.id);
    const onScroll = () => {
      const max = sc.scrollHeight - sc.clientHeight;
      setReadPct(
        max > 0
          ? Math.min(100, Math.max(0, Math.round((sc.scrollTop / max) * 100)))
          : 0,
      );
      const scTop = sc.getBoundingClientRect().top;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - scTop <= 140) current = id;
      }
      // Short final sections can never reach the threshold; treat the bottom of the page as the last one.
      if (max > 0 && max - sc.scrollTop < 4) current = ids[ids.length - 1];
      setActiveId(current);
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      sc.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [lesson.slug]);

  useEffect(() => {
    if (!drawer) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [drawer]);

  const jump = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    const sc = readingRef.current;
    const el = document.getElementById(id);
    if (!sc || !el) return;
    sc.scrollTo({
      top:
        sc.scrollTop +
        (el.getBoundingClientRect().top - sc.getBoundingClientRect().top) -
        28,
      behavior: "smooth",
    });
  };

  return (
    <div className={`lesson-shell${drawer ? " drawer-open" : ""}`}>
      <TopBar active="refereeing" />
      <ContentLangNote />

      <div className="lesson-grid">
        <nav className="sb curriculum" aria-label={t("lesson.curriculum")}>
          <div className="eyebrow">{t("lesson.curriculum")}</div>
          {LEVELS.map((lv, li) => {
            const open = expanded[lv.slug];
            const lp = levelProgress(completed, passed, li);
            return (
              <div key={lv.slug}>
                <button
                  type="button"
                  className="level-btn"
                  aria-expanded={open}
                  onClick={() =>
                    setExpanded((s) => ({ ...s, [lv.slug]: !s[lv.slug] }))
                  }
                >
                  <ChevronRight size={12} strokeWidth={2.5} className="chev" />
                  <span
                    className="level-square"
                    style={{ background: lv.color }}
                  />
                  <span className="level-name">{levelName(t, lv.slug)}</span>
                  <span
                    className="level-status"
                    style={
                      lp.unlocked && !lp.passed
                        ? { color: lv.ink, fontWeight: 600 }
                        : undefined
                    }
                  >
                    {lp.passed ? (
                      <CheckIcon size={12} strokeWidth={3} />
                    ) : !lp.unlocked ? (
                      <LockIcon size={11} />
                    ) : (
                      `${Math.round((lp.done / lp.total) * 100)}%`
                    )}
                  </span>
                </button>
                {open && (
                  <div className="chapters">
                    {lv.modules.map((m) => (
                      <Fragment key={m.slug}>
                        <div
                          className={`chapter${lv.slug === levelSlug && m.slug === moduleSlug ? " current" : ""}${lp.unlocked ? "" : " locked"}`}
                        >
                          <span
                            className="cdot hollow"
                            style={
                              lv.slug === levelSlug && m.slug === moduleSlug
                                ? { borderColor: lv.color }
                                : undefined
                            }
                          />
                          {moduleName(t, m.slug)}
                        </div>
                        {lp.unlocked && (
                          <div className="lessons-nested">
                            {m.lessons.map((ls) => {
                              const on =
                                lv.slug === levelSlug &&
                                m.slug === moduleSlug &&
                                ls === lessonSlug;
                              const isDone = completed.includes(
                                lessonKey(lv.slug, m.slug, ls),
                              );
                              return (
                                <Link
                                  key={ls}
                                  href={lessonHref(lv.slug, m.slug, ls)}
                                  className={`lesson-link${on ? " on" : ""}${isDone ? " done" : ""}`}
                                  aria-current={on ? "page" : undefined}
                                  style={
                                    on
                                      ? {
                                          color: lv.ink,
                                          background: lv.tint,
                                          borderLeftColor: lv.color,
                                        }
                                      : undefined
                                  }
                                >
                                  {lessonBySlug(ls)?.title}
                                  {isDone && (
                                    <CheckIcon
                                      size={11}
                                      strokeWidth={3}
                                      className="lesson-done-icon"
                                    />
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </Fragment>
                    ))}
                    {lp.ready ? (
                      <Link
                        href={`/refereeing/courses/${lv.slug}/test`}
                        className="chapter test-link"
                      >
                        <span
                          className="cdot"
                          style={{ background: lv.color }}
                        />
                        {t("course.test")}
                      </Link>
                    ) : (
                      <div className="chapter locked">
                        <LockIcon size={11} />
                        {t("course.test")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="drawer-backdrop" onClick={() => setDrawer(false)} />

        <main id="reading" className="reading" ref={readingRef}>
          <div className="reading-inner">
            <button
              type="button"
              className="drawer-toggle"
              onClick={() => setDrawer(true)}
            >
              <MenuIcon size={15} />
              {t("lesson.curriculum")}
            </button>

            <Breadcrumb
              items={[
                { label: "FIE Fencing Academy", href: "/" },
                { label: t("ref.title"), href: "/refereeing" },
                {
                  label: levelName(t, level.slug),
                  href: `/refereeing/courses/${level.slug}`,
                  square: level.color,
                },
                { label: moduleName(t, moduleSlug) },
                { label: lesson.title },
              ]}
            />

            {!progress.unlocked ? (
              <div className="notice" style={{ marginTop: 28 }}>
                <LockIcon size={16} />
                <span>
                  {t("course.lockedHint", {
                    level: levelName(t, LEVELS[levelIdx - 1].slug),
                  })}
                </span>
              </div>
            ) : (
              <>
                <div className="lesson-eyebrow" style={{ color: level.ink }}>
                  {t("lesson.label", { m: moduleIdx + 1, n: lessonIdx + 1 })}
                </div>
                <h1 className="lesson-h1">{lesson.heading}</h1>
                <p className="standfirst">{lesson.standfirst}</p>

                <VideoPlayer key={lesson.slug} {...lesson.video} />

                <div className="prose">
                  {lesson.blocks.map((b, i) => (
                    <BlockView key={i} b={b} level={level} t={t} />
                  ))}
                </div>

                <div className="complete-row">
                  {done ? (
                    <span className="status-badge passed lg">
                      <CheckIcon size={14} strokeWidth={3} />
                      {t("lesson.completed")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => completeLesson(key)}
                    >
                      <CheckIcon size={14} strokeWidth={3} />
                      {t("lesson.markComplete")}
                    </button>
                  )}
                </div>

                <div className="prevnext">
                  {prev ? (
                    <Link
                      href={lessonHref(levelSlug, prev.module, prev.lesson)}
                      className="pn-card"
                    >
                      <span className="pn-label">
                        <ChevronLeft />
                        {t("lesson.previous")}
                      </span>
                      <span className="pn-title">
                        {lessonBySlug(prev.lesson)?.title}
                      </span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <Link
                      href={lessonHref(levelSlug, next.module, next.lesson)}
                      className="pn-card next"
                    >
                      <span className="pn-label">
                        {t("lesson.next")}
                        <ChevronRight />
                      </span>
                      <span className="pn-title">
                        {lessonBySlug(next.lesson)?.title}
                      </span>
                    </Link>
                  ) : progress.ready ? (
                    <Link href={testHref} className="pn-card next">
                      <span className="pn-label">
                        {t("lesson.next")}
                        <ChevronRight />
                      </span>
                      <span className="pn-title">{t("course.test")}</span>
                    </Link>
                  ) : (
                    <span />
                  )}
                </div>
              </>
            )}
          </div>
          <SiteFooter />
        </main>

        <aside className="sb toc-aside">
          <div style={{ marginBottom: 24 }}>
            <div className="progress-head">
              <span className="eyebrow">{t("lesson.readingProgress")}</span>
              <span className="progress-pct" style={{ color: level.ink }}>
                {readPct}%
              </span>
            </div>
            <div className="progress-track">
              <div style={{ width: `${readPct}%`, background: level.color }} />
            </div>
          </div>
          <div className="eyebrow">{t("lesson.onThisPage")}</div>
          <div className="toc">
            {toc.map((x) => {
              const on = x.id === activeId;
              return (
                <a
                  key={x.id}
                  href={`#${x.id}`}
                  onClick={jump(x.id)}
                  className={on ? "on" : ""}
                  style={
                    on
                      ? { color: level.ink, borderLeftColor: level.color }
                      : undefined
                  }
                >
                  {x.label}
                </a>
              );
            })}
          </div>
          <div className="rule-card">
            <div className="rule-card-title">{t("lesson.ruleRef")}</div>
            <div className="rule-card-text">{lesson.ruleRef}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
