import React, { useState, useEffect } from 'react';
import './css/TextToolbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function TextToolbar({ canvasRef }) {
    const [fontSize, setFontSize] = useState(16);
    const [left, setLeft] = useState(50);
    const [top, setTop] = useState(50);
    const [fontColor, setFontColor] = useState('#000000');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [textAlign, setTextAlign] = useState('left');
    const [isLocked, setIsLocked] = useState(false);

    const updateTextProperties = () => {
        const canvas = canvasRef.current ? canvasRef.current.getCanvas() : null;
        if (!canvas) return;

        const activeObject = canvas.getActiveObject();
        if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'i-text')) {
        setFontSize(activeObject.fontSize || 16);
        setLeft(activeObject.left || 50);
        setTop(activeObject.top || 50);
        setFontColor(activeObject.fill || '#000000');
        setIsBold(activeObject.fontWeight === 'bold');
        setIsItalic(activeObject.fontStyle === 'italic');
        setIsUnderline(!!activeObject.underline);
        setIsStrikethrough(!!activeObject.linethrough);
        setTextAlign(activeObject.textAlign || 'left');
        setIsLocked(activeObject.lockMovementX);
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
        setLeft(50);
        setTop(50);
        setTextAlign('left');
        setIsLocked(false);
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
            left: left,
            top: top,
            textAlign: textAlign,
            lockMovementX: isLocked,
            lockMovementY: isLocked,
            lockScalingX: isLocked,
            lockScalingY: isLocked,
            lockRotation: isLocked,
            editable: !isLocked,
        });
        canvas.renderAll();
        }
    }, [fontSize, fontColor, isBold, isItalic, isUnderline, isStrikethrough, left, top, textAlign, isLocked, canvasRef]);

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

    const setAlignment = (alignment) => {
        setTextAlign(alignment);
    };

    const handleLeftChange = (e) => {
        setLeft(parseInt(e.target.value) || 50);
    };

    const handleTopChange = (e) => {
        setTop(parseInt(e.target.value) || 50);
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

    const toggleLock = () => {
        setIsLocked(!isLocked);
    };

    return (
        <div className="text-toolbar mt-3">
        <div className="row">
            <div className="col">
            <label>
                Size:
                <input
                type="number"
                value={fontSize}
                onChange={handleFontSizeChange}
                className="form-control"
                min="1" disabled={isLocked}
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
                className="form-control" disabled={isLocked}
                />
            </label>
            </div>
        </div>
        <div className="row">
            <div className="col">
            <label>
                Left:
                <input
                type="number"
                value={left}
                onChange={handleLeftChange}
                className="form-control" disabled={isLocked}
                />
            </label>
            </div>
            <div className="col">
            <label>
                Top:
                <input
                type="number"
                value={top}
                onChange={handleTopChange}
                className="form-control"
                min="0" disabled={isLocked}
                />
            </label>
            </div>
        </div>
        <div className="row">
            <div className="col">
            <button onClick={toggleBold} className={`btn ${isBold ? 'active' : ''}`} disabled={isLocked}>
                <strong>B</strong>
            </button>
            </div>
            <div className="col">
            <button onClick={toggleItalic} className={`btn ${isItalic ? 'active' : ''}`} disabled={isLocked}>
                <em>I</em>
            </button>
            </div>
            <div className="col">
            <button onClick={toggleUnderline} className={`btn ${isUnderline ? 'active' : ''}`} disabled={isLocked}>
                <p style={{ textDecoration: 'underline', marginBottom: 0 }}>U</p>
            </button>
            </div>
            <div className="col">
            <button onClick={toggleStrikethrough} className={`btn ${isStrikethrough ? 'active' : ''}`} disabled={isLocked}>
                <p style={{ textDecoration: 'line-through', marginBottom: 0 }}>ab</p>
            </button>
            </div>
        </div>
        <div className="row">
            <div className="col">
            <button onClick={() => setAlignment('left')} className={`btn ${textAlign === 'left' ? 'active' : ''}`} disabled={isLocked}>
                <i className="fa-solid fa-align-left"></i>
            </button>
            </div>
            <div className="col">
            <button onClick={() => setAlignment('center')} className={`btn ${textAlign === 'center' ? 'active' : ''}`} disabled={isLocked}>
                <i className="fa-solid fa-align-center"></i>
            </button>
            </div>
            <div className="col">
            <button onClick={() => setAlignment('right')} className={`btn ${textAlign === 'right' ? 'active' : ''}`} disabled={isLocked}>
                <i className="fa-solid fa-align-right"></i>
            </button>
            </div>
            <div className="col">
            <button onClick={() => setAlignment('justify')} className={`btn ${textAlign === 'justify' ? 'active' : ''}`} disabled={isLocked}>
                <i className="fa-solid fa-align-justify"></i>
            </button>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <button onClick={toggleLock} className={`btn ${isLocked ? 'active' : ''}`}>
                    {isLocked ? <i className="fa-solid fa-unlock"></i> : <i className="fa-solid fa-lock"></i>}
                    {isLocked ? ' Unlock' : ' Lock'}
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
