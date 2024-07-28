import React from 'react';
import * as fabric from 'fabric';

const AddTextButton = ({ canvasRef }) => {
  const addText = () => {
    const canvas = canvasRef.current?.getCanvas(); // Get the Fabric.js canvas instance
    if (canvas) {
      const text = new fabric.IText('New Text', { // Use fabric.IText to allow inline editing
        left: 100,
        top: 100,
        fill: '#000',
        fontSize: 16,
        editable: true
      });
      canvas.add(text);
      canvas.setActiveObject(text); // Set the newly added text as the active object
      canvas.renderAll(); // Ensure the canvas is re-rendered
    }
  };

  return <button onClick={addText}>Add Text</button>;
};

export default AddTextButton;
