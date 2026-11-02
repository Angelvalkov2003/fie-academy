"use client";

import Link from "next/link";
import { Fragment } from "react";
import { useT } from "@/lib/i18n";
import {
  INTERPRETATIONS,
  fmtDuration,
  lessonBySlug,
  lessonHref,
  levelBySlug,
} from "@/lib/refereeing";
import { Breadcrumb } from "../Breadcrumb";
import { ChevronRight, PlayIcon } from "../Icons";
import { VideoPlayer } from "../VideoPlayer";
import { levelName } from "./common";

function inline(text: string) {
  return text
    .split("*")
    .map((part, i) =>
      i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>,
    );
}

export function InterpretationList() {
  const t = useT();
  return (
    <>
      <Breadcrumb
        items={[
          { label: "FIE Fencing Academy", href: "/" },
          { label: t("ref.title"), href: "/refereeing" },
          { label: t("sec.interpretation") },
        ]}
      />
      <section className="weapon-head">
        <h1 className="display-h1">{t("sec.interpretation")}</h1>
        <p className="lede">{t("sec.interpretation.desc")}</p>
      </section>

      <ul className="rule-list">
        {INTERPRETATIONS.map((it) => {
          const head = (
            <>
              <span className="rule-ref">{it.ref}</span>
              <div>
                <div className="row-title">{it.title}</div>
                <div className="row-desc">{it.rule}</div>
              </div>
              {it.video ? (
                <span className="video-pill">
                  <PlayIcon size={11} />
                  {t("interp.video")} · {fmtDuration(it.video.duration)}
                  <ChevronRight />
                </span>
              ) : (
                <span className="meta">{t("interp.textOnly")}</span>
              )}
            </>
          );
          return (
            <li key={it.slug}>
              {it.video ? (
                <Link
                  href={`/refereeing/rules-interpretation/${it.slug}`}
                  className="rule-row link"
                >
                  {head}
                </Link>
              ) : (
                <details className="rule-row-details">
                  <summary className="rule-row">{head}</summary>
                  <div className="interp-inline">
                    <div className="eyebrow">{t("interp.interpretation")}</div>
                    {it.interpretation.map((p) => (
                      <p key={p}>{inline(p)}</p>
                    ))}
                  </div>
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function InterpretationDetail({ slug }: { slug: string }) {
  const t = useT();
  const it = INTERPRETATIONS.find((x) => x.slug === slug)!;
  return (
    <>
      <Breadcrumb
        items={[
          { label: "FIE Fencing Academy", href: "/" },
          { label: t("ref.title"), href: "/refereeing" },
          {
            label: t("sec.interpretation"),
            href: "/refereeing/rules-interpretation",
          },
          { label: `${it.ref} · ${it.title}` },
        ]}
      />
      <div className="detail">
        <div className="lesson-eyebrow" style={{ color: "var(--blue-ink)" }}>
          {it.ref}
        </div>
        <h1 className="lesson-h1">{it.title}</h1>
        {it.video && (
          <VideoPlayer
            file={it.video.file}
            duration={it.video.duration}
            caption={it.video.caption}
            label={`${t("sec.interpretation")} · ${it.ref}`}
          />
        )}
        <section className="rule-quote">
          <div className="eyebrow">{t("interp.rule")}</div>
          <p>{it.rule}</p>
        </section>
        <section className="prose" style={{ marginTop: 24 }}>
          <h2>{t("interp.interpretation")}</h2>
          {it.interpretation.map((p) => (
            <p key={p}>{inline(p)}</p>
          ))}
        </section>
        {it.related.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              {t("interp.related")}
            </div>
            <div className="related">
              {it.related.map((r) => {
                const lv = levelBySlug(r.level)!;
                return (
                  <Link
                    key={`${r.level}/${r.lesson}`}
                    href={lessonHref(r.level, r.module, r.lesson)}
                    className="pn-card"
                  >
                    <span className="pn-label">
                      <span
                        className="level-square"
                        style={{ background: lv.color }}
                      />
                      {levelName(t, r.level)}
                    </span>
                    <span className="pn-title">
                      {lessonBySlug(r.lesson)?.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
