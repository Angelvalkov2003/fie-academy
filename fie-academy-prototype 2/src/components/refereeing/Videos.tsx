"use client";

import Link from "next/link";
import { useState } from "react";
import { useT, type Key } from "@/lib/i18n";
import {
  VIDEO_TOPICS,
  WEAPON_SLUGS,
  fmtDuration,
  type LibraryVideo,
  type Weapon,
} from "@/lib/refereeing";
import { useStore } from "@/lib/store";
import { Breadcrumb } from "../Breadcrumb";
import { ArrowRight, PlayIcon, SearchIcon } from "../Icons";
import { Modal } from "../Modal";
import { VideoPlayer } from "../VideoPlayer";

export const weaponKey = (w: Weapon) => `weapon.${w}` as Key;

export function VideoLibraryIndex() {
  const t = useT();
  const videos = useStore((s) => s.videos);
  return (
    <>
      <Breadcrumb
        items={[
          { label: "FIE Fencing Academy", href: "/" },
          { label: t("ref.title"), href: "/refereeing" },
          { label: t("sec.videos") },
        ]}
      />
      <section className="weapon-head">
        <h1 className="display-h1">{t("sec.videos")}</h1>
        <p className="lede">{t("sec.videos.desc")}</p>
      </section>
      <div className="weapon-grid">
        {WEAPON_SLUGS.map((w) => (
          <Link
            key={w}
            href={`/refereeing/video-library/${w}`}
            className="weapon-card"
          >
            <div className="weapon-card-media">
              <div className="stripes-dark" />
              <span className="weapon-card-name">{t(weaponKey(w))}</span>
            </div>
            <div className="weapon-card-foot">
              <span className="meta">
                {t("videos.count", {
                  n: videos.filter((v) => v.weapon === w).length,
                })}
              </span>
              <ArrowRight />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export function VideoLibraryView({ weapon }: { weapon: Weapon }) {
  const t = useT();
  const videos = useStore((s) => s.videos);
  const [topic, setTopic] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<LibraryVideo | null>(null);

  const q = query.trim().toLowerCase();
  const all = videos.filter((v) => v.weapon === weapon);
  const list = all.filter(
    (v) =>
      (!topic || v.topic === topic) &&
      (!q ||
        v.title.toLowerCase().includes(q) ||
        v.ruleRef?.toLowerCase().includes(q)),
  );

  return (
    <>
      <Breadcrumb
        items={[
          { label: "FIE Fencing Academy", href: "/" },
          { label: t("ref.title"), href: "/refereeing" },
          { label: t("sec.videos"), href: "/refereeing/video-library" },
          { label: t(weaponKey(weapon)) },
        ]}
      />
      <section className="weapon-head">
        <div>
          <h1 className="display-h1">{t(weaponKey(weapon))}</h1>
          <span className="display-fr">
            {t("videos.count", { n: all.length })}
          </span>
        </div>
      </section>

      <div className="toolbar">
        <nav className="segmented" aria-label={t("sec.videos")}>
          {WEAPON_SLUGS.map((w) => (
            <Link
              key={w}
              href={`/refereeing/video-library/${w}`}
              scroll={false}
              className={w === weapon ? "on" : ""}
              aria-current={w === weapon ? "page" : undefined}
            >
              {t(weaponKey(w))}
            </Link>
          ))}
        </nav>
        <div className="toolbar-right">
          <select
            className="select"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            aria-label={t("admin.topic")}
          >
            <option value="">{t("videos.allTopics")}</option>
            {VIDEO_TOPICS.map((tp) => (
              <option key={tp} value={tp}>
                {tp}
              </option>
            ))}
          </select>
          <label className="search">
            <SearchIcon />
            <input
              type="search"
              placeholder={t("videos.search")}
              aria-label={t("videos.search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="meta empty">{t("videos.empty")}</p>
      ) : (
        <div className="video-grid">
          {list.map((v) => (
            <button
              key={v.id}
              type="button"
              className="video-card"
              onClick={() => setOpen(v)}
            >
              <span className="video-thumb">
                <span className="stripes-dark" />
                <span className="play-dot sm">
                  <PlayIcon size={14} />
                </span>
                <span className="video-dur">{fmtDuration(v.duration)}</span>
              </span>
              <span className="video-body">
                <span className="video-topic">{v.topic}</span>
                <span className="video-title">{v.title}</span>
                {v.ruleRef && <span className="meta">{v.ruleRef}</span>}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && (
        <Modal
          title={open.title}
          onClose={() => setOpen(null)}
          closeLabel={t("docs.close")}
        >
          <VideoPlayer
            file={`${open.id}.mp4`}
            duration={open.duration}
            label={`${t(weaponKey(open.weapon))} · ${open.topic}`}
            caption={
              open.ruleRef
                ? `${t("lesson.ruleRef")}: ${open.ruleRef}`
                : undefined
            }
          />
        </Modal>
      )}
    </>
  );
}
