import React, { useState, useEffect } from 'react';
import './css/TextToolbar.css';
// import '@fortawesome/fontawesome-free/css/all.min.css';
import ParagraphSave from '../components/ParagraphSave';

function SaveToolbar({ dataProperties }) {
    // Use a function to initialize state based on dataProperties
    const [showSaveParagraphToolbar, setShowSaveParagraphToolbar] = useState(() => dataProperties.tipe === 'PARAGRAPH');
    const [showSaveTableToolbar, setShowSaveTableToolbar] = useState(() => dataProperties.tipe === 'TABLE');
    const [showSaveImageToolbar, setShowSaveImageToolbar] = useState(() => dataProperties.tipe === 'IMAGE');

    // Log dataProperties when it changes
    useEffect(() => {
        if (dataProperties && Object.keys(dataProperties).length > 0) {
            console.log(dataProperties);
        }
    }, [dataProperties]);

    return (
        <div className="text-toolbar mt-3">
            {showSaveParagraphToolbar && (
                <div className="text-sidebar">
                    <ParagraphSave 
                        dataProperties={dataProperties} 
                    />
                </div>
            )}
        </div>
    );
}

export default SaveToolbar;