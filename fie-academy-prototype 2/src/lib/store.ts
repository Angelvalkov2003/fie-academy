"use client";

// Demo-only client store persisted in localStorage. In the platform this state lives on the server.
import { useSyncExternalStore } from "react";
import {
  LEVELS,
  SEED_DOCUMENTS,
  SEED_QUESTIONS,
  SEED_VIDEOS,
  TEST_SIZE,
  PASS_MARK,
  fmtDuration,
  lessonHref,
  lessonKey,
  levelLessonKeys,
  type LibraryVideo,
  type Question,
  type RuleDoc,
} from "./refereeing";

export type Role = "default" | "academy" | "fie";
export type Lang = "en" | "fr" | "es";
export const LANGS: Lang[] = ["en", "fr", "es"];
export const ROLES: Role[] = ["default", "academy", "fie"];

export const DEMO_USERS: Record<Role, { name: string; initials: string }> = {
  default: { name: "Marie Vasseur", initials: "MV" },
  academy: { name: "Laura Bianchi", initials: "LB" },
  fie: { name: "Thomas Keller", initials: "TK" },
};

export interface Attempt {
  date: string;
  score: number;
}

export type AuditAction = "create" | "update" | "delete" | "upload";
export type ContentType = "question" | "video" | "document";

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: AuditAction;
  type: ContentType;
  item: string;
  before?: string;
  after?: string;
}

export interface State {
  signedIn: boolean;
  role: Role;
  lang: Lang;
  completed: string[];
  /** Successful attempts only, per level. */
  passed: Record<string, Attempt[]>;
  questions: Question[];
  videos: LibraryVideo[];
  documents: RuleDoc[];
  audit: AuditEntry[];
}

const describeQuestion = (q: Question) =>
  `${q.prompt} — correct: ${q.options[q.answer]}`;
const describeVideo = (v: LibraryVideo) =>
  `${v.title} · ${v.weapon} · ${v.topic} · ${fmtDuration(v.duration)}`;
const describeDoc = (d: RuleDoc) =>
  `${d.title} · ${d.category} · ed. ${d.edition} · ${d.file}`;

const [beginner, intermediate] = LEVELS;

const SEED: State = {
  signedIn: true,
  role: "default",
  lang: "en",
  completed: [
    ...levelLessonKeys(beginner),
    ...levelLessonKeys(intermediate).slice(0, 3),
  ],
  passed: { beginner: [{ date: "2026-10-12T09:41:00.000Z", score: 9 }] },
  questions: SEED_QUESTIONS,
  videos: SEED_VIDEOS,
  documents: SEED_DOCUMENTS,
  audit: [
    {
      id: "a1",
      at: "2026-10-30T15:12:00.000Z",
      actor: "Laura Bianchi",
      action: "update",
      type: "question",
      item: "A fencer crosses the rear limit of the piste with both feet. What follows?",
      before: "A fencer crosses the rear limit… — correct: A yellow card",
      after:
        "A fencer crosses the rear limit of the piste with both feet. What follows? — correct: A touch is awarded against that fencer",
    },
    {
      id: "a2",
      at: "2026-10-29T10:03:00.000Z",
      actor: "Diego Romero",
      action: "create",
      type: "video",
      item: "Video review: remise or riposte?",
      after: "Video review: remise or riposte? · sabre · Video review · 2:51",
    },
    {
      id: "a3",
      at: "2026-10-28T17:46:00.000Z",
      actor: "Laura Bianchi",
      action: "upload",
      type: "document",
      item: "Video Refereeing Protocol",
      after:
        "Video Refereeing Protocol · technical · ed. 2026 · fie-video-protocol-2026.pdf",
    },
    {
      id: "a4",
      at: "2026-10-27T08:20:00.000Z",
      actor: "Diego Romero",
      action: "delete",
      type: "video",
      item: "Old halt demonstration (2019)",
      before: "Old halt demonstration (2019) · foil · Penalties · 1:12",
    },
    {
      id: "a5",
      at: "2026-10-24T13:31:00.000Z",
      actor: "Laura Bianchi",
      action: "create",
      type: "question",
      item: "Fatigue over a long competition day is best managed by…",
      after:
        "Fatigue over a long competition day is best managed by… — correct: Rotation, hydration and short recovery breaks",
    },
    {
      id: "a6",
      at: "2026-10-21T11:05:00.000Z",
      actor: "Diego Romero",
      action: "update",
      type: "document",
      item: "Refereeing Gestures Handbook",
      before:
        "Refereeing Gestures Handbook · technical · ed. 2024 · fie-referee-gestures-2024.pdf",
      after:
        "Refereeing Gestures Handbook · technical · ed. 2025 · fie-referee-gestures-2025.pdf",
    },
  ],
};

