import React, { useRef } from 'react';
import Canvas from '../components/Canvas';
import AddTextButton from '../components/AddTextButton';
import SaveButton from '../components/SaveButton';
import TextToolbar from '../components/TextToolbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App2.css';

function App() {
  const canvasRef = useRef(null);

  return (
    <div className="d-flex flex-column h-100">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">PDF Editor</a>
      </nav>
      <div className="d-flex flex-grow-1">
        <div className="sidebar bg-light p-3 border-right">
          <SaveButton canvasRef={canvasRef} />
          <AddTextButton canvasRef={canvasRef} />
          <TextToolbar canvasRef={canvasRef} />
        </div>
        <div className="flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="canvas-wrapper d-flex justify-content-center align-items-center">
            <Canvas ref={canvasRef} />
          </div>
        </div>
      </div>
      <footer className="bg-light text-center py-3 border-top">
        &copy; 2024 Your Company
      </footer>
    </div>
  );
}

export default App;
