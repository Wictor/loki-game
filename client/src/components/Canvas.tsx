import { useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import type { Stroke } from '../../../shared/types';

interface CanvasProps {
  color: string;
  brushSize: number;
  enabled: boolean;
  onStrokeComplete: (stroke: Stroke) => void;
  strokes: Stroke[];
}

export function Canvas({
  color,
  brushSize,
  enabled,
  onStrokeComplete,
  strokes,
}: CanvasProps) {
  const { canvasRef, drawAllStrokes } = useCanvas({
    color,
    brushSize,
    enabled,
    onStrokeComplete,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const size = Math.min(container.clientWidth, container.clientHeight);
      canvas.width = size;
      canvas.height = size;

      drawAllStrokes(strokes);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [canvasRef, drawAllStrokes, strokes]);

  useEffect(() => {
    drawAllStrokes(strokes);
  }, [strokes, drawAllStrokes]);

  return (
    <div
      data-testid={enabled ? 'canvas-active' : undefined}
      style={{
        width: '100%',
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
      }}
    >
      <canvas
        ref={canvasRef}
        data-testid="drawing-canvas"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: enabled ? 'crosshair' : 'default',
        }}
      />
    </div>
  );
}
