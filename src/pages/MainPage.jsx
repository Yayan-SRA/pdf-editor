import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReportModal from '../components/ReportModal';
import 'bootstrap/dist/css/bootstrap.min.css';

function MainPage() {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/get-report'); // Replace with your API endpoint
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleAddReport = () => {
    setShowModal(true);
  };

  const handleSaveReport = async (reportData) => {
    try {
      console.log(reportData);
      const response = await axios.post('http://localhost:3000/api/create-report', reportData); // Ensure the URL is correct
      console.log(response)
      const savedReport = response.data; // Assuming the saved report data is returned
      fetchReports(); // Refresh the list
      setShowModal(false);
      navigate(`/create-report/${savedReport.ID}`); // Navigate to the report creation page with the saved report ID
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };
  

  return (
    <div className='container mt-5'>
      <button className="btn btn-primary" onClick={handleAddReport}>Add Report</button>
      <ReportModal show={showModal} onSave={handleSaveReport} onClose={() => setShowModal(false)} />
      <ul>
        {reports.map(report => (
          <li key={report.ID}>{report.REPORT_NAME}</li>
        ))}
      </ul>
    </div>
  );
}

export default MainPage;
