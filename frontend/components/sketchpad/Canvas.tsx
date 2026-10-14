'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';

import {
  DrawingOperation,
  OperationUtils,
  Tool,
} from '@/lib/operations';

import {
  WebSocketHookResult,
} from '@/lib/websocket';


export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}


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
  socket: WebSocketHookResult;
  onHistoryChange?: (
    state: HistoryState
  ) => void;
}


type RemoteCursor = {
  x?: number;
  y?: number;
  color?: string;
  name?: string;
  timestamp: number;
};


// ============================================================
// DRAW OPERATION
// ============================================================

function drawOperation(
  ctx: CanvasRenderingContext2D,
  op: DrawingOperation
) {

  const pts =
    op.points;


  if (
    pts.length === 0
  ) {
    return;
  }


  const a =
    pts[0];

  const b =
    pts[pts.length - 1];


  ctx.strokeStyle =
    op.color;

  ctx.fillStyle =
    op.color;

  ctx.lineWidth =
    op.size;

  ctx.lineCap =
    'round';

  ctx.lineJoin =
    'round';


  switch (
    op.tool
  ) {

    case 'rectangle': {

      ctx.beginPath();

      ctx.rect(
        a.x,
        a.y,
        b.x - a.x,
        b.y - a.y
      );

      ctx.stroke();

      break;
    }


    case 'ellipse': {

      ctx.beginPath();

      ctx.ellipse(
        (a.x + b.x) / 2,
        (a.y + b.y) / 2,
        Math.abs(
          b.x - a.x
        ) / 2,
        Math.abs(
          b.y - a.y
        ) / 2,
        0,
        0,
        Math.PI * 2
      );

      ctx.stroke();

      break;
    }


    case 'line': {

      ctx.beginPath();

      ctx.moveTo(
        a.x,
        a.y
      );

      ctx.lineTo(
        b.x,
        b.y
      );

      ctx.stroke();

      break;
    }


    case 'pen':
    default: {

      if (
        pts.length === 1
      ) {

        ctx.beginPath();

        ctx.arc(
          a.x,
          a.y,
          op.size / 2,
          0,
          Math.PI * 2
        );

        ctx.fill();

        break;
      }


      ctx.beginPath();

      ctx.moveTo(
        pts[0].x,
        pts[0].y
      );


      for (
        let i = 1;
        i < pts.length;
        i++
      ) {

        ctx.lineTo(
          pts[i].x,
          pts[i].y
        );
      }


      ctx.stroke();

      break;
    }
  }
}


// ============================================================
// CANVAS
// ============================================================

