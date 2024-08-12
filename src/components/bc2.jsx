import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import axios from 'axios';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const TableToolbar = ({ canvasRef, addNewPage, canvasStates, setCanvasStates, currentCanvasIndex, currentRowT, setCurrentRowT }) => {
  const [rows, setRows] = useState(50);
  const [columns, setColumns] = useState(3);
  const [data, setData] = useState(generateData(rows, columns));
  const [isPageAdded, setIsPageAdded] = useState(false); // Track if a new page is added
  const [ycoor, setYCoor] = useState(0);
  const [xcoor, setXCoor] = useState(0);
  const [headers, setHeaders] = useState([]);
  const [widths, setWidths] = useState([]);
  const [query, setQuery] = useState('');
  const [parameters, setParameters] = useState('');
  const [queryResult, setQueryResult] = useState([]);
  const [error, setError] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [variant, setVariant] = useState('Query');

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
    let currentY = ycoor;

    if (!canvas) {
      console.error('Canvas not initialized.');
      return;
    }

    console.log("Adding table with rows:", rows, "columns:", columns);
    console.log("Adding table with width:", widths);
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
          left: (c * widths[c]) + xcoor,
          top: currentY,
          width: widths[c],
          height: 30,
          fill: '#fff',
          stroke: '#000',
        });

        const text = new fabric.Textbox(data[r][c], {
          left: (c * widths[c] + 5) + xcoor,
          top: currentY + 5,
          fontSize: 14,
          width: 90, // Initial width of the text box
          editable: true,
          minWidth: 20, // Minimum width of the text box
          maxWidth: widths[c], // Maximum width of the text box
          originX: 'left',
          originY: 'top',
        });

        canvas.add(cell);
        canvas.add(text);

        console.log("Adding cell at position:", c * widths[c], currentY);
        console.log("Adding text with content:", data[r][c]);
      }
      canvas.renderAll();

      currentY += 30; // Move to the next row position
      console.log("Next Y Position after row addition:", currentY);
    }

    // Save the final state of the current page
    saveCanvasState(currentPageIndex);
    setCurrentRowT(0); // Reset the row counter after finishing the table
    setIsPageAdded(false); // Ensure isPageAdded is reset
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

  // Function to lock selected objects
  const lockSelectedObjects = () => {
    const canvas = canvasStates[currentCanvasIndex]?.ref.current?.getCanvas();
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      const activeGroup = canvas.getActiveObjects();

      if (activeGroup && activeGroup.length) {
        activeGroup.forEach((obj) => {
          obj.set({
            editable: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
          });
        });
        canvas.discardActiveObject();
      } else if (activeObject) {
        activeObject.set({
          editable: false,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
        });
      }

      canvas.renderAll();
    }
  };

  // Function to unlock selected objects
  const unlockSelectedObjects = () => {
    const canvas = canvasStates[currentCanvasIndex]?.ref.current?.getCanvas();
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      const activeGroup = canvas.getActiveObjects();

      if (activeGroup && activeGroup.length) {
        activeGroup.forEach((obj) => {
          obj.set({
            editable: true,
            lockMovementX: false,
            lockMovementY: false,
            lockRotation: false,
            lockScalingX: false,
            lockScalingY: false,
          });
        });
        canvas.discardActiveObject();
      } else if (activeObject) {
        activeObject.set({
          editable: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
        });
      }

      canvas.renderAll();
    }
  };

  const fetchQueryResult = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/check-query', {
        query,
        param: JSON.parse(parameters),
      });
      setQueryResult(response.data.data);
    } catch (error) {
      setError('Failed to fetch query results. Please check your query and parameters.');
    }
  };

  // Function to delete selected objects
  const deleteSelectedObjects = () => {
    const canvas = canvasStates[currentCanvasIndex]?.ref.current?.getCanvas();
    if (canvas) {
      const activeGroup = canvas.getActiveObjects();
      console.log("is : ", activeGroup)
      if (activeGroup && activeGroup.length) {
        activeGroup.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
      }
      canvas.renderAll();
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
      <div className="dropdown">
        <button 
          type="button" 
          className="btn btn-primary dropdown-toggle" 
          data-bs-toggle="dropdown">
          {variant} {/* Display selected variant */}
        </button>
        <ul className="dropdown-menu">
          <li><a className="dropdown-item" onClick={() => setVariant('Query')} href="#">Query</a></li>
          <li><a className="dropdown-item" onClick={() => setVariant('Custom')} href="#">Custom</a></li>
        </ul>
      </div>

      {variant === 'Query' && (
        <div>
          <div className="form-group">
            <label>Query:</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Parameters (JSON format):</label>
            <textarea
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              className="form-control"
            />
          </div>
          <button onClick={fetchQueryResult} className="btn btn-primary">Fetch Query Result</button>
          {error && <p className="text-danger">{error}</p>}
          {queryResult.length > 0 && (
            <div>
              <h4>Query Result:</h4>
              <table className="table">
                <thead>
                  <tr>
                    {Object.keys(queryResult[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResult.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {variant === 'Custom' && (
        <div>
          <div className="form-group">
            <label>Rows:</label>
            <input
              type="number"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value))}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Columns:</label>
            <input
              type="number"
              value={columns}
              onChange={(e) => setColumns(parseInt(e.target.value))}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Column Widths (comma-separated):</label>
            <input
              type="text"
              value={widths.join(',')}
              onChange={(e) => setWidths(
                e.target.value
                  .split(',')
                  .map(w => w.trim())
                  .filter(w => w !== '')
                  .map(w => parseInt(w, 10))
              )}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Headers (comma-separated):</label>
            <input
              type="text"
              value={headers.join(',')}
              onChange={(e) => setHeaders(e.target.value.split(','))}
              className="form-control"
            />
          </div>
        </div>
      )}

      <button 
        onClick={() => addTableToCanvas(canvasStates[currentCanvasIndex]?.ref.current?.getCanvas())} 
        className="btn btn-primary">Add Table to Canvas</button>
      <button onClick={deleteSelectedObjects} className="btn btn-danger">Delete Selected Objects</button>
      <button onClick={lockSelectedObjects} className="btn btn-secondary">Lock Selected Objects</button>
      <button onClick={unlockSelectedObjects} className="btn btn-secondary">Unlock Selected Objects</button>
    </div>
  );
};

export default TableToolbar;
