"use client";

import { Fragment, useState } from "react";
import { useT, type Key } from "@/lib/i18n";
import {
  useStore,
  type AuditAction,
  type AuditEntry,
  type ContentType,
} from "@/lib/store";
import { ChevronRight, DownloadIcon } from "../Icons";
import { RoleGate } from "./Admin";

const ACTIONS: AuditAction[] = ["create", "update", "delete", "upload"];
const TYPES: ContentType[] = ["question", "video", "document"];

/** Quotes a CSV cell and neutralises spreadsheet formula injection. */
function csvCell(v: string) {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

function exportCsv(rows: AuditEntry[]) {
  const header = [
    "timestamp_utc",
    "actor",
    "action",
    "content_type",
    "item",
    "before",
    "after",
  ];
  const lines = rows.map((r) =>
    [r.at, r.actor, r.action, r.type, r.item, r.before ?? "", r.after ?? ""]
      .map(csvCell)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fie-academy-activity-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AuditView() {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const audit = useStore((s) => s.audit);
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const actors = [...new Set(audit.map((a) => a.actor))].sort();
  const rows = audit.filter((a) => {
    const day = a.at.slice(0, 10);
    return (
      (!actor || a.actor === actor) &&
      (!action || a.action === action) &&
      (!type || a.type === type) &&
      (!from || day >= from) &&
      (!to || day <= to)
    );
  });

  const fmt = (iso: string) =>
    `${new Date(iso).toLocaleString(lang, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC`;

  return (
    <RoleGate need="fie">
      <section className="weapon-head">
        <h1 className="display-h1">{t("audit.title")}</h1>
        <p className="lede">{t("audit.lede")}</p>
      </section>

      <div className="toolbar audit-filters">
        <select
          className="select"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          aria-label={t("audit.actor")}
        >
          <option value="">{t("audit.allActors")}</option>
          {actors.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select
          className="select"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          aria-label={t("audit.action")}
        >
          <option value="">{t("audit.allActions")}</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {t(`action.${a}` as Key)}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label={t("audit.type")}
        >
          <option value="">{t("audit.allTypes")}</option>
          {TYPES.map((x) => (
            <option key={x} value={x}>
              {t(`type.${x}` as Key)}
            </option>
          ))}
        </select>
        <label className="date-field">
          <span className="meta">{t("audit.from")}</span>
          <input
            className="input"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="date-field">
          <span className="meta">{t("audit.to")}</span>
          <input
            className="input"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <span style={{ flex: 1 }} />
        <span className="meta">{t("audit.entries", { n: rows.length })}</span>
        <button
          type="button"
          className="btn-ghost"
          disabled={rows.length === 0}
          onClick={() => exportCsv(rows)}
        >
          <DownloadIcon />
          {t("audit.export")}
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="meta empty">{t("audit.empty")}</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("audit.when")}</th>
                <th>{t("audit.actor")}</th>
                <th>{t("audit.action")}</th>
                <th>{t("audit.type")}</th>
                <th>{t("audit.item")}</th>
                <th>{t("audit.changes")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isOpen = open === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr>
                      <td className="nowrap">{fmt(r.at)}</td>
                      <td className="nowrap">{r.actor}</td>
                      <td>
                        <span className={`action-badge ${r.action}`}>
                          {t(`action.${r.action}` as Key)}
                        </span>
                      </td>
                      <td>{t(`type.${r.type}` as Key)}</td>
                      <td className="clamp">{r.item}</td>
                      <td>
                        <button
                          type="button"
                          className="link-btn"
                          aria-expanded={isOpen}
                          onClick={() => setOpen(isOpen ? null : r.id)}
                        >
                          <ChevronRight
                            size={12}
                            className={isOpen ? "rot" : ""}
                          />
                          {t("audit.changes")}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="diff-row">
                        <td colSpan={6}>
                          <div className="diff">
                            <div className="diff-col before">
                              <div className="eyebrow">{t("audit.before")}</div>
                              <p>{r.before ?? "—"}</p>
                            </div>
                            <div className="diff-col after">
                              <div className="eyebrow">{t("audit.after")}</div>
                              <p>{r.after ?? "—"}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </RoleGate>
  );
}
