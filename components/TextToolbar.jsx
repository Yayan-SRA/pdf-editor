import React, { useState, useEffect } from 'react';
import './css/TextToolbar.css';

function TextToolbar({ canvasRef }) {
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const updateTextProperties = () => {
    const canvas = canvasRef.current ? canvasRef.current.getCanvas() : null;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    console.log("Active Object:", activeObject); // Log active object

    if (activeObject) {
      if (activeObject.type === 'textbox' || activeObject.type === 'i-text') {
        setFontSize(activeObject.fontSize || 16);
        setFontColor(activeObject.fill || '#000000');
        setIsBold(activeObject.fontWeight === 'bold');
        setIsItalic(activeObject.fontStyle === 'italic');
        setIsUnderline(!!activeObject.underline);
        setIsStrikethrough(!!activeObject.linethrough);

        console.log("Updated Properties:", {
          fontSize: activeObject.fontSize || 16,
          fontColor: activeObject.fill || '#000000',
          isBold: activeObject.fontWeight === 'bold',
          isItalic: activeObject.fontStyle === 'italic',
          isUnderline: !!activeObject.underline,
          isStrikethrough: !!activeObject.linethrough,
        });
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
    setIsItalic(false);
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
      activeObject.set({
        fontSize: fontSize || 16,
        fill: fontColor,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        underline: isUnderline,
        linethrough: isStrikethrough,
      });
      canvas.renderAll();
    }
  }, [fontSize, fontColor, isBold, isItalic, isUnderline, isStrikethrough, canvasRef]);

  const handleFontSizeChange = (e) => {
    setFontSize(parseInt(e.target.value, 10) || 16);
  };

  const handleFontColorChange = (e) => {
    setFontColor(e.target.value);
  };

  const toggleBold = () => {
    setIsBold(!isBold);
  };

  const toggleItalic = () => {
    setIsItalic(!isItalic);
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
      <div className="row">
        <div className="col">
            <label>
            Size:
            <input
                type="number"
                value={fontSize}
                onChange={handleFontSizeChange}
                className="form-control"
                min="1"
            />
            </label>
        </div>
        <div className="col">
            <label>
            Color:
                <input
                    type="color"
                    value={fontColor}
                    onChange={handleFontColorChange}
                    className="form-control"
                />
            </label>
        </div>
    </div>
    <div className="row">
        <div className="col">
            <button onClick={toggleBold} className={`btn ${isBold ? 'active' : ''}`}>
                <strong>B</strong>
            </button>
        </div>
        <div className="col">
            <button onClick={toggleItalic} className={`btn ${isItalic ? 'active' : ''}`}>
                <em>I</em>
            </button>
        </div>
        <div className="col">
            <button onClick={toggleUnderline} className={`btn ${isUnderline ? 'active' : ''}`}>
                <p style={{ textDecoration: 'underline', marginBottom : 0 }}>U</p>
            </button>
        </div>
        <div className="col">
            <button onClick={toggleStrikethrough} className={`btn ${isStrikethrough ? 'active' : ''}`}>
                <p style={{ textDecoration: 'line-through', marginBottom : 0 }}>ab</p>
            </button>
        </div>
    </div>
    <button onClick={deleteActiveObject} className="btn">
        Delete
    </button>
</div>
);
}

export default TextToolbar;
