import React, { useState, useEffect } from 'react';
import Canvas from '../components/Canvas';
import AddTextButton from '../components/AddTextButton';
import SavedToolbar from '../components/SavedToolbar';
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
  const [showSaveToolbar, setShowSaveToolbar] = useState(false);
  const { reportId } = useParams();
  const [dataProperties, setDataProperties] = useState([]);
  const [reportConfig, setReportConfig] = useState([]);
  const [reportDetail, setReportDetail] = useState([]);
  const [locked, setLocked] = useState(false);
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

  const lockAllObjects = () => {
    for (let index = 0; index < canvasStates.length; index++) {
      console.log('index ke : ', index)
      const canvas = canvasStates[index]?.ref.current?.getCanvas();
      if (canvas) {
        const allObjects = canvas.getObjects();
        allObjects.forEach(obj => {
          obj.set({
            lockMovementX: !locked,
            lockMovementY: !locked,
            lockRotation: !locked,
            lockScalingX: !locked,
            lockScalingY: !locked,
            lockSkewing: !locked,
          });
          console.log('halaman ke : ', index+1, ' object : ', obj)
        });
        canvas.renderAll(); // Re-render the canvas to apply the changes
        cobasave(index);
      }
    }
    setLocked(!locked); // Toggle the locked state
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

  const cobasave = (i) => {
    const canvas = canvasStates[i]?.ref.current?.getCanvas();
    if (canvas) {
      // Include lock states in the JSON output
      const json = canvas.toJSON([
        'lockMovementX',
        'lockMovementY',
        'lockRotation',
        'lockScalingX',
        'lockScalingY',
        'lockSkewing',
        'tipe'
      ]);
      setCanvasStates(prevStates =>
        prevStates.map((state, index) =>
          index === i ? { ...state, json } : state
        )
      );
    }
  };
  
  

  const saveCanvasState = () => {
    const canvas = canvasStates[currentCanvasIndex]?.ref.current?.getCanvas();
    if (canvas) {
      // const json = canvas.toJSON();
      const json = canvas.toJSON([
        'lockMovementX',
        'lockMovementY',
        'lockRotation',
        'lockScalingX',
        'lockScalingY',
        'lockSkewing',
        'tipe'
      ]);
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
          canvas.loadFromJSON(canvasStates[currentCanvasIndex].json, () => {
          // Ensure the canvas is re-rendered after loading the state
          canvas.renderAll();
        });
      }
    }
  };
  

  // const loadCanvasState = () => {
  //   const canvas = canvasStates[currentCanvasIndex]?.ref.current?.getCanvas();
  //   if (canvas) {
  //     canvas.clear(); // Clear the canvas to avoid overlap
  //     if (canvasStates[currentCanvasIndex]?.json) {
  //       canvas.loadFromJSON(canvasStates[currentCanvasIndex].json, canvas.renderAll.bind(canvas));
  //     }
  //   }
  // };

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
  // if(dataProperties.length != 0){
  //   setShowSaveToolbar(true);
  // }else{
  //   setShowSaveToolbar(false);
  // }

  const R_WIDTH = Math.ceil(reportConfig.paper_size.WIDTH * PT_TO_PX);
  const R_HEIGHT = Math.ceil(reportConfig.paper_size.HEIGHT * PT_TO_PX);
  const R_WIDTH_I = R_WIDTH - Math.ceil(reportConfig.MARGIN[0] * PT_TO_PX) - Math.ceil(reportConfig.MARGIN[1] * PT_TO_PX);
  const R_HEIGHT_I = R_HEIGHT - Math.ceil(reportConfig.MARGIN[2] * PT_TO_PX) - Math.ceil(reportConfig.MARGIN[3] * PT_TO_PX);
  // console.log(R_WIDTH_I)
  return (
<div className="contain">
  <div className="row flex-grow-1">
    <div className="col-3 sidebar bg-white p-3 border-right" style={{ borderRight: '3px solid black' }}>
      <br />
      <button className='btn btn-success m-1 ml-0' onClick={addNewPage} disabled={locked}>+<i className="fa-regular fa-file"></i></button>
      <button className='btn btn-danger m-1 ml-0' onClick={handleDeletePage} disabled={locked}><i className="fa-solid fa-trash-can"></i></button>
      <button onClick={lockAllObjects} className={`btn btn-warning  m-1 ml-0 ${locked ? 'active' : ''}`}>
          {locked ? <i className="fa-solid fa-unlock"></i> : <i className="fa-solid fa-lock"></i>}
      </button>
      <br />
      <button className='btn btn-primary m-1 ml-0' onClick={toggleTextSidebar} disabled={locked}><i className="fa-solid fa-font"></i><small>A</small></button>
      <button className='btn btn-primary m-1' onClick={toggleTableToolbar} disabled={locked}><i className="fa-solid fa-table"></i></button>
      <button className='btn btn-primary m-1' onClick={toggleImageToolbar} disabled={locked}><i className="fa-regular fa-images"></i></button>
      {showTextSidebar && (
        <div className="text-sidebar">
          {/* <AddTextButton canvasRef={canvasStates[currentCanvasIndex]?.ref} /> */}
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
    <div className="col-6 d-flex justify-content-center align-items-center bg-light">
      <div className="canvas-wrapper d-flex justify-content-center align-items-center mt-5 mb-5" style={{ width: R_WIDTH, height: R_HEIGHT }}>
        <div className="canvas-wrapper2 d-flex justify-content-center align-items-center" style={{ width: R_WIDTH_I, height: R_HEIGHT_I }}>
          <Canvas 
            ref={canvasStates[currentCanvasIndex]?.ref} 
            width={R_WIDTH_I} 
            height={R_HEIGHT_I} 
            setDataProperties={setDataProperties} 
            setShowSaveToolbar={setShowSaveToolbar} 
          />
        </div>
      </div>
    </div>
    <div className="col-3 sidebar bg-white p-3 border-left" style={{ borderLeft: '3px solid black' }}>
    {showSaveToolbar && (
        <div className="text-sidebar">
        <SavedToolbar 
        canvasRef={canvasStates[currentCanvasIndex]?.ref}
        dataProperties={dataProperties} 
        />
      </div> 
      )}
    </div>
  </div>
  <div className="row mt-3 justify-content-md-center">
    <div className="col-6 d-flex justify-content-between align-items-center">
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
</div>

  );
}

export default CreateReportPage;
