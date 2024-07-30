import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function ReportModal({ show, onClose, onSave }) {
  const [reportName, setReportName] = useState('');
  const [notes, setNotes] = useState('');
  const [paperSize, setPaperSize] = useState('');
  const [paperSizes, setPaperSizes] = useState([]);
  const [margins, setMargins] = useState({ top: '', bottom: '', left: '', right: '' });
  const [pageNumber, setPageNumber] = useState(false);
  const [footerDesc, setFooterDesc] = useState('');
  const [layout, setLayout] = useState('PORTRAIT');

  useEffect(() => {
    fetchPaperSizes();
  }, []);

  const fetchPaperSizes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/get-paper-size'); // Replace with your API endpoint
      setPaperSizes(response.data.data);
    } catch (error) {
      console.error('Error fetching paper sizes:', error);
    }
  };

  const handleSave = () => {
    onSave({
      reportName,
      notes,
      paperSize,
      margins,
      pageNumber,
      footerDesc,
      layout
    });
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Report</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="reportName" className="form-label">Report Name</label>
              <input
                type="text"
                className="form-control"
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea
                className="form-control"
                id="notes"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="paperSize" className="form-label">Paper Size</label>
              <select
                className="form-select"
                id="paperSize"
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
              >
                <option value="">Select Paper Size</option>
                {paperSizes.map((paper) => (
                  <option key={paper.ID} value={paper.ID}>{paper.NAME}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Margins (in mm)</label>
              <div className="row">
                <div className="col">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Top"
                    value={margins.top}
                    onChange={(e) => setMargins({ ...margins, top: e.target.value })}
                  />
                </div>
                <div className="col">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Bottom"
                    value={margins.bottom}
                    onChange={(e) => setMargins({ ...margins, bottom: e.target.value })}
                  />
                </div>
                <div className="col">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Left"
                    value={margins.left}
                    onChange={(e) => setMargins({ ...margins, left: e.target.value })}
                  />
                </div>
                <div className="col">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Right"
                    value={margins.right}
                    onChange={(e) => setMargins({ ...margins, right: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="pageNumber"
                checked={pageNumber}
                onChange={(e) => setPageNumber(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="pageNumber">Include Page Numbers</label>
            </div>
            <div className="mb-3">
              <label htmlFor="footerDesc" className="form-label">Footer Description</label>
              <input
                type="text"
                className="form-control"
                id="footerDesc"
                value={footerDesc}
                onChange={(e) => setFooterDesc(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="layout" className="form-label">Layout</label>
              <select
                className="form-select"
                id="layout"
                value={layout}
                onChange={(e) => setLayout(e.target.value)}
              >
                <option value="PORTRAIT">Portrait</option>
                <option value="LANDSCAPE">Landscape</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
