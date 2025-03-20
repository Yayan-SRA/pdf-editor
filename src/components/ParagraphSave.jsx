import React, { useState, useEffect } from 'react';
import './css/TextToolbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function ParagraphSave({ dataProperties, canvasRef }) {
    const [type, setType] = useState(dataProperties.tipe);
    const [section, setSection] = useState(dataProperties.section ? parseInt(dataProperties.section) : 0);
    const [order, setOrder] = useState(dataProperties.order ? parseInt(dataProperties.order) : 0);

    // if(dataProperties.length != 0){
        console.log(dataProperties)
    // }
    const saveSelectedData = () => {
        const canvas = canvasRef.current ? canvasRef.current.getCanvas() : null;
        if (!canvas) return;

        const activeObject = canvas.getActiveObject();
        if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'i-text')) {
            activeObject.set({
                section: section,
                order: order,
            });
            canvas.renderAll();
        }
    };

    return (
        <div className="text-toolbar mt-3">
        <div className="form-group mt-2">
            <label>Type:</label>
            <input
            type="text"
            className="form-control"
            value={type}
            disabled
            />
        </div>
        <div className="form-group mt-2">
            <label>Section Number:</label>
            <input
            type="number"
            className="form-control"
            value={section}
            onChange={(e) => {
                setSection(e.target.value);
            }}
            />
        </div>
        <div className="form-group mt-2">
            <label>Order Number:</label>
            <input
            type="number"
            className="form-control"
            value={order}
            onChange={(e) => {
                setOrder(e.target.value);
            }}
            />
        </div>
        
        <button onClick={saveSelectedData} className="btn btn-success mt-3">
            <i className="fa-regular fa-floppy-disk"></i>
        </button>
        </div>
    );
}

export default ParagraphSave;
