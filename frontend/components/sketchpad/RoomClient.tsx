'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  useAuth,
} from '@/lib/hooks/useAuth';

import {
  Check,
  Link2,
  Loader2,
  Palette,
  Users,
  type LucideIcon,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/button';

import {
  createRoomCode,
  roomHref,
} from '@/lib/room-code';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import {
  SketchpadCanvas,
  type HistoryState,
  type SketchpadCanvasHandle,
} from '@/components/sketchpad/Canvas';

import {
  PeoplePanel,
  ToolPanel,
  type Identity,
} from '@/components/sketchpad/panels';

import type {
  Tool,
} from '@/lib/operations';

import {
  useWebSocket,
} from '@/lib/websocket';

import type {
  UserInfo,
  WebSocketMessage,
} from '@/lib/websocket';

import {
  cn,
} from '@/lib/utils';


const EDGE =
  'px-4 sm:px-6';


const subscribeNever =
  () => () => {};


function useIsClient() {

  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
}


function useMediaQuery(
  query: string
) {

  const subscribe =
    useCallback(
      (
        onChange: () => void
      ) => {

        const mql =
          window.matchMedia(
            query
          );

        mql.addEventListener(
          'change',
          onChange
        );

        return () =>
          mql.removeEventListener(
            'change',
            onChange
          );
      },
      [query]
    );


  return useSyncExternalStore(
    subscribe,

    () =>
      window.matchMedia(
        query
      ).matches,

    () => false
  );
}


/* ============================================================
   LOADING
   ============================================================ */

function RoomLoading() {

  return (
    <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-background">

      <div
        role="status"
        className="flex items-center gap-3 text-muted-foreground"
      >

        <Loader2
          className="h-5 w-5 animate-spin"
          aria-hidden="true"
        />

        <span>
          Setting up your room...
        </span>

      </div>

    </div>
  );
}


/* ============================================================
   COPY LINK
   ============================================================ */

function CopyLinkButton() {

  const [
    copied,
    setCopied,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);


  async function copy() {

    setError(null);

    try {

      const token =
        localStorage.getItem(
          'sketchpad_token'
        );


      const baseUrl =
        window.location.origin +
        window.location.pathname +
        window.location.search;


      const inviteUrl =
        token &&
        !baseUrl.includes(
          'token='
        )
          ? `${baseUrl}${
              baseUrl.includes('?')
                ? '&'
                : '?'
            }token=${encodeURIComponent(
              token
            )}`
          : baseUrl;


      await navigator.clipboard.writeText(
        inviteUrl
      );


      setCopied(true);


      setTimeout(
        () =>
          setCopied(false),
        2000
      );

    } catch {

      try {

        const textarea =
          document.createElement(
            'textarea'
          );


        const token =
          localStorage.getItem(
            'sketchpad_token'
          );


        const baseUrl =
          window.location.origin +
          window.location.pathname +
          window.location.search;


        const inviteUrl =
          token &&
          !baseUrl.includes(
            'token='
          )
            ? `${baseUrl}${
                baseUrl.includes('?')
                  ? '&'
                  : '?'
              }token=${encodeURIComponent(
                token
              )}`
            : baseUrl;


        textarea.value =
          inviteUrl;


        textarea.style.position =
          'fixed';

        textarea.style.left =
          '-9999px';


        document.body.appendChild(
          textarea
        );

        textarea.select();


        document.execCommand(
          'copy'
        );


        document.body.removeChild(
          textarea
        );


        setCopied(true);


        setTimeout(
          () =>
            setCopied(false),
          2000
        );

      } catch {

        setError(
          'Failed to copy link. Please copy manually.'
        );

        setCopied(false);
      }
    }
  }


  useEffect(() => {

    if (!error) {
      return;
    }


    const timer =
      setTimeout(
        () =>
          setError(null),
        5000
      );


    return () =>
      clearTimeout(
        timer
      );

  }, [
    error,
  ]);


  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={copy}
      aria-label="Copy invite link"
    >

      {copied ? (

        <Check
          className="h-4 w-4 text-primary"
          aria-hidden="true"
        />

      ) : (

        <Link2
          className="h-4 w-4"
          aria-hidden="true"
        />

      )}


      <span className="hidden sm:inline">

        {copied
          ? 'Copied'
          : 'Copy invite link'}

      </span>


      {error && (

        <span className="ml-2 text-sm text-destructive">
          {error}
        </span>

      )}

    </Button>
  );
}


