import React, { useEffect, useImperativeHandle, useRef } from 'react';
import * as fabric from 'fabric';

// const PT_TO_PX = 1.3333333333;

const Canvas = React.forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !canvasInstance.current) {
      // Convert points to pixels using props for width and height
      const widthInPx = props.width;
      const heightInPx = props.height;
    // console.log("wid : ", props)
      canvasInstance.current = new fabric.Canvas(canvasRef.current, {
        width: widthInPx,
        height: heightInPx,
      });

      // Event listener for object selection
      canvasInstance.current.on('selection:created', (e) => {
        console.log('Object selected:', e.target);
        props.onObjectSelected && props.onObjectSelected(e.target);
      });

      canvasInstance.current.on('selection:updated', (e) => {
        console.log('Object updated:', e.target);
        props.onObjectSelected && props.onObjectSelected(e.target);
      });
    }

    return () => {
      if (canvasInstance.current) {
        canvasInstance.current.dispose();
        canvasInstance.current = null;
      }
    };
  }, [props.width, props.height, props.onObjectSelected]);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasInstance.current,
  }));

  return <canvas ref={canvasRef} className="canvas"></canvas>;
});

export default Canvas;
