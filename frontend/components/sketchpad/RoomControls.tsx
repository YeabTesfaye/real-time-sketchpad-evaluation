'use client';

import { useState } from 'react';

interface RoomControlsProps {
  roomId: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

export function SketchpadRoomControls({
  roomId,
  onCreateRoom,
  onJoinRoom
}: RoomControlsProps) {
  const [manualRoomId, setManualRoomId] = useState('');

  const handleCreateRoom = () => {
    onCreateRoom();
  };

  const handleJoinRoom = () => {
    if (manualRoomId.trim()) {
      onJoinRoom(manualRoomId.toUpperCase().trim());
    }
  };

  const handleCopyRoomId = () => {
    if (!roomId) return;

    navigator.clipboard.writeText(roomId).then(
      () => alert('Room ID copied to clipboard!'),
      () => alert('Failed to copy room ID')
    );
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium">Room Controls</span>
        {roomId ? (
          <button
            onClick={handleCopyRoomId}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Copy Room ID
          </button>
        ) : null}
      </div>

      {!roomId ? (
        <>
          <div className="mb-3">
            <span className="block text-sm font-medium mb-1">Join or Create Room</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualRoomId}
                onChange={(e) => setManualRoomId(e.target.value.toUpperCase())}
                placeholder="Enter Room ID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinRoom();
                  }
                }}
              />
              <button
                onClick={handleJoinRoom}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Join Room
              </button>
            </div>
          </div>

          <div className="mb-3">
            <button
              onClick={handleCreateRoom}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Create New Room
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-3">
            <span className="block text-sm font-medium mb-1">Current Room:</span>
            <div className="bg-white p-3 rounded-md font-mono text-sm">
              {roomId}
            </div>
          </div>

          <div className="mb-3">
            <button
              onClick={handleCopyRoomId}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Copy Room ID to Share
            </button>
          </div>

          <div>
            <button
              onClick={() => {
                // In a real app, this would navigate to home or clear room state
                alert('Leaving room...');
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Leave Room
            </button>
          </div>
        </>
      )}
    </div>
  );
}