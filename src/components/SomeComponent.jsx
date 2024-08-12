// SomeComponent.jsx
import React, { useContext } from 'react';
import { CanvasContext } from './CanvasContext';

const SomeComponent = () => {
  const { canvas } = useContext(CanvasContext);

  const addObject = () => {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'red',
      width: 50,
      height: 50,
    });
    canvas.add(rect);
  };

  return (
    <div>
      <button onClick={addObject}>Add Rectangle</button>
      {/* other UI elements */}
    </div>
  );
};

export default SomeComponent;
