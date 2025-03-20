import React, { useState, useEffect } from 'react';
import './css/TextToolbar.css';
// import '@fortawesome/fontawesome-free/css/all.min.css';
import ParagraphSave from '../components/ParagraphSave';

function SavedToolbar({ dataProperties, canvasRef }) {
    // Use a function to initialize state based on dataProperties
    const [showSaveParagraphToolbar, setShowSaveParagraphToolbar] = useState(() => dataProperties.tipe === 'PARAGRAPH');
    const [showSaveTableToolbar, setShowSaveTableToolbar] = useState(() => dataProperties.tipe === 'TABLE');
    const [showSaveImageToolbar, setShowSaveImageToolbar] = useState(() => dataProperties.tipe === 'IMAGE');

    // Log dataProperties when it changes
    useEffect(() => {
        if (dataProperties && Object.keys(dataProperties).length > 0) {
            console.log('oke');
        }
    }, [dataProperties]);

    return (
        <div className="text-toolbar mt-3">
            {showSaveParagraphToolbar && (
                <div className="text-sidebar">
                    <ParagraphSave 
                        dataProperties={dataProperties} 
                        canvasRef={canvasRef}
                    />
                </div>
            )}
        </div>
    );
}

export default SavedToolbar;