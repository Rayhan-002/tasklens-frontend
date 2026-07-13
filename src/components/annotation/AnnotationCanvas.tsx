'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { AnnotationImage, Polygon, Point } from '@/types';
import api, { resolveMediaUrl } from '@/lib/api';
import { toast } from 'sonner';

const STAGE_H = 560;
const CLOSE_DIST = 14;
const POLY_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316',
];

type DrawState =
  | { mode: 'idle' }
  | { mode: 'drawing'; points: Point[] }
  | { mode: 'labeling'; points: Point[] };

interface Props {
  image: AnnotationImage;
  onPolygonSaved: (polygon: Polygon) => void;
  onPolygonDeleted: (polygonId: number) => void;
}

function centroid(pts: Point[]): Point {
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  };
}

function flatPoints(pts: Point[]): number[] {
  return pts.flatMap((p) => [p.x, p.y]);
}

export default function AnnotationCanvas({ image, onPolygonSaved, onPolygonDeleted }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(800);
  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null);
  const [imgLayout, setImgLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [draw, setDraw] = useState<DrawState>({ mode: 'idle' });
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  // Measure container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setStageWidth(el.clientWidth));
    obs.observe(el);
    setStageWidth(el.clientWidth);
    return () => obs.disconnect();
  }, []);

  // Reset draw state when image changes
  useEffect(() => {
    setDraw({ mode: 'idle' });
    setLabel('');
  }, [image.id]);

  // Load image into Konva
  useEffect(() => {
    if (!image.file || stageWidth === 0) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = resolveMediaUrl(image.file);
    img.onload = () => {
      setKonvaImage(img);
      const scale = Math.min(stageWidth / img.naturalWidth, STAGE_H / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      setImgLayout({ x: (stageWidth - w) / 2, y: (STAGE_H - h) / 2, width: w, height: h });
    };
  }, [image.file, stageWidth]);

  // Escape cancels active drawing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDraw({ mode: 'idle' }); setLabel(''); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (draw.mode !== 'drawing') return;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const pts = draw.points;
    // Close polygon when clicking near the first point (requires ≥ 3 points)
    if (pts.length >= 3 && Math.hypot(pos.x - pts[0].x, pos.y - pts[0].y) < CLOSE_DIST) {
      setDraw({ mode: 'labeling', points: pts });
      return;
    }
    setDraw({ mode: 'drawing', points: [...pts, { x: pos.x, y: pos.y }] });
  };

  const handleSave = async () => {
    if (draw.mode !== 'labeling' || !label.trim()) {
      toast.error('Enter a label');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post<Polygon>(`/annotations/images/${image.id}/polygons/`, {
        label: label.trim(),
        points: draw.points,
      });
      onPolygonSaved(res.data);
      setDraw({ mode: 'idle' });
      setLabel('');
      toast.success('Polygon saved');
    } catch {
      toast.error('Failed to save polygon');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolygon = async (poly: Polygon) => {
    try {
      await api.delete(`/annotations/images/${image.id}/polygons/${poly.id}/`);
      onPolygonDeleted(poly.id);
      toast.success('Polygon deleted');
    } catch {
      toast.error('Failed to delete polygon');
    }
  };

  const isDrawing = draw.mode === 'drawing';
  const isLabeling = draw.mode === 'labeling';

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="flex-1 truncate text-sm font-medium text-zinc-300">{image.filename}</p>
        {draw.mode === 'idle' && (
          <button
            onClick={() => setDraw({ mode: 'drawing', points: [] })}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
          >
            + Draw polygon
          </button>
        )}
        {(isDrawing || isLabeling) && (
          <button
            onClick={() => { setDraw({ mode: 'idle' }); setLabel(''); }}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
          >
            Cancel (Esc)
          </button>
        )}
        {isDrawing && (
          <span className="text-xs text-zinc-500">
            {draw.points.length < 3
              ? `Click to add points (${draw.points.length} added)`
              : 'Click the first point to close the polygon'}
          </span>
        )}
      </div>

      {/* Konva stage */}
      <div
        ref={containerRef}
        className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
        style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
      >
        <Stage width={stageWidth} height={STAGE_H} onClick={handleStageClick}>
          <Layer>
            {/* Base image */}
            {konvaImage && (
              <KonvaImage
                image={konvaImage}
                x={imgLayout.x}
                y={imgLayout.y}
                width={imgLayout.width}
                height={imgLayout.height}
              />
            )}

            {/* Saved polygons */}
            {image.polygons.map((poly, i) => {
              const color = POLY_COLORS[i % POLY_COLORS.length];
              const c = centroid(poly.points);
              return (
                <React.Fragment key={poly.id}>
                  <Line
                    points={flatPoints(poly.points)}
                    closed
                    fill={`${color}33`}
                    stroke={color}
                    strokeWidth={2}
                  />
                  <Text
                    text={poly.label}
                    x={c.x + 4}
                    y={c.y - 8}
                    fontSize={12}
                    fontStyle="bold"
                    fill={color}
                  />
                </React.Fragment>
              );
            })}

            {/* In-progress drawing */}
            {isDrawing && draw.points.length > 0 && (
              <>
                <Line
                  points={flatPoints(draw.points)}
                  stroke="#6366f1"
                  strokeWidth={2}
                  dash={[6, 4]}
                />
                {draw.points.map((pt, i) => (
                  <Circle
                    key={i}
                    x={pt.x}
                    y={pt.y}
                    radius={i === 0 ? 7 : 4}
                    fill={i === 0 ? '#6366f1' : '#a5b4fc'}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                ))}
              </>
            )}

            {/* Labeling preview — closed polygon */}
            {isLabeling && draw.points.length > 0 && (
              <Line
                points={flatPoints(draw.points)}
                closed
                fill="#6366f133"
                stroke="#6366f1"
                strokeWidth={2}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Label input (appears after polygon is closed) */}
      {isLabeling && (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2">
          <span className="shrink-0 text-xs text-indigo-300">Label:</span>
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            placeholder="Enter polygon label…"
            className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          <button
            onClick={handleSave}
            disabled={saving || !label.trim()}
            className="shrink-0 rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {/* Saved polygon chips with delete */}
      {image.polygons.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-500">
            Annotations ({image.polygons.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {image.polygons.map((poly, i) => {
              const color = POLY_COLORS[i % POLY_COLORS.length];
              return (
                <span
                  key={poly.id}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `${color}22`,
                    color,
                    border: `1px solid ${color}44`,
                  }}
                >
                  {poly.label}
                  <button
                    onClick={() => handleDeletePolygon(poly)}
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-sm opacity-60 transition hover:opacity-100"
                    aria-label={`Delete annotation ${poly.label}`}
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
