"use client";

import { useEffect, useState } from "react";
import { useT, type Key } from "@/lib/i18n";
import {
  RULE_CATEGORIES,
  RULE_SECTIONS,
  type RuleCategory,
  type RuleDoc,
} from "@/lib/refereeing";
import { useStore } from "@/lib/store";
import { Breadcrumb } from "../Breadcrumb";
import {
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  EyeIcon,
  FileIcon,
  SearchIcon,
} from "../Icons";
import { Modal } from "../Modal";

const catKey = (c: RuleCategory) => `cat.${c}` as Key;

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(id);
  }, [msg]);
  const node = msg ? (
    <div className="toast" role="status">
      {msg}
    </div>
  ) : null;
  return [node, setMsg] as const;
}

/** Placeholder for the in-browser PDF viewer. */
export function DocViewer({
  doc,
  onClose,
  onDownload,
}: {
  doc: RuleDoc;
  onClose: () => void;
  onDownload: () => void;
}) {
  const t = useT();
  const [page, setPage] = useState(1);
  return (
    <Modal title={doc.title} onClose={onClose} closeLabel={t("docs.close")}>
      <div className="viewer-bar">
        <button
          type="button"
          className="icon-btn"
          aria-label={t("lesson.previous")}
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft />
        </button>
        <span className="meta">
          {page} / {doc.pages}
        </span>
        <button
          type="button"
          className="icon-btn"
          aria-label={t("lesson.next")}
          disabled={page === doc.pages}
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronRight />
        </button>
        <span style={{ flex: 1 }} />
        <button type="button" className="btn-ghost" onClick={onDownload}>
          <DownloadIcon />
          {t("docs.download")}
        </button>
      </div>
      <div className="viewer-page">
        <div className="viewer-sheet">
          <div className="eyebrow">{doc.file}</div>
          <div className="viewer-title">{doc.title}</div>
          <div className="viewer-lines" aria-hidden>
            {Array.from({ length: 14 }, (_, i) => (
              <span
                key={i}
                style={{ width: `${60 + ((i * 37 + page * 13) % 38)}%` }}
              />
            ))}
          </div>
          <div className="meta">{t("docs.viewer")}</div>
        </div>
      </div>
    </Modal>
  );
}

function DocRow({
  doc,
  onView,
  onDownload,
}: {
  doc: RuleDoc;
  onView: () => void;
  onDownload: () => void;
}) {
  const t = useT();
  return (
    <li className="doc-row">
      <span className="doc-icon">
        <FileIcon size={20} />
        <span>PDF</span>
      </span>
      <div className="doc-text">
        <div className="doc-title">{doc.title}</div>
        <div className="meta">
          {t(catKey(doc.category))} · {t("docs.edition", { e: doc.edition })} ·{" "}
          {t("docs.pages", { n: doc.pages })} · {doc.sizeMb.toFixed(1)} MB
        </div>
      </div>
      <div className="doc-actions">
        <button type="button" className="btn-ghost" onClick={onView}>
          <EyeIcon />
          {t("docs.view")}
        </button>
        <button type="button" className="btn-ghost" onClick={onDownload}>
          <DownloadIcon />
          {t("docs.download")}
        </button>
      </div>
    </li>
  );
}

export function FieRulesView() {
  const t = useT();
  const docs = useStore((s) => s.documents);
  const [cat, setCat] = useState<RuleCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<RuleDoc | null>(null);
  const [toast, showToast] = useToast();
  const download = () => showToast(t("docs.downloadDemo"));

  const q = query.trim().toLowerCase();
  const list = docs.filter(
    (d) =>
      (cat === "all" || d.category === cat) &&
      (!q ||
        d.title.toLowerCase().includes(q) ||
        d.file.toLowerCase().includes(q)),
  );

  return (
    <>
      <Breadcrumb
        items={[
          { label: "FIE Fencing Academy", href: "/" },
          { label: t("ref.title"), href: "/refereeing" },
          { label: t("sec.fieRules") },
        ]}
      />
      <section className="weapon-head">
        <h1 className="display-h1">{t("sec.fieRules")}</h1>
        <p className="lede">{t("sec.fieRules.desc")}</p>
      </section>

      <div className="toolbar">
        <div className="segmented" role="group">
          {(["all", ...RULE_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              className={cat === c ? "on" : ""}
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
            >
              {c === "all" ? t("docs.all") : t(catKey(c))}
            </button>
          ))}
        </div>
        <label className="search">
          <SearchIcon />
          <input
            type="search"
            placeholder={t("docs.search")}
            aria-label={t("docs.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {list.length === 0 ? (
        <p className="meta empty">{t("docs.empty")}</p>
      ) : (
        <ul className="doc-list">
          {list.map((d) => (
            <DocRow
              key={d.id}
              doc={d}
              onView={() => setOpen(d)}
              onDownload={download}
            />
          ))}
        </ul>
      )}
      {open && (
        <DocViewer
          doc={open}
          onClose={() => setOpen(null)}
          onDownload={download}
        />
      )}
      {toast}
    </>
  );
}

export function RulesView() {
  const t = useT();
  const docs = useStore((s) => s.documents);
  const [cat, setCat] = useState<RuleCategory>("technical");
  const [open, setOpen] = useState<RuleDoc | null>(null);
  const [toast, showToast] = useToast();

  return (
    <>
      <Breadcrumb
        items={[
          { label: "FIE Fencing Academy", href: "/" },
          { label: t("ref.title"), href: "/refereeing" },
          { label: t("sec.rules") },
        ]}
      />
      <section className="weapon-head">
        <h1 className="display-h1">{t("sec.rules")}</h1>
        <p className="lede">{t("sec.rules.desc")}</p>
      </section>

      <div className="segmented" role="tablist">
        {RULE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={cat === c}
            className={cat === c ? "on" : ""}
            onClick={() => setCat(c)}
          >
            {t(catKey(c))}
            <span className="count">{RULE_SECTIONS[c].length}</span>
          </button>
        ))}
      </div>
      <p className="lede" style={{ marginBottom: 20 }}>
        {t(`cat.${cat}.desc` as Key)}
      </p>

      <ul className="rule-list" role="tabpanel">
        {RULE_SECTIONS[cat].map((r) => {
          const doc = docs.find((d) => d.id === r.docId);
          return (
            <li key={r.ref} className="rule-row">
              <span className="rule-ref">{r.ref}</span>
              <div>
                <div className="row-title">{r.title}</div>
                <div className="row-desc">{r.summary}</div>
              </div>
              {doc && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setOpen(doc)}
                >
                  <FileIcon size={14} />
                  {t("rules.openDoc")}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {open && (
        <DocViewer
          doc={open}
          onClose={() => setOpen(null)}
          onDownload={() => showToast(t("docs.downloadDemo"))}
        />
      )}
      {toast}
    </>
  );
}
