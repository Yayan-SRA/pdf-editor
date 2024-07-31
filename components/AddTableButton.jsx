import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const AddTableButton = ({ canvasRef }) => {
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
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

    // Logic to add the table with the specified rows, cols, headers, and query result to the canvas
    const tableData = queryResult.map(row => headers.map(header => row[header]));

    // Example of adding a table to Fabric.js canvas
    const fabric = window.fabric;
    const table = new fabric.Table({
      rows: tableData.length,
      cols: headers.length,
      data: tableData,
    });

    canvasRef.current.add(table);
  };

  const fetchQueryResult = async () => {
    try {
        console.log("que : ", query)
        console.log("param : ", JSON.parse(parameters))
        console.log("paramOri : ", parameters)
          const response = await axios.post('http://localhost:3000/api/check-query', {
            query,
            parameters: JSON.parse(parameters),
          });
          console.log(response)
          setQueryResult(response.data);
    } catch (error) {
      setError('Failed to fetch query results. Please check your query and parameters.');
    }
  };

  return (
    <div>
      <div className="form-group">
        <label>Rows:</label>
        <input
          type="number"
          className="form-control"
          value={rows}
          onChange={(e) => setRows(Number(e.target.value))}
        />
      </div>
      <div className="form-group">
        <label>Columns:</label>
        <input
          type="number"
          className="form-control"
          value={cols}
          onChange={(e) => setCols(Number(e.target.value))}
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
      <div className="mt-2" style={{ maxHeight: '200px', overflowY: 'scroll' }}>
        <pre>{JSON.stringify(queryResult, null, 2)}</pre>
      </div>
      <button className="btn btn-success mt-2" onClick={handleAddTable}>
        Add Table
      </button>
    </div>
  );
};

export { AddTableButton };
