import React from 'react';
import * as fabric from 'fabric';

const AddTextButton = ({ canvasRef }) => {
  const addText = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      const text = new fabric.IText('New Text', {
        left: 100,
        top: 100,
        fill: '#000000',
        fontSize: 16,
        editable: true,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    }
  };

  return <button onClick={addText}>Add Text</button>;
};

export default AddTextButton;
