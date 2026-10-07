'use client';

import { useState, useEffect, useCallback } from 'react';
import { SketchpadCanvas } from '@/components/sketchpad/Canvas';
import { SketchpadToolbar } from '@/components/sketchpad/Toolbar';
import { SketchpadUserList } from '@/components/sketchpad/UserList';
import { SketchpadRoomControls } from '@/components/sketchpad/RoomControls';
import { OperationUtils } from '@/lib/operations';
import { RoomUtils } from '@/lib/room';
import RoomActions from '@/components/room-actions';

export default function SketchpadRoomPage({
  params: { roomId }
}: {
  params: {
    roomId: string
  }
}) {
  const [localUserId, setLocalUserId] = useState<string | null>(null);
  const [localUserName, setLocalUserName] = useState<string | null>(null);
  const [localUserColor, setLocalUserColor] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(2);
  const [isRoomCreated, setIsRoomCreated] = useState(false);

  // Initialize user info when component mounts
  useEffect(() => {
    if (!localUserId) {
      const userId = RoomUtils.generateUserId();
      const userName = RoomUtils.generateUserName(userId);
      const userColor = RoomUtils.generateUserColor(userId);

      setLocalUserId(userId);
      setLocalUserName(userName);
      setLocalUserColor(userColor);
      setCurrentColor(userColor);
    }
  }, [localUserId]);

  // Handle creating a new room
  const handleCreateRoom = useCallback(() => {
    // In a real app, this would navigate to a new room
    // For now, we'll just simulate by setting a flag
    setIsRoomCreated(true);
  }, []);

  // Handle joining a room
  const handleJoinRoom = useCallback((roomId: string) => {
    // In a real app, this would navigate to the specified room
    // For now, we'll just simulate by setting a flag
    setIsRoomCreated(true);
  }, []);

  // Handle clearing canvas
  const handleClearCanvas = useCallback(() => {
    // Canvas clearing is handled within the Canvas component
  }, []);

  // If we don't have a room ID yet, show room creation UI
  if (!roomId || roomId === 'undefined') {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex w-full flex-col items-center justify-center bg-background">
        <div className="w-full max-w-xl space-y-6">
          <RoomActions />
        </div>
      </div>
    );
  }

  // Main sketchpad interface
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            Real-time Collaborative Sketchpad
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full" style={{backgroundColor: localUserColor}}></div>
              <span>{localUserName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Tools */}
        <aside className="w-64 bg-white border-r border-gray-200">
          <SketchpadToolbar
            onColorChange={setCurrentColor}
            onSizeChange={setCurrentSize}
            onClearCanvas={handleClearCanvas}
            currentColor={currentColor}
            currentSize={currentSize}
          />
        </aside>

        {/* Main canvas area */}
        <section className="flex-1 flex flex-col overflow-hidden">
          {localUserId && localUserName && localUserColor ? (
            <div className="flex-1 overflow-hidden">
              <SketchpadCanvas
                width={800}
                height={600}
                roomId={roomId}
                userId={localUserId}
                userName={localUserName}
                userColor={localUserColor}
                currentColor={currentColor}
                currentSize={currentSize}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Initializing...</p>
              </div>
            </div>
          )}

          {/* Connection status bar */}
          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
            Connected • Room: {roomId} • {localUserName}
          </div>
        </section>

        {/* Right sidebar - Users and room controls */}
        <aside className="w-64 bg-white border-l border-gray-200">
          <div className="flex flex-col h-full">
            <SketchpadUserList roomId={roomId} />
            <div className="flex-1"></div>
            <SketchpadRoomControls
              roomId={roomId}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
            />
          </div>
        </aside>
      </main>

      <footer className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Real-time Collaborative Sketchpad •
          <a href="#" className="text-blue-600 hover:text-blue-800">Privacy</a> •
          <a href="#" className="text-blue-600 hover:text-blue-800">Terms</a>
        </div>
      </footer>
    </div>
  );
}