import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { fabric } from 'fabric';

const TableToolbar = ({ canvasRef, addNewPage, pageHeight }) => {
  const [ycoor, setYCoor] = useState(0);
  const [xcoor, setXCoor] = useState(0);
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(5);
  const [headers, setHeaders] = useState([]);
  const [query, setQuery] = useState('');
  const [parameters, setParameters] = useState('');
  const [queryResult, setQueryResult] = useState([]);
  const [error, setError] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current.getCanvas();

    if (canvas) {
      canvas.on('object:selected', (event) => {
        const selected = event.target;
        if (selected && selected instanceof fabric.Group) {
          setSelectedTable(selected);
          setXCoor(selected.left || 0);
          setYCoor(selected.top || 0);
        }
      });

      canvas.on('object:modified', (event) => {
        const modified = event.target;
        setSelectedTable(modified);
        if (modified && modified instanceof fabric.Group) {
          setXCoor(modified.left || 0);
          setYCoor(modified.top || 0);
        }
      });
    }
  }, [canvasRef]);

  const handleAddTable = () => {
    if (queryResult.length === 0 || headers.length === 0) {
        alert('Please ensure you have the correct headers and data before adding the table.');
        return;
    }

    const tableData = queryResult.map(row => headers.map(header => row[header]));
    const canvas = canvasRef.current.getCanvas();
    if (!canvas || !(canvas instanceof fabric.Canvas)) {
      console.error('Canvas reference is not a valid Fabric.js canvas.');
      return;
    }

    const tableX = xcoor;
    let tableY = ycoor;
    const cellHeight = 30;
    const headerHeight = 40;
    const colWidth = [30, 150, 100, 150, 150]; // Example column widths

    let currentY = tableY;
    let objects = [];
    let widthNow = 0;

    // Add headers
    headers.forEach((header, colIndex) => {
      const headerText = new fabric.Text(header, {
        left: tableX + widthNow + 5,
        top: currentY + (headerHeight / 2),
        fontSize: 14,
        fill: '#000',
        originX: 'left',
        originY: 'center',
        selectable: false
      });

      const headerRect = new fabric.Rect({
        left: tableX + widthNow,
        top: currentY,
        width: colWidth[colIndex],
        height: headerHeight,
        fill: '#ddd',
        stroke: '#000',
        strokeWidth: 1,
        selectable: false
      });

      objects.push(headerRect);
      objects.push(headerText);
      widthNow += colWidth[colIndex];
    });

    currentY += headerHeight;

    // Add rows
    tableData.forEach((row, rowIndex) => {
      widthNow = 0;
      if (currentY + cellHeight > pageHeight) {
        // Add the current objects to the canvas
        const tableGroup = new fabric.Group(objects, {
          left: tableX,
          top: tableY,
          originX: 'left',
          originY: 'top',
          selectable: true,
          hasControls: true
        });
        canvas.add(tableGroup);
        canvas.renderAll();

        // Prepare for a new page
        addNewPage(); // Add a new page to the canvas or report
        objects = [];
        tableY = 0;
        currentY = 0;
      }

      row.forEach((cell, colIndex) => {
        const cellText = new fabric.Text(String(cell), {
          left: tableX + widthNow + 5,
          top: currentY + (cellHeight / 2),
          fontSize: 14,
          fill: '#000',
          originX: 'left',
          originY: 'center',
          selectable: false
        });

        const cellRect = new fabric.Rect({
          left: tableX + widthNow,
          top: currentY,
          width: colWidth[colIndex],
          height: cellHeight,
          fill: '#fff',
          stroke: '#000',
          strokeWidth: 1,
          selectable: false
        });

        objects.push(cellRect);
        objects.push(cellText);
        widthNow += colWidth[colIndex];
      });

      currentY += cellHeight;
    });

    // Add remaining objects to the canvas
    const tableGroup = new fabric.Group(objects, {
      left: tableX,
      top: tableY,
      originX: 'left',
      originY: 'top',
      selectable: true,
      hasControls: true
    });
    canvas.add(tableGroup);
    canvas.renderAll();

    setSelectedTable(tableGroup);
  };

  const handleDeleteTable = () => {
    const canvas = canvasRef.current.getCanvas();
    if (!canvas || !(canvas instanceof fabric.Canvas)) {
      console.error('Canvas reference is not a valid Fabric.js canvas.');
      return;
    }

    if (selectedTable) {
      canvas.remove(selectedTable);
      canvas.renderAll();
      setSelectedTable(null);
    } else {
      alert('Please select a table to delete.');
    }
  };

  const handleCoordinateChange = (e, isX) => {
    const newValue = Number(e.target.value);
    if (selectedTable) {
      if (isX) {
        setXCoor(newValue);
        selectedTable.set({ left: newValue });
      } else {
        setYCoor(newValue);
        selectedTable.set({ top: newValue });
      }
      canvasRef.current.getCanvas().renderAll();
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

  const countProperties = (obj) => {
    if (obj && typeof obj === 'object') {
      return Object.keys(obj).length;
    }
    return 0;
  };

  return (
    <div>
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
          value={queryResult.length || rows}
          onChange={(e) => setRows(Number(e.target.value))}
          disabled={!!queryResult}
        />
      </div>
      <div className="form-group">
        <label>Columns:</label>
        <input
          type="number"
          className="form-control"
          value={queryResult.length > 0 ? countProperties(queryResult[0]) : cols}
          onChange={(e) => setCols(Number(e.target.value))}
          disabled={!!queryResult}
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
      <button className="btn btn-primary mt-2" onClick={handleAddTable}>
        Add Table
      </button>
      <button className="btn btn-danger mt-2" onClick={handleDeleteTable}>
        Delete Table
      </button>
    </div>
  );
};

export default TableToolbar;
