import React, { useState, useEffect } from 'react';

function TextToolbar({ canvasRef }) {
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const updateTextProperties = () => {
    const canvas = canvasRef.current ? canvasRef.current.getCanvas() : null;
    if (!canvas) {
      console.error('Canvas is not initialized');
      return;
    }

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === 'textbox' || activeObject.type === 'i-text') {
        setFontSize(activeObject.fontSize || 16);
        setFontColor(activeObject.fill || '#000000');
        setIsBold(activeObject.fontWeight === 'bold');
        setIsUnderline(!!activeObject.underline);
        setIsStrikethrough(!!activeObject.linethrough);
      } else {
        resetTextProperties();
      }
    } else {
      resetTextProperties();
    }
  };

  const resetTextProperties = () => {
    setFontSize(16);
    setFontColor('#000000');
    setIsBold(false);
    setIsUnderline(false);
    setIsStrikethrough(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current ? canvasRef.current.getCanvas() : null;
    if (!canvas) return;

    canvas.on('selection:created', updateTextProperties);
    canvas.on('selection:updated', updateTextProperties);
    canvas.on('selection:cleared', resetTextProperties);

    return () => {
      if (canvas) {
        canvas.off('selection:created', updateTextProperties);
        canvas.off('selection:updated', updateTextProperties);
        canvas.off('selection:cleared', resetTextProperties);
      }
    };
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current ? canvasRef.current.getCanvas() : null;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'i-text')) {
      activeObject.setSelectionStyles({
        fontSize: fontSize || 16,
        fill: fontColor,
        fontWeight: isBold ? 'bold' : 'normal',
        underline: isUnderline,
        linethrough: isStrikethrough,
      });
      canvas.renderAll();
    }
  }, [fontSize, fontColor, isBold, isUnderline, isStrikethrough, canvasRef]);

  const handleFontSizeChange = (e) => {
    setFontSize(parseInt(e.target.value, 10) || 16);
  };

  const handleFontColorChange = (e) => {
    setFontColor(e.target.value);
  };

  const toggleBold = () => {
    setIsBold(!isBold);
  };

  const toggleUnderline = () => {
    setIsUnderline(!isUnderline);
  };

  const toggleStrikethrough = () => {
    setIsStrikethrough(!isStrikethrough);
  };
  
  const deleteActiveObject = () => {
    const canvas = canvasRef.current ? canvasRef.current.getCanvas() : null;
    if (!canvas) {
      console.error('Canvas is not initialized');
      return;
    }

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
    } else {
      console.log('No active object to delete');
    }
  };

  return (
    <div className="text-toolbar">
      <label>
        Font Size:
        <input
          type="number"
          value={fontSize}
          onChange={handleFontSizeChange}
          className="form-control"
          min="1"
        />
      </label>
      <label>
        Font Color:
        <input
          type="color"
          value={fontColor}
          onChange={handleFontColorChange}
          className="form-control"
        />
      </label>
      <button onClick={toggleBold} className="btn">
        {isBold ? 'Unbold' : 'Bold'}
      </button>
      <button onClick={toggleUnderline} className="btn">
        {isUnderline ? 'Remove Underline' : 'Underline'}
      </button>
      <button onClick={toggleStrikethrough} className="btn">
        {isStrikethrough ? 'Remove Strikethrough' : 'Strikethrough'}
      </button>
      <button onClick={deleteActiveObject} className="btn">
        Delete
      </button>
    </div>
  );
}

export default TextToolbar;
