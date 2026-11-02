"use client";

import Link from "next/link";
import { useState } from "react";
import { useT, type TFn } from "@/lib/i18n";
import { LEVELS, PASS_MARK, TEST_SIZE, type Question } from "@/lib/refereeing";
import { levelProgress, submitTest, useStore } from "@/lib/store";
import { Breadcrumb } from "../Breadcrumb";
import {
  ArrowRight,
  CheckIcon,
  ChevronLeft,
  CloseIcon,
  LockIcon,
} from "../Icons";
import { levelName } from "./common";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Draws TEST_SIZE distinct questions and shuffles single-choice options. */
function draw(bank: Question[]): Question[] {
  return shuffle(bank)
    .slice(0, TEST_SIZE)
    .map((q) => {
      if (q.type === "truefalse") return q;
      const order = shuffle(q.options.map((_, i) => i));
      return {
        ...q,
        options: order.map((i) => q.options[i]),
        answer: order.indexOf(q.answer),
      };
    });
}

const optionLabel = (t: TFn, q: Question, i: number) =>
  q.type === "truefalse"
    ? t(i === 0 ? "quiz.true" : "quiz.false")
    : q.options[i];

export default function QuizView({ slug }: { slug: string }) {
  const t = useT();
  const completed = useStore((s) => s.completed);
  const passedMap = useStore((s) => s.passed);
  const bank = useStore((s) => s.questions);
  const idx = LEVELS.findIndex((l) => l.slug === slug);
  const lv = LEVELS[idx];
  const nextLv = LEVELS[idx + 1];
  const p = levelProgress(completed, passedMap, idx);
  const levelBank = bank.filter((q) => q.level === slug);
  const name = levelName(t, slug);
  const need = Math.ceil(TEST_SIZE * PASS_MARK);

  const [phase, setPhase] = useState<"intro" | "running" | "result">("intro");
  const [qs, setQs] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [cur, setCur] = useState(0);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);

  const start = () => {
    setQs(draw(levelBank));
    setAnswers(Array(TEST_SIZE).fill(null));
    setCur(0);
    setResult(null);
    setPhase("running");
  };

  const submit = () => {
    const score = qs.reduce(
      (n, q, i) => n + (answers[i] === q.answer ? 1 : 0),
      0,
    );
    setResult({ score, passed: submitTest(slug, score) });
    setPhase("result");
  };

  const crumbs = (
    <Breadcrumb
      items={[
        { label: "FIE Fencing Academy", href: "/" },
        { label: t("ref.title"), href: "/refereeing" },
        { label: name, href: `/refereeing/courses/${slug}`, square: lv.color },
        { label: t("course.test") },
      ]}
    />
  );
  const backLink = (
    <Link href={`/refereeing/courses/${slug}`} className="btn-ghost">
      <ChevronLeft />
      {t("quiz.backToLevel")}
    </Link>
  );

  let body;
  if (phase === "intro") {
    const blocked = !p.unlocked
      ? t("quiz.locked")
      : !p.ready
        ? t("quiz.notReady")
        : levelBank.length < TEST_SIZE
          ? t("quiz.bankTooSmall", { size: TEST_SIZE })
          : null;
    body = (
      <section className="quiz-card">
        <h1 className="lesson-h1">{t("quiz.title", { level: name })}</h1>
        <ul className="quiz-rules">
          <li>
            {t("quiz.introQuestions", {
              size: TEST_SIZE,
              bank: levelBank.length,
            })}
          </li>
          <li>
            {t("quiz.introPass", {
              pct: PASS_MARK * 100,
              need,
              size: TEST_SIZE,
            })}
          </li>
          <li>{t("quiz.introFail")}</li>
          <li>{t("quiz.introHistory")}</li>
        </ul>
        {blocked ? (
          <div className="notice">
            <LockIcon size={16} />
            <span>{blocked}</span>
          </div>
        ) : null}
        <div className="quiz-actions">
          {backLink}
          {!blocked && (
            <button type="button" className="btn-primary" onClick={start}>
              {t("quiz.start")}
              <ArrowRight />
            </button>
          )}
        </div>
      </section>
    );
  } else if (phase === "running") {
    const q = qs[cur];
    const last = cur === qs.length - 1;
    body = (
      <section className="quiz-card">
        <div className="quiz-progress">
          <span className="eyebrow" style={{ color: lv.ink }}>
            {t("quiz.questionN", { n: cur + 1, size: qs.length })}
          </span>
          <div className="quiz-dots" aria-hidden>
            {qs.map((_, i) => (
              <span
                key={i}
                className={
                  i === cur ? "cur" : answers[i] !== null ? "answered" : ""
                }
                style={
                  i === cur || answers[i] !== null
                    ? { background: lv.color }
                    : undefined
                }
              />
            ))}
          </div>
        </div>
        <fieldset className="quiz-question" key={q.id}>
          <legend>{q.prompt}</legend>
          {q.options.map((_, i) => (
            <label
              key={i}
              className={`quiz-option${answers[cur] === i ? " on" : ""}`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={answers[cur] === i}
                onChange={() =>
                  setAnswers((a) => a.map((v, j) => (j === cur ? i : v)))
                }
              />
              <span>{optionLabel(t, q, i)}</span>
            </label>
          ))}
        </fieldset>
        <div className="quiz-actions">
          <button
            type="button"
            className="btn-ghost"
            disabled={cur === 0}
            onClick={() => setCur((c) => c - 1)}
          >
            <ChevronLeft />
            {t("quiz.back")}
          </button>
          {last ? (
            <button
              type="button"
              className="btn-primary"
              disabled={answers.some((a) => a === null)}
              onClick={submit}
            >
              {t("quiz.submit")}
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={answers[cur] === null}
              onClick={() => setCur((c) => c + 1)}
            >
              {t("quiz.next")}
              <ArrowRight />
            </button>
          )}
        </div>
      </section>
    );
  } else if (result) {
    body = (
      <>
        <section
          className={`quiz-card result ${result.passed ? "pass" : "fail"}`}
        >
          <span
            className={`status-badge lg ${result.passed ? "passed" : "failed"}`}
          >
            {result.passed ? (
              <CheckIcon size={14} strokeWidth={3} />
            ) : (
              <CloseIcon size={14} />
            )}
            {result.passed ? t("quiz.passed") : t("quiz.failed")}
          </span>
          <div className="quiz-score">
            {t("quiz.score", { score: result.score, size: TEST_SIZE })}
          </div>
          <p className="lede">
            {result.passed
              ? nextLv
                ? t("quiz.unlocked", { level: levelName(t, nextLv.slug) })
                : t("quiz.allDone")
              : t("quiz.resetNotice")}
          </p>
          <div className="quiz-actions">
            {backLink}
            {result.passed && nextLv ? (
              <Link
                href={`/refereeing/courses/${nextLv.slug}`}
                className="btn-primary"
              >
                {t("quiz.goTo", { level: levelName(t, nextLv.slug) })}
                <ArrowRight />
              </Link>
            ) : null}
          </div>
        </section>

        <section className="quiz-review">
          <h2 className="module-title">{t("quiz.review")}</h2>
          <ol>
            {qs.map((q, i) => {
              const ok = answers[i] === q.answer;
              return (
                <li key={q.id} className={ok ? "ok" : "ko"}>
                  <div className="review-prompt">
                    <span className="review-icon">
                      {ok ? (
                        <CheckIcon size={13} strokeWidth={3} />
                      ) : (
                        <CloseIcon size={13} />
                      )}
                    </span>
                    {q.prompt}
                  </div>
                  {!ok && (
                    <div className="review-line">
                      <span className="meta">{t("quiz.yourAnswer")}</span>
                      {answers[i] !== null && optionLabel(t, q, answers[i]!)}
                    </div>
                  )}
                  <div className="review-line">
                    <span className="meta">{t("quiz.correctAnswer")}</span>
                    {optionLabel(t, q, q.answer)}
                  </div>
                  <p className="review-expl">{q.explanation}</p>
                </li>
              );
            })}
          </ol>
        </section>
      </>
    );
  }

  return (
    <>
      {crumbs}
      <div className="quiz-wrap">{body}</div>
    </>
  );
}