export const SketchpadCanvas =
  forwardRef<
    SketchpadCanvasHandle,
    CanvasProps
  >(
    function SketchpadCanvas(
      {
        width,
        height,
        userId,
        currentColor,
        currentSize,
        currentTool,
        socket,
        onHistoryChange,
      },
      ref
    ) {

      const canvasRef =
        useRef<HTMLCanvasElement>(
          null
        );


      /*
       * Operations confirmed by the server.
       */
      const operationsRef =
        useRef<DrawingOperation[]>(
          []
        );


      /*
       * Prevent duplicate operations.
       */
      const operationIdsRef =
        useRef<Set<string>>(
          new Set()
        );


      /*
       * Operation currently being drawn.
       */
      const activeOpRef =
        useRef<DrawingOperation | null>(
          null
        );


      /*
       * Number of messages already processed.
       */
      const processedRef =
        useRef(0);


      /*
       * requestAnimationFrame handle.
       */
      const rafRef =
        useRef(0);


      /*
       * Cursor throttling.
       */
      const lastCursorSendRef =
        useRef(0);


      /*
       * Latest history callback.
       */
      const onHistoryChangeRef =
        useRef(onHistoryChange);


      const {
        sendMessage,
        messages,
        connectionStatus,
        error,
      } = socket;


      // ========================================================
      // HISTORY CALLBACK
      // ========================================================

      useEffect(() => {

        onHistoryChangeRef.current =
          onHistoryChange;

      }, [
        onHistoryChange,
      ]);


      // ========================================================
      // REMOTE CURSORS
      // ========================================================
      /*
       * Remote cursors are derived from WebSocket messages.
       *
       * This avoids calling setState() synchronously inside
       * the message-processing effect.
       */

      const remoteCursors =
        useMemo<
          Record<
            string,
            RemoteCursor
          >
        >(() => {

          const cursors:
            Record<
              string,
              RemoteCursor
            > = {};


          for (
            const message
            of messages
          ) {

            switch (
              message.type
            ) {

              case 'clear_canvas': {

                for (
                  const id
                  of Object.keys(
                    cursors
                  )
                ) {

                  delete cursors[id];
                }

                break;
              }


              case 'cursor_move': {

                if (
                  message.userId ===
                  userId
                ) {
                  break;
                }


                const cursorData =
                  OperationUtils
                    .deserializeCursorPosition(
                      message
                    );


                if (
                  !cursorData
                ) {
                  break;
                }


                cursors[
                  cursorData.userId
                ] = {
                  ...cursors[
                    cursorData.userId
                  ],

                  x:
                    cursorData.position.x,

                  y:
                    cursorData.position.y,

                  timestamp:
                    Date.now(),
                };


                break;
              }


              case 'user_joined': {

                const joinedUser =
                  message.user;


                if (
                  joinedUser.userId ===
                  userId
                ) {
                  break;
                }


                cursors[
                  joinedUser.userId
                ] = {
                  ...cursors[
                    joinedUser.userId
                  ],

                  color:
                    joinedUser.color,

                  name:
                    joinedUser.name,

                  timestamp:
                    Date.now(),
                };


                break;
              }


              case 'user_left': {

                delete cursors[
                  message.userId
                ];

                break;
              }


              default:
                break;
            }
          }


          return cursors;

        }, [
          messages,
          userId,
        ]);


      // ========================================================
      // REDRAW
      // ========================================================

      const redraw =
        useCallback(() => {

          const canvas =
            canvasRef.current;


          if (!canvas) {
            return;
          }


          const ctx =
            canvas.getContext(
              '2d'
            );


          if (!ctx) {
            return;
          }


          ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );


          for (
            const operation
            of operationsRef.current
          ) {

            drawOperation(
              ctx,
              operation
            );
          }


          if (
            activeOpRef.current
          ) {

            drawOperation(
              ctx,
              activeOpRef.current
            );
          }

        }, []);


      // ========================================================
      // SCHEDULE REDRAW
      // ========================================================

      const scheduleRedraw =
        useCallback(() => {

          if (
            rafRef.current
          ) {
            return;
          }


          rafRef.current =
            requestAnimationFrame(
              () => {

                rafRef.current =
                  0;

                redraw();
              }
            );

        }, [
          redraw,
        ]);


      // ========================================================
      // ADD OPERATION
      // ========================================================

      const addOperation =
        useCallback(
          (
            operation: DrawingOperation
          ) => {

            if (
              !operation.id
            ) {
              return;
            }


            if (
              operationIdsRef.current.has(
                operation.id
              )
            ) {
              return;
            }


            operationIdsRef.current.add(
              operation.id
            );


            operationsRef.current.push(
              operation
            );

          },
          []
        );


      // ========================================================
      // REMOVE OPERATION
      // ========================================================

      const removeOperation =
        useCallback(
          (
            operationId: string
          ) => {

            operationsRef.current =
              operationsRef.current.filter(
                operation =>
                  operation.id !==
                  operationId
              );


            operationIdsRef.current.delete(
              operationId
            );

          },
          []
        );


      // ========================================================
      // SERVER MESSAGES
      // ========================================================

      useEffect(() => {

        /*
         * If messages were reset/replaced,
         * start processing from the beginning.
         */
        if (
          messages.length <
          processedRef.current
        ) {

          processedRef.current =
            0;
        }


        const freshMessages =
          messages.slice(
            processedRef.current
          );


        processedRef.current =
          messages.length;


        if (
          freshMessages.length === 0
        ) {

          return;
        }


        let stateChanged =
          false;


        for (
          const message
          of freshMessages
        ) {

          switch (
            message.type
          ) {

            // ==================================================
            // COMPLETE CANVAS STATE
            // ==================================================

            case 'canvas_state': {

              operationsRef.current =
                [];

              operationIdsRef.current =
                new Set();


              for (
                const operation
                of message.operations
              ) {

                addOperation(
                  operation
                );
              }


              activeOpRef.current =
                null;


              stateChanged =
                true;


              break;
            }


            // ==================================================
            // DRAWING OPERATION
            // ==================================================

            case 'drawing_operation': {

              addOperation(
                message.operation
              );


              stateChanged =
                true;


              break;
            }


            // ==================================================
            // UNDO
            // ==================================================

            case 'undo_operation': {

              removeOperation(
                message.targetOperationId
              );


              stateChanged =
                true;


              break;
            }


            // ==================================================
            // REDO
            // ==================================================

            case 'redo_operation': {

              addOperation(
                message.operation
              );


              stateChanged =
                true;


              break;
            }


            // ==================================================
            // CLEAR CANVAS
            // ==================================================

            case 'clear_canvas': {

              operationsRef.current =
                [];

              operationIdsRef.current =
                new Set();

              activeOpRef.current =
                null;


              stateChanged =
                true;


              break;
            }


            // ==================================================
            // HISTORY
            // ==================================================

            case 'history_state': {

              onHistoryChangeRef.current?.({
                canUndo:
                  message.canUndo,

                canRedo:
                  message.canRedo,
              });


              break;
            }


            default:
              break;
          }
        }


        if (
          stateChanged
        ) {

          scheduleRedraw();
        }

      }, [
        messages,
        addOperation,
        removeOperation,
        scheduleRedraw,
      ]);


      // ========================================================
      // REDRAW WHEN SIZE CHANGES
      // ========================================================

      useEffect(() => {

        scheduleRedraw();


        return () => {

          if (
            rafRef.current
          ) {

            cancelAnimationFrame(
              rafRef.current
            );


            rafRef.current =
              0;
          }
        };

      }, [
        width,
        height,
        scheduleRedraw,
      ]);


      // ========================================================
      // UNDO
      // ========================================================

      const undo =
        useCallback(() => {

          if (
            connectionStatus !==
            'connected'
          ) {

            return;
          }


          sendMessage({
            type:
              'undo_operation',
          });

        }, [
          connectionStatus,
          sendMessage,
        ]);


      // ========================================================
      // REDO
      // ========================================================

      const redo =
        useCallback(() => {

          if (
            connectionStatus !==
            'connected'
          ) {

            return;
          }


          sendMessage({
            type:
              'redo_operation',
          });

        }, [
          connectionStatus,
          sendMessage,
        ]);


      // ========================================================
      // CLEAR
      // ========================================================

      const clear =
        useCallback(() => {

          if (
            connectionStatus !==
            'connected'
          ) {

            return;
          }


          sendMessage({
            type:
              'clear_canvas',

            userId,

            timestamp:
              new Date().toISOString(),
          });

        }, [
          connectionStatus,
          sendMessage,
          userId,
        ]);


      // ========================================================
      // IMPERATIVE HANDLE
      // ========================================================

      useImperativeHandle(
        ref,
        () => ({
          undo,
          redo,
          clear,
        }),
        [
          undo,
          redo,
          clear,
        ]
      );


      // ========================================================
      // POINTER -> CANVAS POINT
      // ========================================================

      const toPoint =
        (
          e: React.PointerEvent<HTMLCanvasElement>
        ) => {

          const rect =
            e.currentTarget
              .getBoundingClientRect();


          if (
            rect.width === 0 ||
            rect.height === 0
          ) {

            return {
              x: 0,
              y: 0,
            };
          }


          return {

            x:
              (e.clientX -
                rect.left) *
              (
                width /
                rect.width
              ),

            y:
              (e.clientY -
                rect.top) *
              (
                height /
                rect.height
              ),
          };
        };


      // ========================================================
      // POINTER DOWN
      // ========================================================

      const handlePointerDown =
        (
          e: React.PointerEvent<HTMLCanvasElement>
        ) => {

          if (
            connectionStatus !==
            'connected'
          ) {

            return;
          }


          if (
            e.pointerType ===
              'mouse' &&
            e.button !== 0
          ) {

            return;
          }


          e.currentTarget.setPointerCapture(
            e.pointerId
          );


          const point =
            toPoint(e);


          activeOpRef.current = {

            points: [
              point,
            ],

            color:
              currentColor,

            size:
              currentSize,

            tool:
              currentTool,

            timestamp:
              new Date().toISOString(),

            userId,
          };


          scheduleRedraw();
        };


      // ========================================================
      // POINTER MOVE
      // ========================================================

      const handlePointerMove =
        (
          e: React.PointerEvent<HTMLCanvasElement>
        ) => {

          const point =
            toPoint(e);


          const activeOperation =
            activeOpRef.current;


          // ----------------------------------------------------
          // DRAWING
          // ----------------------------------------------------

          if (
            activeOperation
          ) {

            if (
              activeOperation.tool ===
              'pen'
            ) {

              activeOperation.points.push(
                point
              );

            } else {

              activeOperation.points = [
                activeOperation.points[0],
                point,
              ];
            }


            scheduleRedraw();
          }


          // ----------------------------------------------------
          // REMOTE CURSOR
          // ----------------------------------------------------

          if (
            connectionStatus !==
            'connected'
          ) {

            return;
          }


          const now =
            performance.now();


          if (
            now -
              lastCursorSendRef.current >
            33
          ) {

            lastCursorSendRef.current =
              now;


            sendMessage({
              type:
                'cursor_move',

              userId,

              position:
                point,

              timestamp:
                new Date().toISOString(),
            });
          }
        };


      // ========================================================
      // FINISH DRAWING
      // ========================================================

      const finishStroke =
        () => {

          const operation =
            activeOpRef.current;


          if (
            !operation
          ) {

            return;
          }


          activeOpRef.current =
            null;


          const valid =
            operation.tool ===
            'pen'
              ? operation.points.length >= 1
              : operation.points.length >= 2;


          if (
            !valid
          ) {

            scheduleRedraw();

            return;
          }


          if (
            connectionStatus !==
            'connected'
          ) {

            scheduleRedraw();

            return;
          }


          /*
           * Send to the server.
           *
           * The server is responsible for assigning
           * the final operation ID/timestamp and
           * broadcasting the operation.
           */

          sendMessage({
            type:
              'drawing_operation',

            operation,
          });


          scheduleRedraw();
        };


      // ========================================================
      // RENDER
      // ========================================================

      return (
        <div className="relative">

          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="block cursor-crosshair touch-none"
            onPointerDown={
              handlePointerDown
            }
            onPointerMove={
              handlePointerMove
            }
            onPointerUp={
              finishStroke
            }
            onPointerCancel={
              finishStroke
            }
          />


          <div className="pointer-events-none absolute inset-0 overflow-hidden">

            {Object.entries(
              remoteCursors
            ).map(
              ([
                id,
                cursor,
              ]) => {

                if (
                  cursor.x ===
                    undefined ||
                  cursor.y ===
                    undefined
                ) {

                  return null;
                }


                return (
                  <div
                    key={id}
                    className="absolute"
                    style={{
                      left:
                        cursor.x,

                      top:
                        cursor.y,

                      transform:
                        'translate(-50%, -50%)',
                    }}
                  >

                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          cursor.color ??
                          '#888888',

                        border:
                          '2px solid white',
                      }}
                    />


                    {cursor.name && (
                      <div className="ml-2 mt-1 whitespace-nowrap rounded bg-white px-1 py-0.5 text-xs text-gray-600">
                        {cursor.name}
                      </div>
                    )}

                  </div>
                );
              }
            )}

          </div>


          <p>
            Connection:{' '}
            {connectionStatus}

            {error &&
              ` (${error})`}
          </p>

        </div>
      );
    }
  );