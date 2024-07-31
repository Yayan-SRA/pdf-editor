import React, { useRef, useEffect, useState } from 'react';
import Canvas from '../../components/Canvas';
import AddTextButton from '../../components/AddTextButton';
import SaveButton from '../../components/SaveButton';
import TextToolbar from '../../components/TextToolbar';
import TableToolbar from '../../components/TableToolbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function CreateReportPage() {
  const canvasRef = useRef(null);
  const [showTextSidebar, setShowTextSidebar] = useState(false);
  const [showTableToolbar, setShowTableToolbar] = useState(false);
  const { reportId } = useParams();
  const [reportConfig, setReportConfigs] = useState([]);
  const [reportDetail, setReportDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const PT_TO_PX = 1.3333333333;

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/get-report-detail/${reportId}`);
        console.log(response.data.data);
        setReportDetail(response.data.data.reportDetail);
        setReportConfigs(response.data.data.reportConfig);
      } catch (err) {
        setError('Failed to fetch report data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const toggleTextSidebar = () => {
    setShowTextSidebar(!showTextSidebar);
  };

  const toggleTableToolbar = () => {
    setShowTableToolbar(!showTableToolbar);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const R_WIDTH = Math.ceil(reportConfig.paper_size.WIDTH * PT_TO_PX);
  const R_HEIGHT = Math.ceil(reportConfig.paper_size.HEIGHT * PT_TO_PX);
  const R_WIDTH_I = Math.ceil(reportConfig.paper_size.WIDTH * PT_TO_PX) - Math.ceil(reportConfig.MARGIN[0] * PT_TO_PX) - Math.ceil(reportConfig.MARGIN[1] * PT_TO_PX);
  const R_HEIGHT_I = Math.ceil(reportConfig.paper_size.HEIGHT * PT_TO_PX) - Math.ceil(reportConfig.MARGIN[2] * PT_TO_PX) - Math.ceil(reportConfig.MARGIN[3] * PT_TO_PX);

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex flex-grow-1">
        <div className="sidebar bg-light p-3 border-right">
          <SaveButton canvasRef={canvasRef} />
          <br />
          <button className='btn btn-primary mt-2 mr-2' onClick={toggleTextSidebar}>Text</button>
          <button className='btn btn-primary mt-2' onClick={toggleTableToolbar}>Table</button>
          {showTextSidebar && (
            <div className="text-sidebar">
              <AddTextButton canvasRef={canvasRef} />
              <TextToolbar canvasRef={canvasRef} />
            </div>
          )}
          {showTableToolbar && (
            <TableToolbar canvasRef={canvasRef} />
          )}
        </div>
        <div className="flex-grow-1 d-flex justify-content-center align-items-center bg-light">
          <div className="canvas-wrapper d-flex justify-content-center align-items-center mt-5 mb-5" style={{ width: R_WIDTH, height: R_HEIGHT}}>
            <div className="canvas-wrapper2 d-flex justify-content-center align-items-center" style={{ width: R_WIDTH_I, height: R_HEIGHT_I}}>
              <Canvas 
                ref={canvasRef} 
                width={reportConfig ? R_WIDTH_I : 595.28} 
                height={reportConfig ? R_HEIGHT_I : 841.89} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateReportPage;
