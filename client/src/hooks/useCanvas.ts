import { useRef, useEffect, useCallback } from 'react';
import type { Stroke, Point } from '../../../shared/types';

interface UseCanvasOptions {
  color: string;
  brushSize: number;
  enabled: boolean;
  onStrokeComplete: (stroke: Stroke) => void;
}

interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  clearCanvas: () => void;
  drawStroke: (stroke: Stroke) => void;
  drawAllStrokes: (strokes: Stroke[]) => void;
}

export function useCanvas({
  color,
  brushSize,
  enabled,
  onStrokeComplete,
}: UseCanvasOptions): UseCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Point[]>([]);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const normalizePoint = useCallback((x: number, y: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (x - rect.left) / rect.width,
      y: (y - rect.top) / rect.height,
    };
  }, []);

  const denormalizePoint = useCallback((point: Point): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    return {
      x: point.x * canvas.width,
      y: point.y * canvas.height,
    };
  }, []);

  const drawStroke = useCallback((stroke: Stroke) => {
    const ctx = getContext();
    if (!ctx || stroke.points.length === 0) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const firstPoint = denormalizePoint(stroke.points[0]);
    ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < stroke.points.length; i++) {
      const point = denormalizePoint(stroke.points[i]);
      ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();
  }, [getContext, denormalizePoint]);

  const clearCanvas = useCallback(() => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [getContext]);

  const drawAllStrokes = useCallback((strokes: Stroke[]) => {
    clearCanvas();
    strokes.forEach(stroke => drawStroke(stroke));
  }, [clearCanvas, drawStroke]);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (!enabled) return;

    e.preventDefault();
    isDrawingRef.current = true;
    currentStrokeRef.current = [];

    const point = normalizePoint(e.clientX, e.clientY);
    currentStrokeRef.current.push(point);

    const ctx = getContext();
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const denormalized = denormalizePoint(point);
    ctx.moveTo(denormalized.x, denormalized.y);
  }, [enabled, color, brushSize, normalizePoint, denormalizePoint, getContext]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!enabled || !isDrawingRef.current) return;

    e.preventDefault();
    const point = normalizePoint(e.clientX, e.clientY);
    currentStrokeRef.current.push(point);

    const ctx = getContext();
    if (!ctx) return;

    const denormalized = denormalizePoint(point);
    ctx.lineTo(denormalized.x, denormalized.y);
    ctx.stroke();
  }, [enabled, normalizePoint, denormalizePoint, getContext]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!enabled || !isDrawingRef.current) return;

    e.preventDefault();
    isDrawingRef.current = false;

    if (currentStrokeRef.current.length > 0) {
      const stroke: Stroke = {
        playerId: '',
        points: currentStrokeRef.current,
        color,
        brushSize,
        timestamp: Date.now(),
      };
      onStrokeComplete(stroke);
    }

    currentStrokeRef.current = [];
  }, [enabled, color, brushSize, onStrokeComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  return {
    canvasRef,
    clearCanvas,
    drawStroke,
    drawAllStrokes,
  };
}
