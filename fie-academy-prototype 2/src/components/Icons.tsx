import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const stroke = (size: number, rest: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...rest,
});

export const SunIcon = ({ size = 16, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const ArrowRight = ({ size = 14, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ArrowDown = ({ size = 13, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

export const ChevronRight = ({ size = 13, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ChevronLeft = ({ size = 13, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const ChevronDown = ({ size = 13, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const MenuIcon = ({ size = 16, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const CloseIcon = ({ size = 16, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const PlayIcon = ({ size = 18, ...r }: P) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    {...r}
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const PauseIcon = ({ size = 18, ...r }: P) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    {...r}
  >
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);

export const VolumeIcon = ({ size = 16, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7" />
  </svg>
);

export const MaximizeIcon = ({ size = 16, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
  </svg>
);

export const LightbulbIcon = ({ size = 16, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z" />
  </svg>
);

export const CheckIcon = ({ size = 14, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const LockIcon = ({ size = 14, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const LayersIcon = ({ size = 20, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="m12 2 10 5-10 5L2 7l10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export const FileIcon = ({ size = 20, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M8 13h8M8 17h5" />
  </svg>
);

export const ScaleIcon = ({ size = 20, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M12 3v18M5 21h14M3 7h18M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z" />
  </svg>
);

export const BookIcon = ({ size = 20, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
  </svg>
);

export const VideoIcon = ({ size = 20, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <rect x="2" y="5" width="14" height="14" rx="2" />
    <path d="m16 10 6-3v10l-6-3z" />
  </svg>
);

export const DownloadIcon = ({ size = 14, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
);

export const EyeIcon = ({ size = 14, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const SearchIcon = ({ size = 15, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const PlusIcon = ({ size = 14, ...r }: P) => (
  <svg {...stroke(size, r)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
