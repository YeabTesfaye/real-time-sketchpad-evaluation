'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { DrawingOperation, OperationUtils, Tool } from '@/lib/operations';
import { useWebSocket } from '@/lib/websocket';

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

// This is what the parent's ref points to. It replaces HTMLCanvasElement, which caused TS2740.
export interface SketchpadCanvasHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

interface CanvasProps {
  width: number;
  height: number;
  roomId: string;
  userId: string;
  currentColor: string;
  currentSize: number;
  currentTool: Tool;
  onHistoryChange?: (state: HistoryState) => void;
}

type RemoteCursor = { x?: number; y?: number; color?: string; name?: string; timestamp: number };

function drawOperation(ctx: CanvasRenderingContext2D, op: DrawingOperation) {
  const pts = op.points;
  if (pts.length === 0) return;

  const a = pts[0];
  const b = pts[pts.length - 1];

  ctx.strokeStyle = op.color;
  ctx.fillStyle = op.color;
  ctx.lineWidth = op.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (op.tool) {
    case 'rectangle':
      ctx.beginPath();
      ctx.rect(a.x, a.y, b.x - a.x, b.y - a.y);
      ctx.stroke();
      break;
    case 'ellipse':
      ctx.beginPath();
      ctx.ellipse(
        (a.x + b.x) / 2,
        (a.y + b.y) / 2,
        Math.abs(b.x - a.x) / 2,
        Math.abs(b.y - a.y) / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      break;
    case 'line':
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      break;
    default: {
      // pen: a single point is a dot, otherwise a polyline
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, op.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
  }
}

export const SketchpadCanvas = forwardRef<SketchpadCanvasHandle, CanvasProps>(function SketchpadCanvas(
  { width, height, roomId, userId, currentColor, currentSize, currentTool, onHistoryChange },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Drawing state lives in refs so pointer handlers never read stale closures
  const localOpsRef = useRef<DrawingOperation[]>([]);
  const redoStackRef = useRef<DrawingOperation[]>([]);
  const remoteOpsRef = useRef<DrawingOperation[]>([]);
  const activeOpRef = useRef<DrawingOperation | null>(null);
  const rafRef = useRef(0);
  const processedRef = useRef(0);
  const lastCursorSendRef = useRef(0);
  const onHistoryChangeRef = useRef(onHistoryChange);
  const boundsRef = useRef<{ minX: number, maxX: number, minY: number, maxY: number } | null>(null);

  // Update the bounding box to include a point
  const updateBoundsWithPoint = useCallback((x: number, y: number) => {
    if (boundsRef.current === null) {
      boundsRef.current = { minX: x, maxX: x, minY: y, maxY: y };
    } else {
      const bounds = boundsRef.current;
      bounds.minX = Math.min(bounds.minX, x);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxY = Math.max(bounds.maxY, y);
    }
  }, []);

  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});
  const { sendMessage, messages, connectionStatus, error } = useWebSocket(roomId);

  useEffect(() => {
    onHistoryChangeRef.current = onHistoryChange;
  });

  const emitHistory = useCallback(() => {
    onHistoryChangeRef.current?.({
      canUndo: localOpsRef.current.length > 0,
      canRedo: redoStackRef.current.length > 0,
    });
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear only the bounding box region if we have bounds, otherwise clear entire canvas
    if (boundsRef.current !== null) {
      const bounds = boundsRef.current;
      // Add some padding around the bounds for better visual experience
      const padding = 10;
      ctx.clearRect(
        Math.max(0, bounds.minX - padding),
        Math.max(0, bounds.minY - padding),
        Math.min(canvas.width, bounds.maxX - bounds.minX + 2 * padding),
        Math.min(canvas.height, bounds.maxY - bounds.minY + 2 * padding)
      );
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    for (const op of remoteOpsRef.current) drawOperation(ctx, op);
    for (const op of localOpsRef.current) drawOperation(ctx, op);
    if (activeOpRef.current) drawOperation(ctx, activeOpRef.current);
  }, []);

  const scheduleRedraw = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      redraw();
    });
  }, [redraw]);

  // Changing the width/height attributes wipes the bitmap, so redraw after a resize
  useEffect(() => {
    // Reset bounds when canvas size changes
    boundsRef.current = null;
    redraw();
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [width, height, redraw]);

  // Handle only messages we have not processed yet (messages is append-only)
  useEffect(() => {
    if (messages.length < processedRef.current) processedRef.current = 0;
    const fresh = messages.slice(processedRef.current);
    processedRef.current = messages.length;
    if (fresh.length === 0) return;

    for (const message of fresh) {
      switch (message.type) {
        case 'canvas_state': {
          // Process existing operations when joining a room
          if (message.operations && Array.isArray(message.operations)) {
            for (const opMessage of message.operations) {
              const operation = OperationUtils.deserializeOperation(opMessage);
              if (operation && operation.userId !== userId) {
                remoteOpsRef.current.push(operation);
                // Update bounds with all points in the operation
                for (const point of operation.points) {
                  updateBoundsWithPoint(point.x, point.y);
                }
              }
            }
          }
          break;
        }
        case 'drawing_operation': {
          const operation = OperationUtils.deserializeOperation(message);
          // Skip our own echo if the server broadcasts back to the sender
          if (operation && operation.userId !== userId) {
            remoteOpsRef.current.push(operation);
            // Update bounds with all points in the operation
            for (const point of operation.points) {
              updateBoundsWithPoint(point.x, point.y);
            }
          }
          break;
        }
        case 'cursor_move': {
          if (message.userId === userId) break;
          const cursorData = OperationUtils.deserializeCursorPosition(message);
          if (cursorData) {
            setRemoteCursors(prev => ({
              ...prev,
              [cursorData.userId]: {
                ...prev[cursorData.userId],
                x: cursorData.position.x,
                y: cursorData.position.y,
                timestamp: Date.now(),
              },
            }));
            // Update bounds with the cursor position
            updateBoundsWithPoint(cursorData.position.x, cursorData.position.y);
          }
          break;
        }
        case 'user_joined': {
          const { userId: joinedId, color, name } = message.user;
          setRemoteCursors(prev => ({
            ...prev,
            [joinedId]: { ...prev[joinedId], color, name, timestamp: Date.now() },
          }));
          break;
        }
        case 'user_left': {
          setRemoteCursors(prev => {
            const next = { ...prev };
            delete next[message.userId];
            return next;
          });
          break;
        }
        case 'clear_canvas': {
          remoteOpsRef.current = [];
          localOpsRef.current = [];
          redoStackRef.current = [];
          activeOpRef.current = null;
          setRemoteCursors({});
          boundsRef.current = null; // Reset bounds when canvas is cleared
          emitHistory();
          break;
        }
        default:
          break;
      }
    }
    scheduleRedraw();
  }, [messages, userId, scheduleRedraw, emitHistory,updateBoundsWithPoint]);

  const undo = useCallback(() => {
    const op = localOpsRef.current.pop();
    if (!op) return;
    redoStackRef.current.push(op);
    emitHistory();
    scheduleRedraw();
  }, [emitHistory, scheduleRedraw]);

  const redo = useCallback(() => {
    const op = redoStackRef.current.pop();
    if (!op) return;
    localOpsRef.current.push(op);
    emitHistory();
    scheduleRedraw();
  }, [emitHistory, scheduleRedraw]);

  const clear = useCallback(() => {
    localOpsRef.current = [];
    remoteOpsRef.current = [];
    redoStackRef.current = [];
    activeOpRef.current = null;
    emitHistory();
    scheduleRedraw();
    // ClearCanvas requires a timestamp in your WebSocketMessage union
    sendMessage({ type: 'clear_canvas', userId, timestamp: new Date().toISOString() });
  }, [emitHistory, scheduleRedraw, sendMessage, userId]);

  useImperativeHandle(ref, () => ({ undo, redo, clear }), [undo, redo, clear]);

  // Map CSS pixels to canvas pixels so drawing stays correct if the canvas is ever scaled
  const toPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (width / rect.width),
      y: (e.clientY - rect.top) * (height / rect.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    const point = toPoint(e);
    // Update bounds with the initial point
    updateBoundsWithPoint(point.x, point.y);

    activeOpRef.current = {
      points: [point],
      color: currentColor,
      size: currentSize,
      tool: currentTool,
      timestamp: new Date().toISOString(),
      userId,
    };
    scheduleRedraw();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = toPoint(e);
    const op = activeOpRef.current;

    if (op) {
      if (op.tool === 'pen') op.points.push(p);
      else op.points = [op.points[0], p]; // shapes: start point plus current point
      // Update bounds with the new point
      updateBoundsWithPoint(p.x, p.y);
      scheduleRedraw();
    }

    // Throttle presence updates to roughly 30 per second
    const now = performance.now();
    if (now - lastCursorSendRef.current > 33) {
      lastCursorSendRef.current = now;
      sendMessage({ type: 'cursor_move', userId, position: p, timestamp: new Date().toISOString() });
    }
  };

  const finishStroke = () => {
    const op = activeOpRef.current;
    if (!op) return;
    activeOpRef.current = null;

    // Update bounds with all points in the operation
    for (const point of op.points) {
      updateBoundsWithPoint(point.x, point.y);
    }

    const valid = op.tool === 'pen' ? op.points.length >= 1 : op.points.length >= 2;
    if (valid) {
      localOpsRef.current.push(op);
      redoStackRef.current = []; // a new stroke invalidates redo
      sendMessage({ type: 'drawing_operation', operation: { ...op } });
      emitHistory();
    }
    scheduleRedraw();
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Object.entries(remoteCursors).map(([id, cursor]) =>
          cursor.x === undefined || cursor.y === undefined ? null : (
            <div
              key={id}
              className="absolute"
              style={{ left: cursor.x, top: cursor.y, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: cursor.color ?? '#888888', border: '2px solid white' }}
              />
              {cursor.name && (
                <div className="ml-2 mt-1 whitespace-nowrap rounded bg-white px-1 py-0.5 text-xs text-gray-600">
                  {cursor.name}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* <p> so the [&_p] styles in RoomClient apply */}
      <p>
        Connection: {connectionStatus} {error && `(${error})`}
      </p>
    </div>
  );
});