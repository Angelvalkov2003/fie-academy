"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useT, type Key } from "@/lib/i18n";
import {
  LEVELS,
  RULE_CATEGORIES,
  VIDEO_TOPICS,
  WEAPON_SLUGS,
  fmtDuration,
  type LibraryVideo,
  type Question,
  type RuleCategory,
  type RuleDoc,
  type Weapon,
} from "@/lib/refereeing";
import {
  deleteDocument,
  deleteQuestion,
  deleteVideo,
  saveDocument,
  saveQuestion,
  saveVideo,
  setRole,
  useStore,
  type Role,
} from "@/lib/store";
import { LockIcon, PlusIcon } from "../Icons";
import { levelName } from "../refereeing/common";
import { weaponKey } from "../refereeing/Videos";

const MAX_PDF_BYTES = 20 * 1024 * 1024;

/** Client-side gate for the demo only; the platform must enforce roles on the server. */
export function RoleGate({
  need,
  children,
}: {
  need: Role;
  children: ReactNode;
}) {
  const t = useT();
  const role = useStore((s) => s.role);
  if (role === need) return <>{children}</>;
  return (
    <div className="restricted">
      <LockIcon size={22} />
      <p>{t(need === "academy" ? "admin.restricted" : "audit.restricted")}</p>
      <button
        type="button"
        className="btn-primary"
        onClick={() => setRole(need)}
      >
        {t("admin.switch", { role: t(`role.${need}` as Key) })}
      </button>
    </div>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`field${wide ? " wide" : ""}`}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

function EditorPanel({
  onSubmit,
  onCancel,
  error,
  children,
}: {
  onSubmit: () => void;
  onCancel: () => void;
  error: string | null;
  children: ReactNode;
}) {
  const t = useT();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  return (
    <form className="editor" onSubmit={submit} noValidate>
      <div className="form-grid">{children}</div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="editor-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          {t("admin.cancel")}
        </button>
        <button type="submit" className="btn-primary">
          {t("admin.save")}
        </button>
      </div>
    </form>
  );
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  return (
    <td className="row-actions">
      <button type="button" className="link-btn" onClick={onEdit}>
        {t("admin.edit")}
      </button>
      <button
        type="button"
        className="link-btn danger"
        onClick={() => window.confirm(t("admin.confirmDelete")) && onDelete()}
      >
        {t("admin.delete")}
      </button>
    </td>
  );
}

/* -------------------------------- Questions ------------------------------- */

type QDraft = Omit<Question, "id"> & { id?: string };
const emptyQuestion = (level: string): QDraft => ({
  level,
  type: "single",
  prompt: "",
  options: ["", "", "", ""],
  answer: 0,
  explanation: "",
});

function QuestionEditor({
  initial,
  onDone,
}: {
  initial: QDraft;
  onDone: () => void;
}) {
  const t = useT();
  const [d, setD] = useState<QDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof QDraft>(k: K, v: QDraft[K]) =>
    setD((x) => ({ ...x, [k]: v }));

  const submit = () => {
    const options =
      d.type === "truefalse"
        ? ["True", "False"]
        : d.options.map((o) => o.trim());
    if (!d.prompt.trim() || options.some((o) => !o))
      return setError(t("admin.required"));
    saveQuestion({
      ...d,
      prompt: d.prompt.trim(),
      explanation: d.explanation.trim(),
      options,
    });
    onDone();
  };

  return (
    <EditorPanel onSubmit={submit} onCancel={onDone} error={error}>
      <Field label={t("admin.level")}>
        <select
          className="select"
          value={d.level}
          onChange={(e) => set("level", e.target.value)}
        >
          {LEVELS.map((l) => (
            <option key={l.slug} value={l.slug}>
              {levelName(t, l.slug)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("admin.type")}>
        <select
          className="select"
          value={d.type}
          onChange={(e) => {
            const type = e.target.value as Question["type"];
            setD((x) => ({
              ...x,
              type,
              answer: 0,
              options:
                type === "truefalse" ? ["True", "False"] : ["", "", "", ""],
            }));
          }}
        >
          <option value="single">{t("admin.single")}</option>
          <option value="truefalse">{t("admin.truefalse")}</option>
        </select>
      </Field>
      <Field label={`${t("admin.prompt")} *`} wide>
        <textarea
          className="input"
          rows={2}
          value={d.prompt}
          onChange={(e) => set("prompt", e.target.value)}
        />
      </Field>
      <fieldset className="field wide options-field">
        <legend className="field-label">{t("admin.options")} *</legend>
        {d.options.map((o, i) => (
          <div key={i} className="option-row">
            <label className="correct">
              <input
                type="radio"
                name="correct"
                checked={d.answer === i}
                onChange={() => set("answer", i)}
              />
              <span className="meta">{t("admin.correct")}</span>
            </label>
            {d.type === "truefalse" ? (
              <span className="input static">
                {t(i === 0 ? "quiz.true" : "quiz.false")}
              </span>
            ) : (
              <input
                className="input"
                value={o}
                aria-label={`${t("admin.options")} ${i + 1}`}
                onChange={(e) =>
                  set(
                    "options",
                    d.options.map((x, j) => (j === i ? e.target.value : x)),
                  )
                }
              />
            )}
          </div>
        ))}
      </fieldset>
      <Field label={t("admin.explanation")} wide>
        <textarea
          className="input"
          rows={2}
          value={d.explanation}
          onChange={(e) => set("explanation", e.target.value)}
        />
      </Field>
    </EditorPanel>
  );
}

function QuestionsAdmin() {
  const t = useT();
  const questions = useStore((s) => s.questions);
  const [level, setLevel] = useState("all");
  const [editing, setEditing] = useState<QDraft | null>(null);
  const list = questions.filter((q) => level === "all" || q.level === level);

  return (
    <>
      <div className="toolbar">
        <select
          className="select"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label={t("admin.level")}
        >
          <option value="all">{t("docs.all")}</option>
          {LEVELS.map((l) => (
            <option key={l.slug} value={l.slug}>
              {levelName(t, l.slug)} ·{" "}
              {t("admin.inBank", {
                n: questions.filter((q) => q.level === l.slug).length,
              })}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            setEditing(emptyQuestion(level === "all" ? LEVELS[0].slug : level))
          }
        >
          <PlusIcon />
          {t("admin.add")}
        </button>
      </div>
      {editing && (
        <QuestionEditor
          key={editing.id ?? "new"}
          initial={editing}
          onDone={() => setEditing(null)}
        />
      )}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t("admin.level")}</th>
              <th>{t("admin.type")}</th>
              <th>{t("admin.prompt")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((q) => (
              <tr key={q.id}>
                <td className="mono">{q.id}</td>
                <td>
                  <span
                    className="level-square"
                    style={{
                      background: LEVELS.find((l) => l.slug === q.level)?.color,
                    }}
                  />{" "}
                  {levelName(t, q.level)}
                </td>
                <td>
                  {t(q.type === "single" ? "admin.single" : "admin.truefalse")}
                </td>
                <td className="clamp">{q.prompt}</td>
                <RowActions
                  onEdit={() => setEditing(q)}
                  onDelete={() => deleteQuestion(q.id)}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* --------------------------------- Videos --------------------------------- */

type VDraft = Omit<LibraryVideo, "id"> & { id?: string };

function parseDuration(s: string) {
  const m = /^(\d{1,2}):([0-5]\d)$/.exec(s.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function VideoEditor({
  initial,
  onDone,
}: {
  initial: VDraft;
  onDone: () => void;
}) {
  const t = useT();
  const [d, setD] = useState<VDraft>(initial);
  const [dur, setDur] = useState(
    initial.duration ? fmtDuration(initial.duration) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof VDraft>(k: K, v: VDraft[K]) =>
    setD((x) => ({ ...x, [k]: v }));

  const submit = () => {
    const duration = parseDuration(dur);
    if (!d.title.trim() || duration === null)
      return setError(t("admin.required"));
    saveVideo({
      ...d,
      title: d.title.trim(),
      duration,
      ruleRef: d.ruleRef?.trim() || undefined,
    });
    onDone();
  };

  return (
    <EditorPanel onSubmit={submit} onCancel={onDone} error={error}>
      <Field label={`${t("admin.name")} *`} wide>
        <input
          className="input"
          value={d.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label={t("admin.weapon")}>
        <select
          className="select"
          value={d.weapon}
          onChange={(e) => set("weapon", e.target.value as Weapon)}
        >
          {WEAPON_SLUGS.map((w) => (
            <option key={w} value={w}>
              {t(weaponKey(w))}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("admin.topic")}>
        <select
          className="select"
          value={d.topic}
          onChange={(e) => set("topic", e.target.value)}
        >
          {VIDEO_TOPICS.map((tp) => (
            <option key={tp}>{tp}</option>
          ))}
        </select>
      </Field>
      <Field label={`${t("admin.duration")} *`}>
        <input
          className="input"
          value={dur}
          placeholder="2:30"
          onChange={(e) => setDur(e.target.value)}
        />
      </Field>
      <Field label={t("admin.ruleRef")}>
        <input
          className="input"
          value={d.ruleRef ?? ""}
          placeholder="t.56"
          onChange={(e) => set("ruleRef", e.target.value)}
        />
      </Field>
    </EditorPanel>
  );
}

function VideosAdmin() {
  const t = useT();
  const videos = useStore((s) => s.videos);
  const [editing, setEditing] = useState<VDraft | null>(null);
  return (
    <>
      <div className="toolbar">
        <span className="meta">{t("videos.count", { n: videos.length })}</span>
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            setEditing({
              title: "",
              weapon: "epee",
              topic: VIDEO_TOPICS[0],
              duration: 0,
            })
          }
        >
          <PlusIcon />
          {t("admin.add")}
        </button>
      </div>
      {editing && (
        <VideoEditor
          key={editing.id ?? "new"}
          initial={editing}
          onDone={() => setEditing(null)}
        />
      )}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.name")}</th>
              <th>{t("admin.weapon")}</th>
              <th>{t("admin.topic")}</th>
              <th>{t("admin.duration")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id}>
                <td className="clamp">{v.title}</td>
                <td>{t(weaponKey(v.weapon))}</td>
                <td>{v.topic}</td>
                <td className="mono">{fmtDuration(v.duration)}</td>
                <RowActions
                  onEdit={() => setEditing(v)}
                  onDelete={() => deleteVideo(v.id)}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* -------------------------------- Documents ------------------------------- */

type DDraft = Omit<RuleDoc, "id"> & { id?: string };

function DocumentEditor({
  initial,
  onDone,
}: {
  initial: DDraft;
  onDone: () => void;
}) {
  const t = useT();
  const [d, setD] = useState<DDraft>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof DDraft>(k: K, v: DDraft[K]) =>
    setD((x) => ({ ...x, [k]: v }));

  const submit = () => {
    if (!d.title.trim() || !d.edition.trim() || (!d.id && !file))
      return setError(t("admin.required"));
    if (file && (file.type !== "application/pdf" || file.size > MAX_PDF_BYTES))
      return setError(t("admin.fileError"));
    saveDocument({
      ...d,
      title: d.title.trim(),
      edition: d.edition.trim(),
      file: file?.name ?? d.file,
      sizeMb: file
        ? Math.max(0.1, Math.round((file.size / 1048576) * 10) / 10)
        : d.sizeMb,
    });
    onDone();
  };

  return (
    <EditorPanel onSubmit={submit} onCancel={onDone} error={error}>
      <Field label={`${t("admin.name")} *`} wide>
        <input
          className="input"
          value={d.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label={t("admin.category")}>
        <select
          className="select"
          value={d.category}
          onChange={(e) => set("category", e.target.value as RuleCategory)}
        >
          {RULE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`cat.${c}` as Key)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={`${t("admin.edition")} *`}>
        <input
          className="input"
          value={d.edition}
          onChange={(e) => set("edition", e.target.value)}
        />
      </Field>
      <Field label={`${t("admin.file")}${d.id ? "" : " *"}`} wide>
        <input
          className="input"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <span className="meta">
          {t("admin.fileHint")}
          {d.id && ` · ${d.file}`}
        </span>
      </Field>
    </EditorPanel>
  );
}

function DocumentsAdmin() {
  const t = useT();
  const docs = useStore((s) => s.documents);
  const [editing, setEditing] = useState<DDraft | null>(null);
  return (
    <>
      <div className="toolbar">
        <span className="meta">
          {docs.length} · {t("admin.documents")}
        </span>
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            setEditing({
              title: "",
              category: "technical",
              edition: String(new Date().getFullYear()),
              pages: 12,
              sizeMb: 0,
              file: "",
            })
          }
        >
          <PlusIcon />
          {t("admin.add")}
        </button>
      </div>
      {editing && (
        <DocumentEditor
          key={editing.id ?? "new"}
          initial={editing}
          onDone={() => setEditing(null)}
        />
      )}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.name")}</th>
              <th>{t("admin.category")}</th>
              <th>{t("admin.edition")}</th>
              <th>{t("admin.file")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td className="clamp">{d.title}</td>
                <td>{t(`cat.${d.category}` as Key)}</td>
                <td>{d.edition}</td>
                <td className="mono clamp">{d.file}</td>
                <RowActions
                  onEdit={() => setEditing(d)}
                  onDelete={() => deleteDocument(d.id)}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------------------------------- View ---------------------------------- */

const TABS = [
  { id: "questions", key: "admin.questions" },
  { id: "videos", key: "admin.videos" },
  { id: "documents", key: "admin.documents" },
] as const;

export default function AdminView() {
  const t = useT();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("questions");
  return (
    <RoleGate need="academy">
      <section className="weapon-head">
        <h1 className="display-h1">{t("admin.title")}</h1>
        <p className="lede">{t("admin.lede")}</p>
      </section>
      <p className="demo-note">{t("admin.demoNote")}</p>
      <div className="segmented" role="tablist">
        {TABS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            className={tab === x.id ? "on" : ""}
            onClick={() => setTab(x.id)}
          >
            {t(x.key)}
          </button>
        ))}
      </div>
      {tab === "questions" && <QuestionsAdmin />}
      {tab === "videos" && <VideosAdmin />}
      {tab === "documents" && <DocumentsAdmin />}
    </RoleGate>
  );
}
