'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { DrawingOperation, OperationUtils } from '@/lib/operations';
import { useWebSocket } from '@/lib/websocket';

interface CanvasProps {
  width: number;
  height: number;
  roomId: string;
  userId: string;
  userName: string;
  userColor: string;
  currentColor: string;
  currentSize: number;
}

export function SketchpadCanvas({ width, height, roomId, userId, userName, userColor, currentColor, currentSize }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localOperations, setLocalOperations] = useState<DrawingOperation[]>([]);
  const [remoteOperations, setRemoteOperations] = useState<DrawingOperation[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, {x: number, y: number, color: string, name: string, timestamp: number}>>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [error, setError] = useState<string | null>(null);

  const { sendMessage: webSocketSendMessage, messages, connectionStatus: wsConnectionStatus, error: wsError } = useWebSocket(roomId);

  // Update connection status from WebSocket hook
  useEffect(() => {
    setConnectionStatus(wsConnectionStatus);
    setError(wsError);
  }, [wsConnectionStatus, wsError]);

  // Process incoming WebSocket messages
  useEffect(() => {
    messages.forEach(message => {
      if (message.type === 'drawing_operation') {
        const operation = OperationUtils.deserializeOperation(message);
        if (operation) {
          setRemoteOperations(prev => [...prev, operation]);
        }
      } else if (message.type === 'cursor_move' && message.userId !== userId) {
        // Handle cursor move from other users
        const cursorData = OperationUtils.deserializeCursorPosition(message);
        if (cursorData) {
          setRemoteCursors(prev => ({
            ...prev,
            [cursorData.userId]: {
              x: cursorData.position.x,
              y: cursorData.position.y,
              color: message.color || '#000000', // Default color if not provided
              name: message.name || `User-${cursorData.userId.substring(0, 4)}`,
              timestamp: Date.now()
            }
          }));
        }
      } else if (message.type === 'clear_canvas') {
        setRemoteOperations([]);
        setLocalOperations([]);
        setRemoteCursors({}); // Clear remote cursors too
      }
    });
  }, [messages, userId]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Redraw all operations
    redrawCanvas(ctx);

    return () => {
      // Cleanup
    };
  }, [width, height, localOperations, remoteOperations]);

  // Redraw canvas with all operations
  const redrawCanvas = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw local operations
    localOperations.forEach(op => {
      drawOperation(ctx, op);
    });

    // Draw remote operations
    remoteOperations.forEach(op => {
      drawOperation(ctx, op);
    });
  }, [width, height, localOperations, remoteOperations]);

  // Draw a single operation
  const drawOperation = useCallback((ctx: CanvasRenderingContext2D, operation: DrawingOperation) => {
    if (operation.points.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(operation.points[0].x, operation.points[0].y);

    for (let i = 1; i < operation.points.length; i++) {
      ctx.lineTo(operation.points[i].x, operation.points[i].y);
    }

    ctx.strokeStyle = operation.color;
    ctx.lineWidth = operation.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, []);

  // Handle mouse/touch events
  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setLocalOperations(prev => [
      ...prev,
      {
        points: [{x, y}],
        color: currentColor,
        size: currentSize,
        tool: 'pen',
        userId: userId,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [currentColor, currentSize, userId]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update the last operation's points
    setLocalOperations(prev => {
      if (prev.length === 0) return prev;

      const lastOp = prev[prev.length - 1];
      return [
        ...prev.slice(0, -1),
        {
          ...lastOp,
          points: [...lastOp.points, {x, y}]
        }
      ];
    });

    // Send cursor position to others
    sendCursorPosition({x, y});
  }, [isDrawing, sendCursorPosition, userId]);

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);

    // Send the completed drawing operation
    sendDrawingOperation();
  }, []);

  // Send drawing operation to server
  const sendDrawingOperation = useCallback(() => {
    if (localOperations.length === 0) return;

    const lastOp = localOperations[localOperations.length - 1];
    if (lastOp.points.length < 2) return; // Need at least 2 points for a line

    // Create operation to send
    const operationToSend: DrawingOperation = {
      ...lastOp,
      userId: userId
    };

    webSocketSendMessage(OperationUtils.serializeOperation(operationToSend));
  }, [webSocketSendMessage, userId]);

  // Send cursor position
  const sendCursorPosition = useCallback((position: {x: number, y: number}) => {
    // Throttle cursor updates to prevent too many messages
    // In a real implementation, we'd use requestAnimationFrame or lodash.throttle
    webSocketSendMessage(OperationUtils.serializeCursorPosition(userId, position));
  }, [webSocketSendMessage, userId]);

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    setLocalOperations([]);
    setRemoteOperations([]);
    setRemoteCursors({}); // Clear remote cursors too
    webSocketSendMessage(OperationUtils.serializeClearCanvas(userId));
  }, [webSocketSendMessage, userId]);

  // Set up pointer event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDown = (e: PointerEvent) => {
      e.preventDefault();
      handlePointerDown(e);
    };

    const handleMove = (e: PointerEvent) => {
      if (isDrawing) {
        e.preventDefault();
        handlePointerMove(e);
      }
    };

    const handleUp = (e: PointerEvent) => {
      e.preventDefault();
      handlePointerUp();
    };

    canvas.addEventListener('pointerdown', handleDown);
    canvas.addEventListener('pointermove', handleMove);
    canvas.addEventListener('pointerup', handleUp);
    canvas.addEventListener('pointercancel', handleUp);
    canvas.addEventListener('pointerleave', handleUp);

    return () => {
      canvas.removeEventListener('pointerdown', handleDown);
      canvas.removeEventListener('pointermove', handleMove);
      canvas.removeEventListener('pointerup', handleUp);
      canvas.removeEventListener('pointercancel', handleUp);
      canvas.removeEventListener('pointerleave', handleUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, isDrawing]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 cursor-pointer"
      />
      <div className="absolute inset-0 pointer-events-none">
        {/* Render remote cursors */}
        {Object.entries(remoteCursors).map(([userId, cursor]) => (
          <div
            key={userId}
            className="pointer-events-none"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
              position: 'absolute',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="h-2 w-2 rounded-full" style={{backgroundColor: cursor.color, border: '2px solid white'}}></div>
            <div className="text-xs text-gray-600 bg-white px-1 py-0.5 rounded ml-2 mt-1 whitespace-nowrap">
              {cursor.name}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Connection: {connectionStatus} {error && `(${error})`}
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Local Operations: {localOperations.length}
      </div>
    </div>
  );
}