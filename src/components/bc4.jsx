import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';

const TableToolbar = ({ canvasRef, addNewPage, canvasStates, setCanvasStates, currentCanvasIndex, currentRowT, setCurrentRowT }) => {
  const [rows, setRows] = useState(50);
  const [columns, setColumns] = useState(3);
  const [data, setData] = useState(generateData(rows, columns));
  const [isPageAdded, setIsPageAdded] = useState(false); // Track if a new page is added

  function generateData(rows, columns) {
    const data = [];
    for (let i = 1; i <= rows; i++) {
      const row = [];
      for (let j = 1; j <= columns; j++) {
        row.push(`Row ${i} Col ${j}`);
      }
      data.push(row);
    }
    return data;
  }

  // Function to add table to canvas
  const addTableToCanvas = (canvas) => {
    let currentPageIndex = currentCanvasIndex;
    let currentY = 0;

    if (!canvas) {
      console.error('Canvas not initialized.');
      return;
    }

    console.log("Adding table with rows:", rows, "columns:", columns);
    console.log("Initial Page Index:", currentPageIndex);
    console.log("Canvas Height:", canvas.getHeight());
    console.log("currentRowT:", currentRowT);

    for (let r = currentRowT; r < rows; r++) {
      // Check if we need to create a new page
      if (currentY + 30 > canvas.getHeight()) {
        console.log("Page full, adding new page... in row:", r);
        saveCanvasState(currentPageIndex);
        setCurrentRowT(r); // Update the row to resume on the new page
        addNewPage(); // Add a new page
        setIsPageAdded(true); // Trigger effect to handle new page initialization
        return; // Exit the function and wait for the new page to be added
      }

      // Add rows and columns to canvas
      console.log("Adding row:", r, "at Y Position:", currentY, "on Page:", currentPageIndex);
      for (let c = 0; c < columns; c++) {
        const cell = new fabric.Rect({
          left: c * 100,
          top: currentY,
          width: 100,
          height: 30,
          fill: '#fff',
          stroke: '#000',
        });

        const text = new fabric.Text(data[r][c], {
          left: c * 100 + 5,
          top: currentY + 5,
          fontSize: 14,
          originX: 'left',
          originY: 'top',
        });

        canvas.add(cell);
        canvas.add(text);

        console.log("Adding cell at position:", c * 100, currentY);
        console.log("Adding text with content:", data[r][c]);
      }
      canvas.renderAll();

      currentY += 30; // Move to the next row position
      console.log("Next Y Position after row addition:", currentY);
    }

    // Save the final state of the current page
    saveCanvasState(currentPageIndex);
    setCurrentRowT(0); // Reset the row counter after finishing the table
  };

  const saveCanvasState = (index) => {
    const canvas = canvasStates[index]?.ref.current?.getCanvas();
    if (canvas) {
      const json = canvas.toJSON();
      setCanvasStates(prevStates =>
        prevStates.map((state, i) =>
          i === index ? { ...state, json } : state
        )
      );
      console.log("Saving canvas state for Page Index:", index);
    }
  };

  useEffect(() => {
    if (isPageAdded) {
      // Refetch the canvas after adding a new page
      const canvas = canvasStates[currentCanvasIndex]?.ref.current?.getCanvas();
      if (canvas) {
        console.log("New Canvas Initialized.");
        setIsPageAdded(false); // Reset the flag before adding the table to prevent infinite loop
        setTimeout(() => addTableToCanvas(canvas), 0); // Ensure canvas is fully initialized
      } else {
        console.error('New canvas not initialized.');
      }
    }
  }, [isPageAdded, currentCanvasIndex, canvasStates]);

  return (
    <div>
      <h3>Table Toolbar</h3>
      <div className="form-group">
        <label>Rows:</label>
        <input 
          type="number" 
          className="form-control" 
          value={rows} 
          onChange={(e) => {
            setRows(parseInt(e.target.value, 10));
            setData(generateData(parseInt(e.target.value, 10), columns));
          }}
        />
      </div>
      <div className="form-group">
        <label>Columns:</label>
        <input 
          type="number" 
          className="form-control" 
          value={columns} 
          onChange={(e) => {
            setColumns(parseInt(e.target.value, 10));
            setData(generateData(rows, parseInt(e.target.value, 10)));
          }}
        />
      </div>
      <button className="btn btn-primary" onClick={() => addTableToCanvas(canvasStates[currentCanvasIndex]?.ref.current?.getCanvas())}>Add Table</button>
    </div>
  );
};

export default TableToolbar;
