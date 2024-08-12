import React, { useState, useEffect } from 'react';
import Canvas from '../components/Canvas';
import AddTextButton from '../components/AddTextButton';
import SaveButton from '../components/SaveButton';
import TextToolbar from '../components/TextToolbar';
import TableToolbar from '../components/TableToolbar';
import ImageToolbar from '../components/ImageToolbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function CreateReportPage() {
  const [canvasStates, setCanvasStates] = useState([{ ref: React.createRef(), json: null }]);
  const [currentCanvasIndex, setCurrentCanvasIndex] = useState(0);
  const [currentRowT, setCurrentRowT] = useState(0);
  const [showTextSidebar, setShowTextSidebar] = useState(false);
  const [showTableToolbar, setShowTableToolbar] = useState(false);
  const [showImageToolbar, setShowImageToolbar] = useState(false);
  const { reportId } = useParams();
  const [reportConfig, setReportConfig] = useState([]);
  const [reportDetail, setReportDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const PT_TO_PX = 1.3333333333;

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/get-report-detail/${reportId}`);
        setReportDetail(response.data.data.reportDetail);
        setReportConfig(response.data.data.reportConfig);
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
  const toggleImageToolbar = () => {
    setShowImageToolbar(!showImageToolbar);
  };

  const addNewPage = () => {
    saveCanvasState(); // Save the current state before switching
    setCanvasStates(prevStates => [
      ...prevStates, 
      { ref: React.createRef(), json: null }
    ]);
    setCurrentCanvasIndex(canvasStates.length);
  };

  const handleDeletePage = () => {
    if (canvasStates.length > 1) {
      const updatedCanvasStates = canvasStates.filter((_, index) => index !== currentCanvasIndex);
      setCanvasStates(updatedCanvasStates);
      setCurrentCanvasIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else {
      alert('You must have at least one page.');
    }
  };

  const saveCanvasState = () => {
    const canvas = canvasStates[currentCanvasIndex]?.ref.current?.getCanvas();
    if (canvas) {
      const json = canvas.toJSON();
      setCanvasStates(prevStates =>
        prevStates.map((state, index) =>
          index === currentCanvasIndex ? { ...state, json } : state
        )
      );
    }
  };

  const loadCanvasState = () => {
    const canvas = canvasStates[currentCanvasIndex]?.ref.current?.getCanvas();
    if (canvas) {
      canvas.clear(); // Clear the canvas to avoid overlap
      if (canvasStates[currentCanvasIndex]?.json) {
        canvas.loadFromJSON(canvasStates[currentCanvasIndex].json, canvas.renderAll.bind(canvas));
      }
    }
  };

  const goToPage = (index) => {
    if (index < 0 || index >= canvasStates.length) return; // Prevent out-of-bounds access
    saveCanvasState(); // Save the current state before switching
    setCurrentCanvasIndex(index);
  };

  useEffect(() => {
    loadCanvasState(); // Load canvas state on initial render and whenever the index changes
  }, [currentCanvasIndex]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const R_WIDTH = Math.ceil(reportConfig.paper_size.WIDTH * PT_TO_PX);
  const R_HEIGHT = Math.ceil(reportConfig.paper_size.HEIGHT * PT_TO_PX);
  const R_WIDTH_I = R_WIDTH - Math.ceil(reportConfig.MARGIN[0] * PT_TO_PX) - Math.ceil(reportConfig.MARGIN[1] * PT_TO_PX);
  const R_HEIGHT_I = R_HEIGHT - Math.ceil(reportConfig.MARGIN[2] * PT_TO_PX) - Math.ceil(reportConfig.MARGIN[3] * PT_TO_PX);

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex flex-grow-1">
        <div className="sidebar bg-light p-3 border-right">
          {/* <SaveButton canvasRef={canvasStates[currentCanvasIndex]?.ref} /> */}
          <br />
          <button className='btn btn-success m-1 ml-0' onClick={addNewPage}>+<i className="fa-regular fa-file"></i></button>
          <button className='btn btn-danger m-1 ml-0' onClick={handleDeletePage}><i className="fa-solid fa-trash-can"></i></button>
          <br />
          <button className='btn btn-primary m-1 ml-0' onClick={toggleTextSidebar}><i className="fa-solid fa-font"></i><small>A</small></button>
          <button className='btn btn-primary m-1' onClick={toggleTableToolbar}><i className="fa-solid fa-table"></i></button>
          <button className='btn btn-primary m-1' onClick={toggleImageToolbar}><i className="fa-regular fa-images"></i></button>
          {showTextSidebar && (
            <div className="text-sidebar">
              <AddTextButton canvasRef={canvasStates[currentCanvasIndex]?.ref} />
              <TextToolbar canvasRef={canvasStates[currentCanvasIndex]?.ref} />
            </div>
          )}
          {showTableToolbar && (
            <TableToolbar 
              canvasRef={canvasStates[currentCanvasIndex]?.ref} 
              addNewPage={addNewPage} 
              canvasStates={canvasStates} 
              setCanvasStates={setCanvasStates} 
              currentCanvasIndex={currentCanvasIndex} 
              setCurrentRowT={setCurrentRowT} 
              currentRowT={currentRowT} 
            />
          )}
          {showImageToolbar && (
            <ImageToolbar canvasRef={canvasStates[currentCanvasIndex]?.ref} /> 
          )}
        </div>
        <div className="flex-grow-1 d-flex justify-content-center align-items-center bg-light">
          <div className="canvas-wrapper d-flex justify-content-center align-items-center mt-5 mb-5" style={{ width: R_WIDTH, height: R_HEIGHT }}>
            <div className="canvas-wrapper2 d-flex justify-content-center align-items-center" style={{ width: R_WIDTH_I, height: R_HEIGHT_I }}>
              <Canvas 
                ref={canvasStates[currentCanvasIndex]?.ref} 
                width={R_WIDTH_I} 
                height={R_HEIGHT_I} 
              />
            </div>
          </div>
        </div>
      </div>
      <div className="page-navigation mt-3">
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => goToPage(currentCanvasIndex - 1)} 
          disabled={currentCanvasIndex === 0}
        >
          Previous
        </button>
        <span className="mx-2">{currentCanvasIndex + 1} / {canvasStates.length}</span>
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => goToPage(currentCanvasIndex + 1)} 
          disabled={currentCanvasIndex === canvasStates.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default CreateReportPage;
