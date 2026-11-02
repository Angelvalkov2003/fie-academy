"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { ACADEMIES, type Academy } from "@/lib/data";
import { useT, type Key, type TFn } from "@/lib/i18n";
import {
  DEMO_USERS,
  LANGS,
  ROLES,
  resetDemo,
  setLang,
  setRole,
  signOut,
  useStore,
} from "@/lib/store";
import { ChevronDown, SunIcon } from "./Icons";
import { Logo } from "./Logo";

export const academyLabel = (t: TFn, a: Academy) =>
  `${t(`academy.${a.slug}` as Key)}${a.sub ? ` · ${a.sub}` : ""}`;

function useDismiss(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", esc);
    };
  }, [open, ref, close]);
}

export function LangToggle() {
  const lang = useStore((s) => s.lang);
  const t = useT();
  return (
    <div className="lang" role="group" aria-label={t("nav.language")}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          className={lang === l ? "on" : ""}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Avatar with a demo-only account switcher (Default / Academy / FIE). */
export function AccountMenu() {
  const t = useT();
  const role = useStore((s) => s.role);
  const signedIn = useStore((s) => s.signedIn);
  const user = DEMO_USERS[role];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useDismiss(open, ref, close);

  if (!signedIn)
    return (
      <Link href="/login" className="btn-signin">
        {t("auth.signIn")}
      </Link>
    );

  return (
    <div className="account" ref={ref}>
      <button
        type="button"
        className="avatar"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${user.name} — ${t(`role.${role}` as Key)}`}
        onClick={() => setOpen((o) => !o)}
      >
        {user.initials}
      </button>
      {open && (
        <div className="account-menu" role="menu">
          <div className="account-who">
            <strong>{user.name}</strong>
            <span>{t(`role.${role}` as Key)}</span>
          </div>
          <div className="account-group">
            <div className="eyebrow">{t("role.switch")}</div>
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                role="menuitemradio"
                aria-checked={r === role}
                className={r === role ? "on" : ""}
                onClick={() => setRole(r)}
              >
                <span className="radio" />
                {t(`role.${r}` as Key)}
              </button>
            ))}
          </div>
          {role === "academy" && (
            <Link role="menuitem" href="/admin" onClick={close}>
              {t("menu.admin")}
            </Link>
          )}
          {role === "fie" && (
            <Link role="menuitem" href="/audit" onClick={close}>
              {t("menu.audit")}
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            className="account-reset"
            onClick={() => {
              resetDemo();
              close();
            }}
          >
            {t("menu.reset")}
          </button>
          <Link
            role="menuitem"
            href="/login"
            className="account-signout"
            onClick={() => {
              signOut();
              close();
            }}
          >
            {t("auth.signOut")}
          </Link>
        </div>
      )}
    </div>
  );
}

export function TopBar({ active }: { active?: string }) {
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = ACADEMIES.find((a) => a.slug === active);
  const close = () => setMenuOpen(false);
  useDismiss(menuOpen, menuRef, close);

  return (
    <header className="topbar">
      <Link href="/" className="brand" aria-label="FIE Fencing Academy — home">
        <Logo height={38} />
      </Link>

      <nav className="tabs" aria-label={t("nav.academies")}>
        {ACADEMIES.map((a) => (
          <Link
            key={a.slug}
            href={a.href}
            className={`tab${a.slug === active ? " on" : ""}`}
            aria-current={a.slug === active ? "page" : undefined}
          >
            {a.enrolled && <span className="enrolled-dot" />}
            {academyLabel(t, a)}
          </Link>
        ))}
      </nav>

      <div className="tabs-menu" ref={menuRef}>
        <button
          type="button"
          className="tabs-menu-btn"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {current ? academyLabel(t, current) : t("nav.academies")}
          <ChevronDown size={13} />
        </button>
        {menuOpen && (
          <div className="tabs-menu-list" role="menu">
            {ACADEMIES.map((a) => (
              <Link
                key={a.slug}
                role="menuitem"
                href={a.href}
                className={a.slug === active ? "on" : ""}
                onClick={close}
              >
                {a.enrolled ? (
                  <span className="enrolled-dot" />
                ) : (
                  <span style={{ width: 6 }} />
                )}
                {academyLabel(t, a)}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="utils">
        <LangToggle />
        <button
          type="button"
          className="icon-btn"
          aria-label="Toggle theme (dark mode not designed yet)"
          title="Dark mode — not designed yet"
        >
          <SunIcon />
        </button>
        <AccountMenu />
      </div>
    </header>
  );
}
