import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import axios from 'axios';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const TableToolbar = ({ canvasRef, addNewPage, canvasStates, setCanvasStates, currentCanvasIndex, currentRowT, setCurrentRowT }) => {
  const [rows, setRows] = useState(1);
  const [columns, setColumns] = useState(1);
  const [variant, setVariant] = useState('Query');
  const [data, setData] = useState([]);
  // const [customData, setCustomData] = useState(generateCustomData(rows, columns));
  const [customData, setCustomData] = useState([]);
  const [isPageAdded, setIsPageAdded] = useState(false); // Track if a new page is added
  const [ycoor, setYCoor] = useState(50);
  const [xcoor, setXCoor] = useState(50);
  const [headers, setHeaders] = useState([]);
  const [widths, setWidths] = useState([]);
  const [query, setQuery] = useState('');
  const [parameters, setParameters] = useState('');
  const [queryResult, setQueryResult] = useState([]);
  const [error, setError] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  function generateData() {
    console.log(headers.length, columns)
    if(variant == 'Query'){
      if (queryResult.length === 0 || headers.length === 0 || headers.length !== columns) {
        alert('Please ensure you have the correct headers and data before adding the table.');
        return;
      }
    }
    addTableToCanvas(canvasStates[currentCanvasIndex]?.ref.current?.getCanvas())
  }
  
  function generateCustomData(rows, columns) {
    const data = [];
    for (let i = 1; i <= rows; i++) {
      const row = [];
      for (let j = 1; j <= columns; j++) {
        row.push(`Row ${i} Col ${j}`);
      }
      data.push(row);
    }
    console.log('row : ', rows, " , column : ", columns)
    console.log('isw : ', data)
    return data;
  }

  // Function to add table to canvas
  const addTableToCanvas = (canvas) => {
    let currentPageIndex = currentCanvasIndex;
    console.log('ycoor : ',ycoor);
    let currentY = parseInt(ycoor);
    let canvasHeight = canvas.getHeight();
    console.log('rows : ',rows);
    console.log('col : ',columns);
    console.log('isi : ',data);

    if (!canvas) {
      console.error('Canvas not initialized.');
      return;
    }

    // console.log("Adding table with rows:", rows, "columns:", columns);
    // console.log("Adding table with width:", widths);
    // console.log("Initial Page Index:", currentPageIndex);
    // console.log("Canvas Height:", canvas.getHeight());
    // console.log("currentRowT:", currentRowT);
    console.log('ishe : ', headers)
    if(headers.length !== 0){
      let curYHeader = createHeader(canvas, currentY);
      currentY = curYHeader;
    }
    let dataRender
    if(variant == 'Custom'){
      dataRender = customData
    }else{
      dataRender = data
    }
    for (let r = currentRowT; r < rows; r++) {
      // Check if we need to create a new page
      if (currentY + 30 > canvasHeight) {
        // console.log('curY : ',currentY)
        // console.log('has : ',currentY + 30 )
        // console.log('sil : ',canvasHeight)
        // console.log('check : ',currentY + 30 > canvasHeight)
        // console.log("Page full, adding new page... in row:", r);
        saveCanvasState(currentPageIndex);
        setCurrentRowT(r); // Update the row to resume on the new page
        setYCoor(0);
        addNewPage(); // Add a new page
        setIsPageAdded(true); // Trigger effect to handle new page initialization
        return; // Exit the function and wait for the new page to be added
      }

      // Add rows and columns to canvas
      // console.log("Adding row:", r, "at Y Position:", currentY, "on Page:", currentPageIndex);
      let totalWidth = 0;
      for (let c = 0; c < columns; c++) {
        const cell = new fabric.Rect({
          left: (totalWidth) + xcoor,
          top: currentY,
          width: widths[c],
          height: 30,
          fill: '#fff',
          stroke: '#000',
        });

        const text = new fabric.Textbox(String(dataRender[r][c]), {
          left: (totalWidth + 5) + xcoor,
          top: currentY + 5,
          fontSize: 14,
          // width: 90, // Initial width of the text box
          editable: true,
          // minWidth: 20, // Minimum width of the text box
          width: widths[c]-10, // Maximum width of the text box
          originX: 'left',
          originY: 'top',
        });

        canvas.add(cell);
        canvas.add(text);

        // console.log("Adding cell at position:", c * widths[c], currentY);
        // console.log("Adding text with content:", String(dataRender[r][c]), ', r : ', r, ' , c : ', c);
        totalWidth += widths[c];
      }
      canvas.renderAll();

      currentY += 30; // Move to the next row position
      // console.log("Next Y Position after row addition:", currentY);
    }

    // Save the final state of the current page
    saveCanvasState(currentPageIndex);
    setCurrentRowT(0); // Reset the row counter after finishing the table
  };

  const createHeader = (canvas, currentY) => {
    let totalWidth = 0;
    for (let c = 0; c < columns; c++) {
      const cell = new fabric.Rect({
        left: (totalWidth) + xcoor,
        top: currentY,
        width: widths[c],
        height: 30,
        fill: '#fff',
        stroke: '#000',
      });

      const text = new fabric.Textbox(String(headers[c]), {
        left: (totalWidth + 5) + xcoor,
        top: currentY + 5,
        fontSize: 14,
        // width: 90, // Initial width of the text box
        editable: true,
        // minWidth: 20, // Minimum width of the text box
        width: widths[c], // Maximum width of the text box
        originX: 'left',
        originY: 'top',
      });

      canvas.add(cell);
      canvas.add(text);

      totalWidth += widths[c];
    }
    canvas.renderAll();
    return currentY + 30;
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
      let tempFetch = response.data.data;
      if(variant == 'Query'){
        setColumns(Object.keys(tempFetch[0]).length)
        setRows(tempFetch.length)
      }
      let tempData = tempFetch.map(item => Object.values(item));
      console.log("te : ",tempData[0].length);
      if(variant == 'CustomWithQuery'){
        let lenRo = tempData[0].length
        let temp = [];
        setColumns(2)
        setRows(lenRo)
        for (let i = 0; i < lenRo; i++) {
          const row = [];
          for (let j = 1; j <= 2; j++) {
            if(j == 2){
              row.push(tempData[0][i]);
            }else{
              row.push(`Row ${i+1} Col ${j}`);
            }
          }
          temp.push(row);
        }
        // console.log('row : ', rows, " , column : ", columns)
        // console.log('isw : ', data)
        // return data;
        tempData = temp
      }
      // console.log(tempData)
      setData(tempData);
    } catch (error) {
      setError('Failed to fetch query results. Please check your query and parameters.');
    }
  };

  function chooseVariant(vari){
    setVariant(vari)
    if(vari == 'Query'){
      setData([])
      setCustomData([])
    }else if(vari == 'Custom'){
      setData([])
      setCustomData([])
    }else if(vari == 'CustomWithQuery'){
      setData([])
      setCustomData([])
    }
  }

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
          <li><a className="dropdown-item" onClick={() => chooseVariant('Query')} href="#">Query</a></li>
          <li><a className="dropdown-item" onClick={() => chooseVariant('Custom')} href="#">Custom</a></li>
          <li><a className="dropdown-item" onClick={() => chooseVariant('CustomWithQuery')} href="#">Custom With Query</a></li>
        </ul>
      </div>
      {variant && (
        <>
          <div className="form-group">
            <label>X-Coordinate:</label>
            <input
              type="number"
              className="form-control"
              value={xcoor}
              onChange={
                (e) => setXCoor(e.target.value)  
              }
            />
          </div>
          <div className="form-group">
            <label>Y-Coordinate:</label>
            <input
              type="number"
              className="form-control"
              value={ycoor}
              onChange={
                (e) => setYCoor(e.target.value)
              }
            />
          </div>
          <div className="form-group">
            <label>Cell Width (comma-separated):</label>
            <input
              type="text"
              className="form-control"
              value={widths.join(',')}
              onChange={(e) => setWidths(
                e.target.value
                  .split(',')
                  .map(w => w.trim())
                  .filter(w => w !== '')
                  .map(w => parseInt(w, 10))
              )}
            />
          </div>
          {variant == 'Custom' && (
            <>
              <div className="form-group">
                <label>Rows:</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={rows} 
                  onChange={(e) => {
                    setRows(parseInt(e.target.value, 10));
                    setCustomData(generateCustomData(parseInt(e.target.value, 10), columns));
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
                    setCustomData(generateCustomData(rows, parseInt(e.target.value, 10)));
                  }}
                />
              </div>
            </>
          )}
          {variant !== 'Custom' && (
            <>
              <div className="form-group">
                <label>Headers (comma-separated):</label>
                <input
                  type="text"
                  className="form-control"
                  value={headers.join(',')}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue.trim() === '') {
                      setHeaders([]);
                    } else {
                      setHeaders(inputValue.split(',').map(header => header.trim()).filter(header => header.length > 0));
                    }
                  }}
                />
              </div>
              <div className="form-group">
                <label>Query:</label>
                <textarea
                  type="text"
                  className="form-control"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ height:200 }}
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
            </>
          )}
        {/* <button className="btn btn-primary m-1" onClick={() => addTableToCanvas(canvasStates[currentCanvasIndex]?.ref.current?.getCanvas())}><i className="fa-solid fa-plus"></i></button> */}
        <button className="btn btn-primary m-1" onClick={() => generateData()}><i className="fa-solid fa-plus"></i></button>
        <button className="btn btn-secondary m-1" onClick={lockSelectedObjects}><i className="fa-solid fa-lock"></i></button>
        <button className="btn btn-warning m-1" onClick={unlockSelectedObjects}><i className="fa-solid fa-unlock"></i></button>
        <button className="btn btn-danger m-1" onClick={deleteSelectedObjects}><i className="fa-solid fa-eraser"></i></button>
        </>
      )}
    </div>
  );
};

export default TableToolbar;
