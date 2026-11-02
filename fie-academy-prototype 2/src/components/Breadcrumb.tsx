import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";

export interface Crumb {
  label: ReactNode;
  href?: string;
  square?: string;
}

export function Breadcrumb({
  items,
  style,
}: {
  items: Crumb[];
  style?: CSSProperties;
}) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb" style={style}>
      {items.map((c, i) => {
        const last = i === items.length - 1;
        let content: ReactNode = (
          <>
            {c.square && (
              <span className="crumb-square" style={{ background: c.square }} />
            )}
            {c.label}
          </>
        );
        if (c.href && !last) content = <Link href={c.href}>{content}</Link>;
        return (
          <Fragment key={i}>
            {i > 0 && <span className="sep">›</span>}
            <span
              className={`crumb${last ? " last" : ""}`}
              aria-current={last ? "page" : undefined}
            >
              {content}
            </span>
          </Fragment>
        );
      })}
    </nav>
  );
}
