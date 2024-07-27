import React from 'react';

const TextToolbar = ({ canvasRef }) => {
  const changeFontSize = (size) => {
    const canvas = canvasRef.current?.getCanvas();
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fontSize', size);
      canvas.renderAll();
    }
  };

  const changeColor = (color) => {
    const canvas = canvasRef.current?.getCanvas();
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fill', color);
      canvas.renderAll();
    }
  };

  return (
    <div>
      <button onClick={() => changeFontSize(20)}>Font Size 20</button>
      <button onClick={() => changeFontSize(30)}>Font Size 30</button>
      <button onClick={() => changeColor('red')}>Red</button>
      <button onClick={() => changeColor('blue')}>Blue</button>
    </div>
  );
};

export default TextToolbar;