const KEY = "fie-academy-demo-v1";
let state: State = SEED;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...SEED, ...JSON.parse(raw) };
  } catch {
    state = SEED;
  }
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getState() {
  load();
  return state;
}

function setState(fn: (s: State) => State) {
  load();
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or disabled: keep the in-memory state.
  }
  listeners.forEach((l) => l());
}

/** Selectors must return existing references (slices), not new objects. */
export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(SEED),
  );
}

/* --------------------------------- Actions -------------------------------- */

export const setRole = (role: Role) => setState((s) => ({ ...s, role }));
/** Demo only: no credentials are checked or stored. */
export const signIn = (role: Role = "default") =>
  setState((s) => ({ ...s, signedIn: true, role }));
export const signOut = () => setState((s) => ({ ...s, signedIn: false }));
export const setLang = (lang: Lang) => setState((s) => ({ ...s, lang }));
export const resetDemo = () =>
  setState((s) => ({ ...SEED, role: s.role, lang: s.lang }));

export const completeLesson = (key: string) =>
  setState((s) =>
    s.completed.includes(key) ? s : { ...s, completed: [...s.completed, key] },
  );

/** Records a test result. A fail resets the lesson progress of that level. */
export function submitTest(level: string, score: number) {
  const passed = score / TEST_SIZE >= PASS_MARK;
  setState((s) =>
    passed
      ? {
          ...s,
          passed: {
            ...s.passed,
            [level]: [
              ...(s.passed[level] ?? []),
              { date: new Date().toISOString(), score },
            ],
          },
        }
      : {
          ...s,
          completed: s.completed.filter((k) => !k.startsWith(`${level}/`)),
        },
  );
  return passed;
}

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

function withAudit(
  s: State,
  e: Omit<AuditEntry, "id" | "at" | "actor">,
): AuditEntry[] {
  return [
    {
      id: newId("a"),
      at: new Date().toISOString(),
      actor: DEMO_USERS[s.role].name,
      ...e,
    },
    ...s.audit,
  ];
}

export function saveQuestion(q: Omit<Question, "id"> & { id?: string }) {
  setState((s) => {
    const prev = q.id ? s.questions.find((x) => x.id === q.id) : undefined;
    const next: Question = { ...q, id: prev?.id ?? newId("q") };
    return {
      ...s,
      questions: prev
        ? s.questions.map((x) => (x.id === prev.id ? next : x))
        : [...s.questions, next],
      audit: withAudit(s, {
        action: prev ? "update" : "create",
        type: "question",
        item: next.prompt,
        before: prev && describeQuestion(prev),
        after: describeQuestion(next),
      }),
    };
  });
}

export function deleteQuestion(id: string) {
  setState((s) => {
    const prev = s.questions.find((x) => x.id === id);
    if (!prev) return s;
    return {
      ...s,
      questions: s.questions.filter((x) => x.id !== id),
      audit: withAudit(s, {
        action: "delete",
        type: "question",
        item: prev.prompt,
        before: describeQuestion(prev),
      }),
    };
  });
}

