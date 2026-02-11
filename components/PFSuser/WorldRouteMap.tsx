"use client";

import * as React from "react";

type Geometry = Record<string, string>;

type Props = {
  className?: string;
  geometryUrl?: string;

  /** labels only (recommended) */
  startLabel?: string;
  endLabel?: string;

  /** optional override if you already have good coordinates */
  start?: { x: number; y: number; label?: string };
  end?: { x: number; y: number; label?: string };
};

const DEFAULT_GEOMETRY_URL =
  "https://raw.githubusercontent.com/GuardianInteractive/world-map/master/geometry.json";

const VB_W = 1000;
const VB_H = 507;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function toVB(p: { x: number; y: number; label?: string }) {
  return {
    x: clamp01(p.x) * VB_W,
    y: clamp01(p.y) * VB_H,
    label: p.label,
  };
}

/**
 * ✅ Anchor points tuned for Guardian world geometry (Robinson projection)
 * These are approximate but visually correct.
 * Add more as you need.
 */
const CITY_ANCHORS: Record<string, { x: number; y: number }> = {
  // China
  shanghai: { x: 0.82, y: 0.42 },
  ningbo: { x: 0.825, y: 0.43 },
  shenzhen: { x: 0.80, y: 0.47 },

  // Netherlands
  rotterdam: { x: 0.52, y: 0.32 },

  // UAE
  dubai: { x: 0.65, y: 0.40 },
  "abu dhabi": { x: 0.64, y: 0.41 },

  // Egypt
  alexandria: { x: 0.58, y: 0.38 },
  "port said": { x: 0.59, y: 0.38 },
  damietta: { x: 0.59, y: 0.375 },

  // UK / EU common
  london: { x: 0.50, y: 0.30 },
  hamburg: { x: 0.52, y: 0.30 },
  antwerp: { x: 0.515, y: 0.315 },

  // US common
  "los angeles": { x: 0.17, y: 0.38 },
  "new york": { x: 0.28, y: 0.34 },
};

function anchorForLabel(label?: string) {
  if (!label) return null;
  const key = label.trim().toLowerCase();
  return CITY_ANCHORS[key] ?? null;
}

export default function WorldRouteMap({
  className,
  geometryUrl = DEFAULT_GEOMETRY_URL,
  startLabel,
  endLabel,
  start,
  end,
}: Props) {
  const [geom, setGeom] = React.useState<Geometry | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setFailed(false);

        const res = await fetch(geometryUrl, { cache: "force-cache" });
        if (!res.ok) {
          console.error("WorldRouteMap geometry fetch failed:", geometryUrl, res.status);
          throw new Error(`Failed (${res.status})`);
        }

        const json = (await res.json()) as Geometry;

        if (!alive) return;
        setGeom(json);
      } catch (err) {
        console.error("WorldRouteMap geometry error:", err);
        if (!alive) return;
        setFailed(true);
        setGeom(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [geometryUrl]);

  // Prefer explicit coords if provided, otherwise derive from labels
  const derivedStart = start ?? (anchorForLabel(startLabel) ? { ...anchorForLabel(startLabel)!, label: startLabel } : null);
  const derivedEnd = end ?? (anchorForLabel(endLabel) ? { ...anchorForLabel(endLabel)!, label: endLabel } : null);

  // safe defaults (so UI never breaks)
  const s0 = derivedStart ?? { x: 0.80, y: 0.43, label: startLabel || "Origin" };
  const e0 = derivedEnd ?? { x: 0.52, y: 0.32, label: endLabel || "Destination" };

  const s = toVB(s0);
  const e = toVB(e0);

  // Arc similar to your reference (high lift)
  const dx = e.x - s.x;
  const dist = Math.abs(dx);
  const lift = Math.min(230, Math.max(160, dist * 0.48));

  const c1 = { x: s.x + dx * 0.35, y: Math.min(s.y, e.y) - lift };
  const c2 = { x: s.x + dx * 0.65, y: Math.min(s.y, e.y) - lift };
  const arcPath = `M ${s.x} ${s.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${e.x} ${e.y}`;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="World route map"
      >
        <defs>
          <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#234c6b" />
            <stop offset="1" stopColor="#1f4968" />
          </linearGradient>

          <filter id="routeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.25" />
          </filter>

          <filter id="landShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0b2233" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Ocean */}
        <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#ocean)" />

        {/* Land */}
        {geom ? (
          <g filter="url(#landShadow)">
            {Object.entries(geom).map(([code, d]) => (
              <path key={code} d={d} fill="#f2f2f2" opacity="0.98" />
            ))}
          </g>
        ) : (
          <g>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              fill="#ffffff"
              opacity="0.9"
              fontSize="16"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {failed ? "Map failed to load" : "Loading map..."}
            </text>
          </g>
        )}

        {/* Route arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="#f26d21"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#routeShadow)"
        />

        {/* Markers */}
        <Marker x={s.x} y={s.y} label={s.label} side="left" />
        <Marker x={e.x} y={e.y} label={e.label} side="right" />
      </svg>
    </div>
  );
}

function Marker({
  x,
  y,
  label,
  side,
}: {
  x: number;
  y: number;
  label?: string;
  side: "left" | "right";
}) {
  const dx = side === "left" ? -18 : 18;
  const anchor = side === "left" ? "end" : "start";

  return (
    <g>
      <circle cx={x} cy={y} r="14" fill="none" stroke="#f26d21" strokeWidth="3" />
      <circle cx={x} cy={y} r="5" fill="#f26d21" />

      <line x1={x - 9} y1={y} x2={x - 4} y2={y} stroke="#f26d21" strokeWidth="3" strokeLinecap="round" />
      <line x1={x + 4} y1={y} x2={x + 9} y2={y} stroke="#f26d21" strokeWidth="3" strokeLinecap="round" />
      <line x1={x} y1={y - 9} x2={x} y2={y - 4} stroke="#f26d21" strokeWidth="3" strokeLinecap="round" />
      <line x1={x} y1={y + 4} x2={x} y2={y + 9} stroke="#f26d21" strokeWidth="3" strokeLinecap="round" />

      {label ? (
        <text
          x={x + dx}
          y={y + 6}
          fill="#f26d21"
          fontSize="18"
          fontWeight="700"
          textAnchor={anchor}
          style={{ fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}