/* ============================================================
   SIDE PANEL
   ============================================================ */

function SidePanel({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <aside className="w-64 shrink-0 overflow-y-auto rounded-2xl border bg-card shadow-sm">
      {children}
    </aside>
  );
}


/* ============================================================
   MOBILE PANEL
   ============================================================ */

function PanelSheet({
  side,
  title,
  icon: Icon,
  children,
}: {
  side:
    | 'left'
    | 'right';

  title: string;

  icon: LucideIcon;

  children: React.ReactNode;
}) {

  return (
    <Sheet>

      <SheetTrigger asChild>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >

          <Icon
            className="h-4 w-4"
            aria-hidden="true"
          />

          <span className="hidden sm:inline">
            {title}
          </span>

          <span className="sr-only sm:hidden">
            {title}
          </span>

        </Button>

      </SheetTrigger>


      <SheetContent
        side={side}
        className="flex w-80 max-w-[85vw] flex-col gap-0 p-0"
      >

        <SheetHeader className="border-b p-4">

          <SheetTitle className="font-serif text-lg font-semibold">
            {title}
          </SheetTitle>

          <SheetDescription className="sr-only">
            {title} panel
          </SheetDescription>

        </SheetHeader>


        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>

      </SheetContent>

    </Sheet>
  );
}


/* ============================================================
   ROOM USERS
   ============================================================ */

/*
 * Build the authoritative list of OTHER users in the room
 * from the single WebSocket owned by RoomClient.
 *
 * Backend events:
 *
 *   room_users
 *      -> initial users for a newly connected client
 *
 *   user_joined
 *      -> add user
 *
 *   user_left
 *      -> remove user
 *
 * The current user is deliberately excluded because the
 * PeoplePanel already displays the current user separately
 * as "You".
 */
function getRoomUsers(
  messages: WebSocketMessage[],
  currentUserId: string
): UserInfo[] {

  const users: Record<
    string,
    UserInfo
  > = {};


  for (
    const message of messages
  ) {

    /* --------------------------------------------------------
       INITIAL ROOM USERS
       -------------------------------------------------------- */

    if (
      message.type ===
      'room_users'
    ) {

      /*
       * room_users is a snapshot from the server.
       *
       * Replace the current collection rather than merely
       * adding to it. This prevents stale users surviving
       * reconnects.
       */
      for (
        const key of Object.keys(
          users
        )
      ) {

        delete users[key];
      }


      for (
        const roomUser of message.users
      ) {

        if (
          roomUser.userId ===
          currentUserId
        ) {
          continue;
        }


        users[
          roomUser.userId
        ] = roomUser;
      }


      continue;
    }


    /* --------------------------------------------------------
       USER JOINED
       -------------------------------------------------------- */

    if (
      message.type ===
      'user_joined'
    ) {

      const joinedUser =
        message.user;


      if (
        joinedUser.userId !==
        currentUserId
      ) {

        users[
          joinedUser.userId
        ] = joinedUser;

      }


      continue;
    }


    /* --------------------------------------------------------
       USER LEFT
       -------------------------------------------------------- */

    if (
      message.type ===
      'user_left'
    ) {

      delete users[
        message.userId
      ];

    }
  }


  return Object.values(
    users
  );
}


/* ============================================================
   PEOPLE MESSAGE SNAPSHOT
   ============================================================ */

/*
 * PeoplePanel/UserList currently receives `messages`.
 *
 * We give it a canonical room_users snapshot generated from
 * the SAME socket used by Canvas.
 *
 * This means UserList does not need its own WebSocket.
 */
