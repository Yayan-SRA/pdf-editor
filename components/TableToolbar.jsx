import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import * as fabric from 'fabric';

const TableToolbar = ({ canvasRef }) => {
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(5);
  const [headers, setHeaders] = useState([]);
  const [query, setQuery] = useState('');
  const [parameters, setParameters] = useState('');
  const [queryResult, setQueryResult] = useState([]);
  const [error, setError] = useState('');

  const handleAddTable = () => {
    if (queryResult.length === 0 || headers.length === 0 || headers.length !== cols) {
      alert('Please ensure you have the correct headers and data before adding the table.');
      return;
    }

    const tableData = queryResult.map(row => headers.map(header => row[header]));

    // Access the Fabric.js canvas using getCanvas
    const canvas = canvasRef.current.getCanvas();
    if (!canvas || !(canvas instanceof fabric.Canvas)) {
      console.error('Canvas reference is not a valid Fabric.js canvas.');
      return;
    }

    // Debugging: Print table data to console
    console.log('Table Data:', tableData);

    // Example of adding a simple table to the Fabric.js canvas
    try {
      // Placeholder for table creation
      const table = new fabric.Text('Table Data Placeholder', {
        left: 10,  // Position on canvas
        top: 10,   // Position on canvas
        fontSize: 20,
        fill: '#000',
      });

      canvas.add(table);
      canvas.renderAll();
    } catch (error) {
      console.error('Error adding table to canvas:', error);
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
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(queryResult, null, 2)}
        </div>
      </div>
      <button className="btn btn-success mt-2" onClick={handleAddTable}>
        Add Table
      </button>
    </div>
  );
};

export default TableToolbar;
