import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';

const TableToolbar = ({ canvasRef, addNewPage, canvasStates, setCanvasStates, currentCanvasIndex, currentRowT, setCurrentRowT }) => {
  const [rows, setRows] = useState(50);
  const [columns, setColumns] = useState(3);
  const [data, setData] = useState(generateData(rows, columns));
  const [isPageAdded, setIsPageAdded] = useState(false);

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

  const addTableToCanvas = (canvas) => {
    if (!canvas) {
      console.error('Canvas not initialized.');
      return;
    }

    const cellWidth = 100;
    const cellHeight = 30;
    const tableWidth = columns * cellWidth;

    let currentPageIndex = currentCanvasIndex;
    let currentY = 0;
    let currentRow = currentRowT;
    let rowPassed = 0;
    while (currentRow < rows) {
      if (currentY + cellHeight > canvas.getHeight()) {
        // Draw the last horizontal line for the table bottom
        // const horizontalLine = new fabric.Line([0, currentY, tableWidth, currentY], {
        //   stroke: '#000',
        //   selectable: true
        // });
        // canvas.add(horizontalLine);

        for (let c = 0; c <= columns; c++) {
          const x = c * cellWidth;
          
          const horizontalLine = new fabric.Line([x, currentY, cellWidth, currentY], {
            stroke: '#000',
            selectable: true
          });
          canvas.add(horizontalLine);

          // Draw vertical lines for the current column
          const verticalLine = new fabric.Line([x, 0, x, cellHeight*rowPassed], {
            stroke: '#000',
            selectable: true
          });
          canvas.add(verticalLine);
        }
        rowPassed = 0;
        saveCanvasState(currentPageIndex);
        setCurrentRowT(currentRow);
        addNewPage();
        setIsPageAdded(true);
        return;
      }

      for (let c = 0; c <= columns; c++) {
        const x = c * cellWidth;
        const horizontalLine = new fabric.Line([x, currentY, cellWidth, currentY], {
          stroke: '#000',
          selectable: true
        });
        canvas.add(horizontalLine);
        // Add textboxes to cells
        if (c < columns) {
          // Draw horizontal line for the current row

          const textbox = new fabric.Textbox(data[currentRow][c], {
            left: x + 5,
            top: currentY + 5,
            width: cellWidth - 10,
            fontSize: 14,
            editable: true,
            borderColor: '#ccc',
            hasControls: true
          });

          textbox.rowIndex = currentRow;
          textbox.columnIndex = c;

          canvas.add(textbox);
        }
      }
      
      canvas.renderAll();
      currentY += cellHeight;
      currentRow++;
      rowPassed++;
    }

    for (let c = 0; c <= columns; c++) {
      const x = c * cellWidth;
      const horizontalLine = new fabric.Line([x, currentY, cellWidth, currentY], {
        stroke: '#000',
        selectable: true
      });
      canvas.add(horizontalLine);

      
      // Draw vertical lines for the current column
      const verticalLine = new fabric.Line([x, 0, x, cellHeight*rowPassed], {
        stroke: '#000',
        selectable: true
      });
      canvas.add(verticalLine);
    }

    // // Draw the last horizontal line for the table bottom
    // const horizontalLine = new fabric.Line([0, currentY, tableWidth, currentY], {
    //   stroke: '#000',
    //   selectable: true
    // });
    // canvas.add(horizontalLine);

    saveCanvasState(currentPageIndex);
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
      const canvas = canvasStates[currentCanvasIndex]?.ref.current?.getCanvas();
      if (canvas) {
        console.log("New Canvas Initialized.");
        setIsPageAdded(false);
        setTimeout(() => addTableToCanvas(canvas), 0);
      } else {
        console.error('New canvas not initialized.');
      }
    }
  }, [isPageAdded, currentCanvasIndex, canvasStates]);

  return (
    <div>
      <h3>Table Toolbar</h3>
      <div className="form-group">
        <label>X-Coordinate:</label>
        <input
          type="number"
          className="form-control"
          value={xcoor}
          onChange={(e) => handleCoordinateChange(e, true)}
        />
      </div>
      <div className="form-group">
        <label>Y-Coordinate:</label>
        <input
          type="number"
          className="form-control"
          value={ycoor}
          onChange={(e) => handleCoordinateChange(e, false)}
        />
      </div>
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
      <div className="form-group">
        <label>Headers (comma-separated):</label>
        <input
          type="text"
          className="form-control"
          value={headers.join(',')}
          onChange={(e) => setHeaders(e.target.value.split(','))}
        />
      </div>
      <div className="form-group">
        <label>Query:</label>
        <input
          type="text"
          className="form-control"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Parameters (JSON format):</label>
        <input
          type="text"
          className="form-control"
          value={parameters}
          onChange={(e) => setParameters(e.target.value)}
        />
      </div>
      <button className="btn btn-primary mt-2" onClick={fetchQueryResult}>
        Fetch Data
      </button>
      {error && <div className="alert alert-danger mt-2">{error}</div>}
      <div className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
        <pre>{JSON.stringify(queryResult, null, 2)}</pre>
      </div>
      <button className="btn btn-primary" onClick={() => addTableToCanvas(canvasStates[currentCanvasIndex]?.ref.current?.getCanvas())}>Add Table</button>
    </div>
  );
};

export default TableToolbar;
