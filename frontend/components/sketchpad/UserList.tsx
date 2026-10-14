'use client';

import {
  useMemo,
} from 'react';

import type {
  ConnectionStatus,
  UserInfo,
  WebSocketMessage,
} from '@/lib/websocket';


interface UserListProps {
  messages: WebSocketMessage[];
  connectionStatus: ConnectionStatus;
}


export function SketchpadUserList({
  messages,
  connectionStatus,
}: UserListProps) {

  /*
   * Users are completely determined by the messages
   * received from the server.
   *
   * We do NOT keep a second piece of React state for this.
   *
   * This also avoids calling setState() from inside
   * useEffect(), which React now warns about.
   */
  const users = useMemo<
    Record<string, UserInfo>
  >(() => {

    const next: Record<
      string,
      UserInfo
    > = {};


    for (
      const message
      of messages
    ) {

      if (
        message.type ===
        'room_users'
      ) {

        /*
         * The server sends the current users when
         * a user enters the room.
         *
         * Start with exactly the users supplied
         * by the server.
         */
        for (
          const user
          of message.users
        ) {

          next[
            user.userId
          ] = user;
        }

      } else if (
        message.type ===
        'user_joined'
      ) {

        /*
         * Add the newly joined user.
         */
        next[
          message.user.userId
        ] = message.user;

      } else if (
        message.type ===
        'user_left'
      ) {

        /*
         * Remove the user who disconnected.
         */
        delete next[
          message.userId
        ];
      }
    }


    return next;

  }, [
    messages,
  ]);


  const userList =
    Object.values(
      users
    );


  return (
    <div className="rounded-lg bg-gray-50 p-4 shadow-md">

      <div className="mb-3 flex items-center justify-between">

        <span className="font-medium">
          Users ({userList.length})
        </span>

        <div className="text-xs text-gray-500">

          {connectionStatus ===
          'connected'
            ? 'Online'
            : 'Offline'}

        </div>

      </div>


      {userList.length === 0 ? (

        <p className="text-center text-gray-400">
          No other users
        </p>

      ) : (

        <div className="space-y-2">

          {userList.map(
            user => (

              <div
                key={
                  user.userId
                }
                className="flex items-center gap-2 rounded bg-white p-2 hover:bg-gray-100"
              >

                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      user.color,
                  }}
                />

                <span className="font-medium">
                  {user.name}
                </span>

                <span className="ml-auto text-xs text-gray-500">
                  {new Date(
                    user.joinedAt
                  ).toLocaleTimeString()}
                </span>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}