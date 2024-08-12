import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { fabric } from 'fabric';

const Canvas = React.forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !canvasInstance.current) {
      const widthInPx = props.width;
      const heightInPx = props.height;

      canvasInstance.current = new fabric.Canvas(canvasRef.current, {
        width: widthInPx,
        height: heightInPx,
      });

      canvasInstance.current.on('selection:created', (e) => {
        console.log('Object selected:', e.target);
        props.onObjectSelected && props.onObjectSelected(e.target);
      });

      canvasInstance.current.on('selection:updated', (e) => {
        console.log('Object updated:', e.target);
        props.onObjectSelected && props.onObjectSelected(e.target);
      });

      canvasInstance.current.on('selection:cleared', (e) => {
        console.log('Selection cleared');
        props.onObjectDeselected && props.onObjectDeselected();
      });
    }

    return () => {
      if (canvasInstance.current) {
        canvasInstance.current.dispose();
        canvasInstance.current = null;
      }
    };
  }, [props.width, props.height, props.onObjectSelected, props.onObjectDeselected]);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasInstance.current,
    getActiveObjects: () => canvasInstance.current?.getActiveObjects(),
    clearSelection: () => {
      if (canvasInstance.current) {
        canvasInstance.current.discardActiveObject().renderAll();
      }
    },
  }));

  return <canvas ref={canvasRef} className="canvas"></canvas>;
});

export default Canvas;
