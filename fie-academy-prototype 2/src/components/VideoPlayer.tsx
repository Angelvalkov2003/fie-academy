"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { fmtDuration } from "@/lib/refereeing";
import { MaximizeIcon, PauseIcon, PlayIcon, VolumeIcon } from "./Icons";

/** Mock player: simulates playback until real video hosting is decided. */
export function VideoPlayer({
  file,
  duration,
  start = 0,
  caption,
  label = "FIE Official Demonstration",
}: {
  file: string;
  duration: number;
  start?: number;
  caption?: string;
  label?: string;
}) {
  const [t, setT] = useState(start);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setT((v) => {
        if (v + 0.25 >= duration) {
          setPlaying(false);
          return duration;
        }
        return v + 0.25;
      });
    }, 250);
    return () => clearInterval(id);
  }, [playing, duration]);

  const toggle = () => {
    if (!playing && t >= duration) setT(0);
    setPlaying((p) => !p);
  };
  const seek = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setT(
      Math.max(
        0,
        Math.min(duration, ((e.clientX - r.left) / r.width) * duration),
      ),
    );
  };

  return (
    <figure style={{ margin: "0 0 14px" }}>
      <div className="player">
        <div className="stripes-dark" />
        {!playing && (
          <div className="player-center">
            <button
              type="button"
              className="player-play"
              onClick={toggle}
              aria-label="Play video"
            >
              <PlayIcon size={24} />
            </button>
            <span className="player-file">video · {file}</span>
          </div>
        )}
        {playing && (
          <div
            className="player-center"
            onClick={toggle}
            style={{ cursor: "pointer" }}
          />
        )}
        <div className="player-label">
          <span
            className="cdot"
            style={{ width: 7, height: 7, background: "var(--blue)" }}
          />
          {label}
        </div>
        <div className="player-controls">
          <div
            className="scrubber"
            onClick={seek}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={Math.round(t)}
          >
            <div style={{ width: `${(t / duration) * 100}%` }} />
          </div>
          <div className="controls-row">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <PauseIcon size={17} /> : <PlayIcon size={17} />}
            </button>
            <button type="button" aria-label="Volume">
              <VolumeIcon />
            </button>
            <span className="player-time">
              {fmtDuration(t)} / {fmtDuration(duration)}
            </span>
            <span style={{ flex: 1 }} />
            <span className="quality">1080p</span>
            <button type="button" aria-label="Fullscreen">
              <MaximizeIcon />
            </button>
          </div>
        </div>
      </div>
      {caption && <figcaption className="caption">{caption}</figcaption>}
    </figure>
  );
}
