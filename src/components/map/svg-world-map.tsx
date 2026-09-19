"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Maximize2 } from "lucide-react";
import { WORLD_SHAPES } from "@/lib/geo/world-shapes";
import { REGION_FOCUS, VIEWBOX, project } from "@/lib/geo/projection";
import type { MapEngineProps } from "@/components/map/types";
import { cn, clamp } from "@/lib/utils";

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 9;

/**
 * The default map engine: the generated Natural Earth geometry drawn as SVG,
 * with pointer pan, wheel zoom and two-finger pinch. It has no external
 * dependency and no tile requests, which keeps the map instant and offline —
 * and it satisfies the same contract a Mapbox engine would.
 */
export function SvgWorldMap({
  markers,
  selectedCityId,
  onSelectCity,
  focus,
  personalised,
  className,
}: MapEngineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | undefined>();
  const drag = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const [moved, setMoved] = useState(false);

  const centreOn = useCallback((lat: number, lng: number, scale: number) => {
    const point = project(lat, lng);
    const centre = { x: VIEWBOX.width / 2, y: VIEWBOX.y + VIEWBOX.height / 2 };
    setTransform({ scale, x: centre.x - point.x * scale, y: centre.y - point.y * scale });
  }, []);

  // Region filter drives the camera. Worldwide resets rather than re-framing.
  useEffect(() => {
    const target = REGION_FOCUS[focus] ?? REGION_FOCUS.worldwide;
    if (focus === "worldwide") {
      setTransform({ scale: 1, x: 0, y: 0 });
      return;
    }
    centreOn(target.lat, target.lng, target.zoom);
  }, [focus, centreOn]);

  const zoomBy = useCallback((factor: number) => {
    setTransform((t) => {
      const scale = clamp(t.scale * factor, MIN_SCALE, MAX_SCALE);
      const centre = { x: VIEWBOX.width / 2, y: VIEWBOX.y + VIEWBOX.height / 2 };
      const ratio = scale / t.scale;
      return {
        scale,
        x: centre.x - (centre.x - t.x) * ratio,
        y: centre.y - (centre.y - t.y) * ratio,
      };
    });
  }, []);

  const toSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEWBOX.width + VIEWBOX.x,
      y: ((clientY - rect.top) / rect.height) * VIEWBOX.height + VIEWBOX.y,
    };
  }, []);

  const onWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const point = toSvgPoint(event.clientX, event.clientY);
    setTransform((t) => {
      const scale = clamp(t.scale * (event.deltaY < 0 ? 1.18 : 1 / 1.18), MIN_SCALE, MAX_SCALE);
      const ratio = scale / t.scale;
      return { scale, x: point.x - (point.x - t.x) * ratio, y: point.y - (point.y - t.y) * ratio };
    });
  };

  const onPointerDown = (event: React.PointerEvent) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale: transform.scale };
      drag.current = null;
      return;
    }
    (event.target as Element).setPointerCapture?.(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: transform.x,
      originY: transform.y,
    };
    setMoved(false);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (pointers.current.has(event.pointerId)) {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const scale = clamp((distance / pinch.current.distance) * pinch.current.scale, MIN_SCALE, MAX_SCALE);
      setTransform((t) => {
        const centre = { x: VIEWBOX.width / 2, y: VIEWBOX.y + VIEWBOX.height / 2 };
        const ratio = scale / t.scale;
        return { scale, x: centre.x - (centre.x - t.x) * ratio, y: centre.y - (centre.y - t.y) * ratio };
      });
      setMoved(true);
      return;
    }

    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = ((event.clientX - state.startX) / rect.width) * VIEWBOX.width;
    const dy = ((event.clientY - state.startY) / rect.height) * VIEWBOX.height;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) setMoved(true);
    setTransform((t) => ({ ...t, x: state.originX + dx, y: state.originY + dy }));
  };

  const endPointer = (event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  };

  // Markers are drawn largest-first so small pins stay clickable on top.
  const ordered = useMemo(
    () => [...markers].sort((a, b) => (b.score ?? b.count) - (a.score ?? a.count)).reverse(),
    [markers],
  );
  const maxCount = Math.max(1, ...markers.map((m) => m.count));

  return (
    <div className={cn("relative overflow-hidden rounded-panel border border-ink-08 bg-white", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 90% at 18% 8%, #f2edff 0%, transparent 55%), radial-gradient(110% 90% at 88% 20%, #e6f0fd 0%, transparent 52%), radial-gradient(100% 80% at 50% 110%, #fdeaf2 0%, transparent 58%)",
        }}
      />

      <svg
        ref={svgRef}
        viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}`}
        className="relative block h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerLeave={endPointer}
        role="img"
        aria-label="World map of beauty people, brands, projects and events"
      >
        <defs>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#f4f2fb" />
            <stop offset="100%" stopColor="#eef3fb" />
          </linearGradient>
          <linearGradient id="pin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9b87e8" />
            <stop offset="60%" stopColor="#6fa8ea" />
            <stop offset="100%" stopColor="#eb93b8" />
          </linearGradient>
        </defs>

        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
          {/* Latitude guides — quiet structure rather than a grid that shouts. */}
          <g opacity={0.5}>
            {[-40, -20, 0, 20, 40, 60].map((lat) => (
              <line
                key={lat}
                x1={0}
                x2={1000}
                y1={project(lat, 0).y}
                y2={project(lat, 0).y}
                stroke="#cfd4e4"
                strokeWidth={0.4 / transform.scale}
                strokeDasharray={`${2 / transform.scale} ${3 / transform.scale}`}
              />
            ))}
          </g>

          <g>
            {WORLD_SHAPES.map((shape) => (
              <path
                key={shape.id}
                d={shape.d}
                fill="url(#land)"
                stroke="#cfd4e4"
                strokeWidth={0.45 / transform.scale}
                strokeLinejoin="round"
              />
            ))}
          </g>

          <g>
            {ordered.map((marker) => {
              const { x, y } = project(marker.city.lat, marker.city.lng);
              const selected = selectedCityId === marker.city.id;
              const isHovered = hovered === marker.city.id;
              const weight = personalised
                ? ((marker.score ?? 60) - 50) / 50
                : marker.count / maxCount;
              const radius = (4 + weight * 7) / Math.sqrt(transform.scale);
              const label = personalised ? `${marker.score}%` : String(marker.count);

              return (
                <g
                  key={marker.city.id}
                  transform={`translate(${x} ${y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHovered(marker.city.id)}
                  onMouseLeave={() => setHovered(undefined)}
                  onClick={() => {
                    if (moved) return;
                    onSelectCity(selected ? undefined : marker.city.id);
                  }}
                >
                  {(selected || isHovered) && (
                    <circle r={radius * 2.4} fill="#9b87e8" opacity={0.16}>
                      <animate
                        attributeName="r"
                        values={`${radius * 1.4};${radius * 2.8};${radius * 1.4}`}
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle r={radius * 1.7} fill="#9b87e8" opacity={0.14} />
                  <circle
                    r={radius}
                    fill="url(#pin)"
                    stroke="#ffffff"
                    strokeWidth={(selected ? 2 : 1.2) / Math.sqrt(transform.scale)}
                  />
                  <text
                    y={-radius - 3.5 / Math.sqrt(transform.scale)}
                    textAnchor="middle"
                    className="pointer-events-none font-semibold"
                    fill="#0c1533"
                    style={{
                      fontSize: `${8.5 / Math.sqrt(transform.scale)}px`,
                      paintOrder: "stroke",
                      stroke: "#ffffff",
                      strokeWidth: 2.4 / Math.sqrt(transform.scale),
                      strokeLinejoin: "round",
                    }}
                  >
                    {marker.city.name} · {label}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 rounded-2xl border border-ink-08 bg-white/90 p-1.5 shadow-soft backdrop-blur">
        <button
          onClick={() => zoomBy(1.4)}
          className="flex size-8 items-center justify-center rounded-xl text-ink-70 transition-colors hover:bg-ink-08"
          aria-label="Zoom in"
        >
          <Plus className="size-4" />
        </button>
        <button
          onClick={() => zoomBy(1 / 1.4)}
          className="flex size-8 items-center justify-center rounded-xl text-ink-70 transition-colors hover:bg-ink-08"
          aria-label="Zoom out"
        >
          <Minus className="size-4" />
        </button>
        <button
          onClick={() => setTransform({ scale: 1, x: 0, y: 0 })}
          className="flex size-8 items-center justify-center rounded-xl text-ink-70 transition-colors hover:bg-ink-08"
          aria-label="Reset view"
        >
          <Maximize2 className="size-4" />
        </button>
      </div>

      <p className="pointer-events-none absolute bottom-4 left-4 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-30">
        {personalised ? "Match view" : "Activity view"} · drag to pan · scroll or pinch to zoom
      </p>
    </div>
  );
}
