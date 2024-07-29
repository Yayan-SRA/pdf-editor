import React, { useEffect, useImperativeHandle, useRef } from 'react';
import * as fabric from 'fabric';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

const Canvas = React.forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !canvasInstance.current) {
        canvasInstance.current = new fabric.Canvas(canvasRef.current, {
        width: A4_WIDTH,
        height: A4_HEIGHT,
        });

        //   Event listener for object selection
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
  }, [props.onObjectSelected]);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasInstance.current,
  }));

  return <canvas ref={canvasRef} className="canvas"></canvas>;
});

export default Canvas;
