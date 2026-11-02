"use client";

import type { Key, TFn } from "@/lib/i18n";
import type { LevelProgress } from "@/lib/store";
import { CheckIcon, LockIcon } from "../Icons";

export const levelName = (t: TFn, slug: string) => t(`level.${slug}` as Key);
export const moduleName = (t: TFn, slug: string) => t(`module.${slug}` as Key);

export function statusKey(p: LevelProgress): Key {
  if (p.passed) return "course.passed";
  if (!p.unlocked) return "course.locked";
  return p.done > 0 ? "course.inProgress" : "course.notStarted";
}

export function StatusBadge({ p, t }: { p: LevelProgress; t: TFn }) {
  const key = statusKey(p);
  return (
    <span className={`status-badge ${key.split(".")[1]}`}>
      {p.passed && <CheckIcon size={12} strokeWidth={3} />}
      {!p.unlocked && <LockIcon size={12} />}
      {t(key)}
    </span>
  );
}

export function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="progress-track">
      <div style={{ width: `${value}%`, background: color }} />
    </div>
  );
}
