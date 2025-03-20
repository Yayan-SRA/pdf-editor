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

      // canvasInstance.current.on('mouse:down',function(event){
      //   if(canvasInstance.current.getActiveObject()){
      //       const properties = event.target
      //       if(properties.editable === false && properties.lockMovementX === true){
      //         props.setDataProperties(properties);
      //         props.setShowSaveToolbar(true);
      //       }else{
      //         props.setDataProperties([]);
      //         props.setShowSaveToolbar(false);
      //       }
      //     }else{
      //       props.setDataProperties([]);
      //       props.setShowSaveToolbar(false);
      //   }
      // })

        canvasInstance.current.on('mouse:down', function(event) {
          const allObjects = canvasInstance.current.getObjects(); // Get all objects on the canvas
        
          // if (canvasInstance.current.getActiveObject()) {
          //   const properties = event.target;
            
          //   if (properties.editable === false && properties.lockMovementX === true) {
          //     props.setDataProperties(properties);
          //     props.setShowSaveToolbar(true);
          //   } else {
          //     props.setDataProperties([]);
          //     props.setShowSaveToolbar(false);
          //   }
          // } else {
          //   props.setDataProperties([]);
          //   props.setShowSaveToolbar(false);
          // }
        
          // Example of using allObjects
          console.log('All objects on canvas:', allObjects);
        });
        

        document.addEventListener('keydown', function(event) {
          // Check if Delete or Backspace key is pressed
          if (event.key === 'Delete') {
              // Get the currently selected objects
              const activeObjects = canvasInstance.current.getActiveObjects();
              console.log('ik : ',activeObjects)
              // If there are selected objects, remove them
              if (activeObjects.length > 0) {
                activeObjects.forEach(object => {
                      // console.log('ik2 : ',object)
                      
                      canvasInstance.current.remove(object);
                  });
                  canvasInstance.current.discardActiveObject(); // Clear selection
                  canvasInstance.current.renderAll(); // Re-render the canvas to reflect changes
              }
          }
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
    } else {
      console.warn("Canvas instance already initialized or ref is missing.");
    }

    return () => {
      if (canvasInstance.current) {
        console.log("Disposing of Fabric canvas instance.");
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
