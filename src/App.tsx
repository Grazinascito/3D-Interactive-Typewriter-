import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TypewriterCanvas } from './three/TypewriterCanvas';
import { typewriterAudio } from './audio/typewriterAudio';
import { TypewriterModelController } from './three/typewriterModel';
import { ALL_KEYS } from './data/keyboardLayout';

export default function App() {
  // Initial typed text on the paper sheet
  const [lines, setLines] = useState<string[]>([
    'programming languages',
    'Special',
  ]);
  const [currentCol, setCurrentCol] = useState<number>(7);
  const maxCols = 36;
  const maxLines = 14;

  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [hintVisible, setHintVisible] = useState<boolean>(true);

  const controllerRef = useRef<TypewriterModelController | null>(null);

  // When user first interacts (types or drags camera), fade out the subtle instruction hint
  const triggerInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Fade out gracefully
      setTimeout(() => {
        setHintVisible(false);
      }, 700);
    }
  }, [hasInteracted]);

  // Execute a typed character
  const handleTypeCharacter = useCallback(
    (char: string, code: string, keyId?: string) => {
      triggerInteraction();
      const model = controllerRef.current;

      // 1. Identify keyId if not provided
      let matchedKeyId = keyId;
      if (!matchedKeyId) {
        const found = ALL_KEYS.find(
          (k) => k.code === code || k.char.toLowerCase() === char.toLowerCase()
        );
        if (found) matchedKeyId = found.id;
      }

      // Visual physical key dip in 3D
      if (model && matchedKeyId) {
        model.pressKey(matchedKeyId);
        setTimeout(() => {
          if (model && matchedKeyId) model.releaseKey(matchedKeyId);
        }, 110);
      }

      // 2. Handle Spacebar
      if (code === 'Space' || char === ' ') {
        typewriterAudio.playSpacebar();
        if (model) {
          model.pressKey('key-space');
          setTimeout(() => model.releaseKey('key-space'), 110);
        }

        setLines((prev) => {
          const next = [...prev];
          const currIdx = next.length - 1;
          if (next[currIdx].length < maxCols) {
            next[currIdx] += ' ';
            setCurrentCol(next[currIdx].length);
          }
          return next;
        });
        return;
      }

      // 3. Handle Backspace
      if (code === 'Backspace' || char === '\b') {
        typewriterAudio.playBackspace();
        setLines((prev) => {
          const next = [...prev];
          const currIdx = next.length - 1;
          if (next[currIdx].length > 0) {
            next[currIdx] = next[currIdx].slice(0, -1);
            setCurrentCol(next[currIdx].length);
          }
          return next;
        });
        return;
      }

      // 4. Handle Carriage Return / Enter
      if (code === 'Enter' || char === '\n') {
        typewriterAudio.playCarriageReturn();
        if (model) {
          model.triggerReturnLever();
        }

        setLines((prev) => {
          if (prev.length >= maxLines) {
            // Scroll up
            return [...prev.slice(1), ''];
          }
          return [...prev, ''];
        });
        setCurrentCol(0);
        return;
      }

      // Ignore modifier keys alone
      if (['Shift', 'CapsLock', 'Control', 'Alt', 'Meta'].includes(char)) {
        return;
      }

      // 5. Standard printable character
      if (char && char.length === 1) {
        // Strike mechanical sounds
        typewriterAudio.playKeyStrike();

        // 3D swinging typebar animation
        if (model) {
          model.triggerTypebarStrike();
        }

        setLines((prev) => {
          const next = [...prev];
          const currIdx = next.length - 1;

          // Margin warning bell at 4 characters before edge
          if (next[currIdx].length === maxCols - 4) {
            typewriterAudio.playBell();
          }

          if (next[currIdx].length < maxCols) {
            next[currIdx] += char;
            setCurrentCol(next[currIdx].length);
          } else {
            // Auto wrap if line full
            typewriterAudio.playCarriageReturn();
            if (model) model.triggerReturnLever();
            setCurrentCol(1);
            return [...next, char];
          }
          return next;
        });
      }
    },
    [maxCols, maxLines, triggerInteraction]
  );

  // Return lever clicked directly on 3D model
  const handleReturnLeverClick = useCallback(() => {
    handleTypeCharacter('\n', 'Enter', 'key-return');
  }, [handleTypeCharacter]);

  // Handle global physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default actions for typing keys
      if (['Space', 'Backspace'].includes(e.code)) {
        e.preventDefault();
      }

      handleTypeCharacter(e.key, e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTypeCharacter]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#e5dfd5] select-none">
      {/* 3D WebGL Canvas with physical typewriter, paper, and natural orbit camera */}
      <TypewriterCanvas
        lines={lines}
        currentCol={currentCol}
        maxCols={maxCols}
        soundEnabled={true}
        onKeyClick={handleTypeCharacter}
        onReturnLeverClick={handleReturnLeverClick}
        onInteraction={triggerInteraction}
        controllerRef={controllerRef}
      />

      {/* Extremely subtle, temporary instruction that fades away upon first interaction */}
      {hintVisible && (
        <div
          id="typewriter-hint"
          className={`pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-widest text-[#7a7469] font-serif transition-opacity duration-1000 ${
            hasInteracted ? 'opacity-0' : 'opacity-70'
          }`}
        >
          drag to explore &bull; type to write
        </div>
      )}
    </main>
  );
}