function makePeopleMessages(
  messages: WebSocketMessage[],
  currentUserId: string
): WebSocketMessage[] {

  const users =
    getRoomUsers(
      messages,
      currentUserId
    );


  /*
   * Keep the original messages so existing PeoplePanel
   * functionality remains compatible.
   *
   * The final room_users message represents the current
   * authoritative participant snapshot.
   */
  return [
    ...messages,
    {
      type: 'room_users',
      users,
    } as WebSocketMessage,
  ];
}


/* ============================================================
   WORKSPACE
   ============================================================ */

function RoomWorkspace({
  roomId,
  user,
}: {
  roomId: string;
  user: Identity;
}) {

  const router =
    useRouter();


  const isDesktop =
    useMediaQuery(
      '(min-width: 1024px)'
    );


  /*
   * IMPORTANT:
   *
   * There is exactly ONE WebSocket for the room.
   *
   * Canvas and PeoplePanel both consume this same connection.
   */
  const socket =
    useWebSocket(
      roomId
    );


  const [
    color,
    setColor,
  ] = useState(
    user.color
  );


  const [
    size,
    setSize,
  ] = useState(2);


  const [
    currentTool,
    setCurrentTool,
  ] = useState<Tool>(
    'pen'
  );


  const [
    history,
    setHistory,
  ] = useState<HistoryState>({
    canUndo: false,
    canRedo: false,
  });


  const canvasRef =
    useRef<
      SketchpadCanvasHandle
    >(null);


  /*
   * Build the participant messages from the SAME
   * WebSocket messages used by the rest of the room.
   */
  const peopleMessages =
    useMemo(
      () =>
        makePeopleMessages(
          socket.messages,
          user.id
        ),
      [
        socket.messages,
        user.id,
      ]
    );


  const newRoom =
    useCallback(() => {

      router.push(
        roomHref(
          createRoomCode()
        )
      );

    }, [
      router,
    ]);


  const leave =
    useCallback(() => {

      router.push(
        '/sketchpad'
      );

    }, [
      router,
    ]);


  const tools = (
    <ToolPanel
      userColor={
        user.color
      }

      color={
        color
      }

      size={
        size
      }

      currentTool={
        currentTool
      }

      onColorChange={
        setColor
      }

      onSizeChange={
        setSize
      }

      onClear={() =>
        canvasRef.current?.clear()
      }

      onToolChange={
        setCurrentTool
      }

      onUndo={() =>
        canvasRef.current?.undo()
      }

      onRedo={() =>
        canvasRef.current?.redo()
      }

      canUndo={
        history.canUndo
      }

      canRedo={
        history.canRedo
      }
    />
  );


  const people = (
    <PeoplePanel
      roomId={
        roomId
      }

      user={
        user
      }

      /*
       * IMPORTANT:
       * Do NOT create another useWebSocket inside PeoplePanel
       * or UserList.
       *
       * Both receive this exact message stream.
       */
      messages={
        peopleMessages
      }

      connectionStatus={
        socket.connectionStatus
      }

      onNewRoom={
        newRoom
      }

      onLeave={
        leave
      }
    />
  );


  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-background">

      <div
        className={cn(
          'flex h-14 shrink-0 items-center justify-between gap-3 border-b',
          EDGE
        )}
      >

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">

          {!isDesktop && (

            <PanelSheet
              side="left"
              title="Tools"
              icon={Palette}
            >
              {tools}
            </PanelSheet>

          )}


          <span className="hidden text-xs uppercase tracking-wider text-muted-foreground sm:inline">
            Room
          </span>


          <span
            className="truncate rounded-md bg-secondary px-2.5 py-1 font-mono text-sm tracking-widest text-foreground"
            title="Room code"
          >
            {roomId}
          </span>

        </div>


        <div className="flex shrink-0 items-center gap-2">

          <CopyLinkButton />


          {!isDesktop && (

            <PanelSheet
              side="right"
              title="People"
              icon={Users}
            >
              {people}
            </PanelSheet>

          )}

        </div>

      </div>


      <div
        className={cn(
          'flex min-h-0 flex-1 gap-3 py-3 lg:gap-4 lg:py-4',
          EDGE
        )}
      >

        {isDesktop && (

          <SidePanel>
            {tools}
          </SidePanel>

        )}


        <section
          className={cn(
            'flex min-w-0 flex-1 overflow-auto rounded-2xl border bg-secondary text-border',
            'bg-[radial-gradient(circle,currentColor_1px,transparent_1px)]',
            'bg-size-[22px_22px]'
          )}
        >

          <div className="m-auto p-4 lg:p-6">

            <div className="w-fit overflow-hidden rounded-xl border bg-[#fbfaf7] shadow-md [&_canvas]:block [&_p]:border-t [&_p]:border-neutral-200 [&_p]:px-3 [&_p]:py-1.5 [&_p]:text-xs [&_p]:text-neutral-500">

              <SketchpadCanvas
                ref={
                  canvasRef
                }

                width={
                  800
                }

                height={
                  600
                }

                roomId={
                  roomId
                }

                userId={
                  user.id
                }

                currentColor={
                  color
                }

                currentSize={
                  size
                }

                currentTool={
                  currentTool
                }

                socket={
                  socket
                }

                onHistoryChange={
                  setHistory
                }
              />

            </div>

          </div>

        </section>


        {isDesktop && (

          <SidePanel>
            {people}
          </SidePanel>

        )}

      </div>


      <footer
        className={cn(
          'flex h-10 shrink-0 items-center justify-between gap-4 border-t text-xs text-muted-foreground',
          EDGE
        )}
      >

        <span className="truncate">
          Anyone with the room code can join and draw.
        </span>


        <span className="hidden shrink-0 sm:inline">

          ©{' '}
          {new Date().getFullYear()}{' '}
          Sketchpad

        </span>

      </footer>

    </div>
  );
}