export function saveVideo(v: Omit<LibraryVideo, "id"> & { id?: string }) {
  setState((s) => {
    const prev = v.id ? s.videos.find((x) => x.id === v.id) : undefined;
    const next: LibraryVideo = { ...v, id: prev?.id ?? newId("v") };
    return {
      ...s,
      videos: prev
        ? s.videos.map((x) => (x.id === prev.id ? next : x))
        : [next, ...s.videos],
      audit: withAudit(s, {
        action: prev ? "update" : "create",
        type: "video",
        item: next.title,
        before: prev && describeVideo(prev),
        after: describeVideo(next),
      }),
    };
  });
}

export function deleteVideo(id: string) {
  setState((s) => {
    const prev = s.videos.find((x) => x.id === id);
    if (!prev) return s;
    return {
      ...s,
      videos: s.videos.filter((x) => x.id !== id),
      audit: withAudit(s, {
        action: "delete",
        type: "video",
        item: prev.title,
        before: describeVideo(prev),
      }),
    };
  });
}

export function saveDocument(d: Omit<RuleDoc, "id"> & { id?: string }) {
  setState((s) => {
    const prev = d.id ? s.documents.find((x) => x.id === d.id) : undefined;
    const next: RuleDoc = { ...d, id: prev?.id ?? newId("d") };
    return {
      ...s,
      documents: prev
        ? s.documents.map((x) => (x.id === prev.id ? next : x))
        : [...s.documents, next],
      audit: withAudit(s, {
        action: prev ? "update" : "upload",
        type: "document",
        item: next.title,
        before: prev && describeDoc(prev),
        after: describeDoc(next),
      }),
    };
  });
}

export function deleteDocument(id: string) {
  setState((s) => {
    const prev = s.documents.find((x) => x.id === id);
    if (!prev) return s;
    return {
      ...s,
      documents: s.documents.filter((x) => x.id !== id),
      audit: withAudit(s, {
        action: "delete",
        type: "document",
        item: prev.title,
        before: describeDoc(prev),
      }),
    };
  });
}

/* --------------------------------- Derived -------------------------------- */

export interface LevelProgress {
  unlocked: boolean;
  passed: boolean;
  done: number;
  total: number;
  /** All lessons of both modules completed, so the test is available. */
  ready: boolean;
  attempts: Attempt[];
}

export function levelProgress(
  completed: string[],
  passed: Record<string, Attempt[]>,
  idx: number,
): LevelProgress {
  const lv = LEVELS[idx];
  const keys = levelLessonKeys(lv);
  const done = keys.filter((k) => completed.includes(k)).length;
  const attempts = passed[lv.slug] ?? [];
  return {
    unlocked: idx === 0 || (passed[LEVELS[idx - 1].slug]?.length ?? 0) > 0,
    passed: attempts.length > 0,
    done,
    total: keys.length,
    ready: done === keys.length,
    attempts,
  };
}

/** Overall course progress: each level counts its lessons plus one for the test. */
export function courseProgress(
  completed: string[],
  passed: Record<string, Attempt[]>,
) {
  let done = 0;
  let total = 0;
  LEVELS.forEach((_, i) => {
    const p = levelProgress(completed, passed, i);
    done += (p.unlocked ? p.done : 0) + (p.passed ? 1 : 0);
    total += p.total + 1;
  });
  return Math.round((done / total) * 100);
}

/** Where "Continue" should take the learner: next unfinished lesson, else the pending test. */
export function nextStep(
  completed: string[],
  passed: Record<string, Attempt[]>,
): { href: string; level: number } {
  for (let i = 0; i < LEVELS.length; i++) {
    const p = levelProgress(completed, passed, i);
    if (!p.unlocked || p.passed) continue;
    const lv = LEVELS[i];
    for (const m of lv.modules)
      for (const l of m.lessons)
        if (!completed.includes(lessonKey(lv.slug, m.slug, l)))
          return { href: lessonHref(lv.slug, m.slug, l), level: i };
    return { href: `/refereeing/courses/${lv.slug}/test`, level: i };
  }
  return { href: "/refereeing/courses", level: LEVELS.length - 1 };
}
