import React from 'react';
import * as fabric from 'fabric';

const AddTextButton = ({ canvasRef }) => {
  const addText = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      const text = new fabric.IText('New Text', {
        left: 50,
        top: 50,
        fill: '#000000',
        fontSize: 16,
        editable: true,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    }
  };

  return <button className='btn btn-secondary mt-3' onClick={addText}><i className="fa-solid fa-plus"></i> Text</button>;
};

export default AddTextButton;
