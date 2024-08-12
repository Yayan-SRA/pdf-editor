// CanvasContext.js
import React, { createContext, useState, useEffect, useRef } from 'react';
import * as fabric from 'fabric';

const CanvasContext = createContext();

const CanvasProvider = ({ children }) => {
  const [canvas, setCanvas] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvasInstance = new fabric.Canvas(canvasRef.current);
    setCanvas(canvasInstance);

    // Clean up on unmount
    return () => {
      canvasInstance.dispose();
    };
  }, []);

  return (
    <CanvasContext.Provider value={{ canvas, canvasRef }}>
      {children}
    </CanvasContext.Provider>
  );
};

export { CanvasContext, CanvasProvider };
