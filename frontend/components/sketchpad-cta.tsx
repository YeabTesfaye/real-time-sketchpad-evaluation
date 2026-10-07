'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SketchpadCta() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateSketchpad = async () => {
    setIsGenerating(true);
    try {
      // Generate an 8-char ID with crypto.getRandomValues
      const array = new Uint8Array(4); // 4 bytes = 8 hex characters
      crypto.getRandomValues(array);
      const id = Array.from(array, b => b.toString(16).padStart(2, '0')).join('').toUpperCase().slice(0, 8);
      router.push(`/sketchpad/${id}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCreateSketchpad}
        disabled={isGenerating}
        className="px-6 py-3 bg-accent text-accent-foreground rounded-controls font-medium text-sm hover:bg-accent/90 transition-colors transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      >
        {isGenerating ? 'Creating...' : 'Start sketching'}
      </button>
    </div>
  );
}