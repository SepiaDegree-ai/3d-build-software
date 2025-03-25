import { useState, useCallback } from 'react';

export default function useHistory(initialState = {}) {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setState = useCallback((newState) => {
    setHistory(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newState];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const currentState = history[currentIndex];

  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo,
    canRedo
  };
} 