/* ============================================================
   ROOM CLIENT
   ============================================================ */

export default function RoomClient({
  roomId,
}: {
  roomId: string;
}) {

  const router =
    useRouter();


  const urlToken =
    typeof window !==
    'undefined'
      ? new URLSearchParams(
          window.location.search
        ).get('token')
      : null;


  const {
    user,
    loading,
  } = useAuth(
    urlToken
  );


  const isClient =
    useIsClient();


  useEffect(() => {

    if (
      loading ||
      !isClient ||
      user
    ) {
      return;
    }


    const next =
      window.location.pathname +
      window.location.search;


    router.replace(
      `/login?next=${encodeURIComponent(
        next
      )}`
    );

  }, [
    loading,
    isClient,
    user,
    router,
  ]);


  if (
    loading ||
    !isClient
  ) {

    return (
      <RoomLoading />
    );
  }


  if (!user) {

    return (
      <RoomLoading />
    );
  }


  /*
   * This MUST match backend make_user_color().
   *
   * The backend owns the final user information, but this
   * gives the local identity the same deterministic color
   * before the WebSocket events arrive.
   */
  const computeColor =
    (
      userId: string
    ): string => {

      let hash = 0;


      for (
        let i = 0;
        i < userId.length;
        i++
      ) {

        hash =
          userId.charCodeAt(i) +
          ((hash << 5) -
            hash);

        /*
         * JavaScript bitwise operators are signed 32-bit,
         * which matches the backend implementation.
         */
        hash |= 0;
      }


      let hue =
        hash % 360;


      if (
        hue < 0
      ) {

        hue += 360;
      }


      return `hsl(${hue}, 70%, 50%)`;
    };


  const identityUser:
    Identity = {

      id:
        user.id,

      name:
        `${user.firstname || ''} ${
          user.lastname || ''
        }`.trim() ||
        `User-${String(
          user.id
        ).slice(0, 4)}`,

      color:
        computeColor(
          user.id
        ),
    };


  return (
    <RoomWorkspace
      key={
        roomId
      }

      roomId={
        roomId
      }

      user={
        identityUser
      }
    />
  );
}