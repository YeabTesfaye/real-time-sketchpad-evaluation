'use client';

import { useState } from 'react';

interface ToolbarProps {
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onClearCanvas: () => void;
  currentColor: string;
  currentSize: number;
}

export function SketchpadToolbar({
  onColorChange,
  onSizeChange,
  onClearCanvas,
  currentColor,
  currentSize
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="flex flex-col items-start gap-2">
        <span className="font-medium">Drawing Tools</span>
        <div className="flex gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            aria-label="Pen tool"
          >
            {/* Pen icon - simple line */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l20 20M20 2l-8 8" />
            </svg>
          </button>
          {/* Future tools will go here: eraser, shapes, text, etc. */}
        </div>
      </div>

      <div className="flex flex-col items-start gap-2">
        <span className="font-medium">Color</span>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="h-10 w-20 cursor-pointer"
        />
      </div>

      <div className="flex flex-col items-start gap-2">
        <span className="font-medium">Size</span>
        <div className="flex items-center gap-2">
          <label className="text-xs">{currentSize}px</label>
          <input
            type="range"
            min={1}
            max={20}
            value={currentSize}
            onChange={(e) => onSizeChange(parseInt(e.target.value))}
            className="w-20"
          />
        </div>
      </div>

      <div className="flex flex-col items-start gap-2">
        <button
          onClick={onClearCanvas}
          className="flex h-10 w-full items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
}