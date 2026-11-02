"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { useT, type Key } from "@/lib/i18n";
import {
  LANGS,
  ROLES,
  setLang,
  signIn,
  useStore,
  type Lang,
} from "@/lib/store";
import { Logo } from "../Logo";
import { LangToggle } from "../TopBar";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

function AuthShell({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <div className="auth">
      <aside className="auth-brand">
        <Link href="/" aria-label="FIE Fencing Academy — home">
          <Logo height={64} className="auth-logo" />
        </Link>
        <p className="auth-tagline">{t("auth.tagline")}</p>
        <div className="auth-piste" aria-hidden>
          <div className="feat-piste">
            <span className="fp-warn" style={{ left: 0 }} />
            <span className="fp-warn" style={{ right: 0 }} />
            {[2, 5, 7, 9, 12].map((m) => (
              <span
                key={m}
                className={`fp-line${m === 7 ? " centre" : ""}`}
                style={{ left: `${(m / 14) * 100}%` }}
              />
            ))}
            <span className="fp-referee" style={{ left: "50%" }} />
          </div>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-top">
          <LangToggle />
        </div>
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="meta">{hint}</span>
      )}
    </label>
  );
}

function PasswordInput({
  value,
  onChange,
  autoComplete,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  invalid?: boolean;
}) {
  const t = useT();
  const [show, setShow] = useState(false);
  return (
    <span className="password">
      <input
        className="input"
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="link-btn"
        onClick={() => setShow((s) => !s)}
      >
        {show ? t("auth.hide") : t("auth.show")}
      </button>
    </span>
  );
}

type Errors = Partial<Record<string, string>>;

export function LoginView() {
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!EMAIL_RE.test(email.trim())) errs.email = t("auth.errEmail");
    if (!password) errs.password = t("auth.errPassword");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    signIn("default");
    router.push("/");
  };

  return (
    <AuthShell>
      <h1 className="auth-title">{t("auth.signInTitle")}</h1>
      <p className="auth-lede">{t("auth.signInLede")}</p>
      <form className="auth-form" onSubmit={submit} noValidate>
        <Field label={t("auth.email")} error={errors.email}>
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            aria-invalid={!!errors.email || undefined}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label={t("auth.password")} error={errors.password}>
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            invalid={!!errors.password}
          />
        </Field>
        <div className="auth-row">
          <label className="check">
            <input type="checkbox" defaultChecked />
            {t("auth.remember")}
          </label>
          <Link href="/forgot-password" className="link-muted">
            {t("auth.forgot")}
          </Link>
        </div>
        <button type="submit" className="btn-primary auth-submit">
          {t("auth.signIn")}
        </button>
      </form>
      <p className="auth-switch">
        {t("auth.noAccount")}{" "}
        <Link href="/register">{t("auth.createAccount")}</Link>
      </p>

      <div className="auth-demo">
        <div className="eyebrow">{t("auth.demo")}</div>
        <div className="auth-demo-buttons">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              className="btn-ghost"
              onClick={() => {
                signIn(r);
                router.push(
                  r === "academy" ? "/admin" : r === "fie" ? "/audit" : "/",
                );
              }}
            >
              {t(`role.${r}` as Key)}
            </button>
          ))}
        </div>
        <p className="meta">{t("auth.demoNote")}</p>
      </div>
    </AuthShell>
  );
}

export function RegisterView() {
  const t = useT();
  const router = useRouter();
  const lang = useStore((s) => s.lang);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!form.name.trim()) errs.name = t("auth.errName");
    if (!EMAIL_RE.test(form.email.trim())) errs.email = t("auth.errEmail");
    if (form.password.length < 8) errs.password = t("auth.errPasswordLen");
    if (form.confirm !== form.password) errs.confirm = t("auth.errConfirm");
    if (!form.terms) errs.terms = t("auth.errTerms");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    signIn("default");
    setDone(true);
  };

  if (done)
    return (
      <AuthShell>
        <h1 className="auth-title">{t("auth.createdTitle")}</h1>
        <p className="auth-lede">{t("auth.createdBody")}</p>
        <button
          type="button"
          className="btn-primary auth-submit"
          onClick={() => router.push("/")}
        >
          {t("auth.continue")}
        </button>
      </AuthShell>
    );

  return (
    <AuthShell>
      <h1 className="auth-title">{t("auth.registerTitle")}</h1>
      <p className="auth-lede">{t("auth.registerLede")}</p>
      <form className="auth-form" onSubmit={submit} noValidate>
        <Field label={t("auth.name")} error={errors.name}>
          <input
            className="input"
            autoComplete="name"
            value={form.name}
            aria-invalid={!!errors.name || undefined}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label={t("auth.email")} error={errors.email}>
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={form.email}
            aria-invalid={!!errors.email || undefined}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field
          label={t("auth.password")}
          error={errors.password}
          hint={t("auth.passwordHint")}
        >
          <PasswordInput
            value={form.password}
            onChange={(v) => set("password", v)}
            autoComplete="new-password"
            invalid={!!errors.password}
          />
        </Field>
        <Field label={t("auth.confirm")} error={errors.confirm}>
          <PasswordInput
            value={form.confirm}
            onChange={(v) => set("confirm", v)}
            autoComplete="new-password"
            invalid={!!errors.confirm}
          />
        </Field>
        <Field label={t("auth.language")}>
          <select
            className="select"
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {LANG_NAMES[l]}
              </option>
            ))}
          </select>
        </Field>
        <label className="check">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => set("terms", e.target.checked)}
          />
          {t("auth.terms")}
        </label>
        {errors.terms && (
          <span className="field-error" role="alert">
            {errors.terms}
          </span>
        )}
        <button type="submit" className="btn-primary auth-submit">
          {t("auth.register")}
        </button>
      </form>
      <p className="auth-switch">
        {t("auth.haveAccount")} <Link href="/login">{t("auth.signIn")}</Link>
      </p>
    </AuthShell>
  );
}

export function ForgotView() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError(t("auth.errEmail"));
    setError(undefined);
    setSent(true);
  };

  return (
    <AuthShell>
      {sent ? (
        <>
          <h1 className="auth-title">{t("auth.sentTitle")}</h1>
          {/* Same message whether or not the account exists, so emails can't be probed. */}
          <p className="auth-lede">
            {t("auth.sentBody", { email: email.trim() })}
          </p>
        </>
      ) : (
        <>
          <h1 className="auth-title">{t("auth.forgotTitle")}</h1>
          <p className="auth-lede">{t("auth.forgotLede")}</p>
          <form className="auth-form" onSubmit={submit} noValidate>
            <Field label={t("auth.email")} error={error}>
              <input
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                aria-invalid={!!error || undefined}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <button type="submit" className="btn-primary auth-submit">
              {t("auth.sendLink")}
            </button>
          </form>
        </>
      )}
      <p className="auth-switch">
        <Link href="/login">{t("auth.backToSignIn")}</Link>
      </p>
    </AuthShell>
  );
}
