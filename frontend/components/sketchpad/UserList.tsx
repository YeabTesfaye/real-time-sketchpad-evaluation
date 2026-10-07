'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/lib/websocket';

interface UserInfo {
  userId: string;
  joinedAt: string;
  color: string;
  name: string;
}

interface UserListProps {
  roomId: string;
}

export function SketchpadUserList({ roomId }: UserListProps) {
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const { messages, connectionStatus } = useWebSocket(roomId);

  // Process user join/leave messages
  useEffect(() => {
    messages.forEach(message => {
      if (message.type === 'user_joined' && message.user) {
        setUsers(prev => ({
          ...prev,
          [message.user.userId]: message.user
        }));
      } else if (message.type === 'user_left' && message.userId) {
        setUsers(prev => {
          const newUsers = {...prev};
          delete newUsers[message.userId];
          return newUsers;
        });
      }
    });
  }, [messages]);

  const userList = Object.values(users);

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium">Users ({userList.length})</span>
        <div className="text-xs text-gray-500">
          {connectionStatus === 'connected' ? 'Online' : 'Offline'}
        </div>
      </div>

      {userList.length === 0 ? (
        <p className="text-center text-gray-400">No other users</p>
      ) : (
        <div className="space-y-2">
          {userList.map(user => (
            <div key={user.userId} className="flex items-center gap-2 p-2 bg-white rounded hover:bg-gray-100">
              <div className="h-3 w-3 rounded-full" style={{backgroundColor: user.color}}></div>
              <span className="font-medium">{user.name}</span>
              <span className="ml-auto text-xs text-gray-500">
                {/* Format time - simplified for now */}
                {new Date(user.joinedAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}