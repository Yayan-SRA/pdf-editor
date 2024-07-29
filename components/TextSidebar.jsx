// src/components/TextSidebar.jsx
import React from 'react';
import AddTextButton from './AddTextButton';
import TextToolbar from './TextToolbar';

const TextSidebar = ({ canvasRef }) => {
  return (
    <div className="text-sidebar">
      <AddTextButton canvasRef={canvasRef} />
      <TextToolbar canvasRef={canvasRef} />
    </div>
  );
};

export default TextSidebar;
