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

  const users = useMemo<
    Record<string, UserInfo>
  >(() => {

    const next: Record<
      string,
      UserInfo
    > = {};


    /*
     * Process messages in chronological order.
     *
     * room_users:
     *   Replaces the current room snapshot.
     *
     * user_joined:
     *   Adds or updates a user.
     *
     * user_left:
     *   Removes a user.
     */

    for (
      const message of messages
    ) {

      if (
        message.type ===
        'room_users'
      ) {

        /*
         * The backend sends the users who were already
         * in the room when this connection was established.
         *
         * Reset the list to the authoritative server snapshot.
         */
        Object.keys(next).forEach(
          userId => {
            delete next[userId];
          }
        );

        for (
          const user of message.users ?? []
        ) {

          if (
            user?.userId
          ) {

            next[
              user.userId
            ] = user;
          }
        }

      } else if (
        message.type ===
        'user_joined'
      ) {

        const user =
          message.user;

        if (
          user?.userId
        ) {

          /*
           * Add the user.
           *
           * If the user already exists, update their
           * information instead of creating a duplicate.
           */
          next[
            user.userId
          ] = user;
        }

      } else if (
        message.type ===
        'user_left'
      ) {

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

                <div className="min-w-0 flex-1">

                  <div className="truncate font-medium">
                    {user.name}
                  </div>

                  <div className="text-xs text-gray-500">
                    Joined{' '}
                    {new Date(
                      user.joinedAt
                    ).toLocaleTimeString()}
                  </div>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}