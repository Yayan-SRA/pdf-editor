import React from 'react';

const SaveButton = ({ canvasRef }) => {
  const saveCanvas = () => {
    const canvas = canvasRef.current?.getCanvas(); // Get the Fabric.js canvas instance
    if (canvas) {
      const canvasData = canvas.toJSON();
      console.log('isi : ', canvasData)
      fetch('/api/saveCanvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(canvasData),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Save successful:', data);
      })
      .catch(error => {
        console.error('Error saving canvas:', error);
      });
    }
  };

  return <button onClick={saveCanvas}>Save Canvas</button>;
};

export default SaveButton;
