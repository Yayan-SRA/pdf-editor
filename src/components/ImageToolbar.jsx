import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fabric } from 'fabric';
// import { getFileFromS3 } from '../utils/S3Utils'; // Import the utility function

function ImageToolbar({ canvasRef }) {
    const [source, setSource] = useState('Local');
    const [imageList, setImageList] = useState([]);
    const [selectedImage, setSelectedImage] = useState([]);
    const [imgParameter, setImgParameters] = useState('');
    const [query, setQuery] = useState('');
    const [queryImgResult, setQueryImgResult] = useState([]);
    const [error, setError] = useState('');
    const [imgKey, setImgKey] = useState([]);

    const addImageToCanvas = async () => {
        console.log(imgKey)
        let list = imgKey
        let allData = [];

        let temp = [];
        queryImgResult.forEach(element => {
            // Ensure element is an object
            if (typeof element === 'object' && element !== null) {
                Object.entries(element).forEach(([key, value]) => {
                    // Check if key is in the list
                    if (list.includes(key)) {
                        if(value != null){
                            temp.push(value);
                        }
                    }
                });
                // allData.push(temp);
            }
        });
        console.log(allData)
        const canvas = canvasRef.current.getCanvas();
        // selectedImage.forEach(imageUrl => {
        // if(source == 'Query'){
            const getImages = await axios.post('http://localhost:3000/api/get-s3-img', {
                key: temp,
                bucket:"cboss-snt"
            });
            const images = getImages.data.fileUrl;
            // console.log(images)
            // const content = await getFileFromS3(fileName, true); // Request as text
            // setFileContent(content);
            // console.log('is : ', content)
        // }
        images.forEach(element => {
            fabric.Image.fromURL(element, (img) => {
                img.scaleToWidth(200);
                // Adjust the x and y coordinates as needed
                canvas.add(img);
                canvas.renderAll();
            });
            
        });
        // });
    };
    const addSingleImageToCanvas = async (refer) => {
        const canvas = canvasRef.current.getCanvas();
        fabric.Image.fromURL(refer, (img) => {
            img.scaleToWidth(200);
            // Adjust the x and y coordinates as needed
            canvas.add(img);
            canvas.renderAll();
        });
        // });
    };

    const chooseSource = async (vari) => {
        if (vari === 'Local') {
            const img = await axios.post('http://localhost:3000/api/get-local-img', {
                folder: 'logo',
            });
            console.log('img : ', img)
            const imgList = img.data;
            setImageList(imgList);
            setSource(vari);
        } else {
            setImageList([]);
            setSource(vari);
        }
    };

    const fetchImgQueryResult = async () => {
        try {
            // console.log('check : ', imgParameter , 'tes : ', )
        const response = await axios.post('http://localhost:3000/api/check-query', {
            query,
            param: imgParameter == '' ? null : JSON.parse(imgParameter),
        });
        const result = response.data.data;
        setQueryImgResult(result);
        // setImageList(result.map(item => Object.values(item)[0])); // Assuming each item has an image URL in the first key
        } catch (error) {
        setError('Failed to fetch query results. Please check your query and parameters.');
        }
    };

    useEffect(() => {
        // Using POST request to fetch image paths
        fetch('http://localhost:3000/api/get-local-img', {
            method: 'POST', // Change method to POST
            headers: {
            'Content-Type': 'application/json',
            },
            // You can send a body if needed; empty object here for demonstration
            body: JSON.stringify({
                folder : 'logo'
            }),
        })
            .then(response => response.json())
            .then(data => setImageList(data))
            .catch(error => console.error('Error fetching image paths:', error));
        console.log(imageList)
    }, []);

    return (
        <div>
        <h6>Image Toolbar</h6>
        <div className="dropdown">
            <button 
            type="button" 
            className="btn btn-secondary dropdown-toggle" 
            data-bs-toggle="dropdown">
            {source}
            </button>
            <ul className="dropdown-menu">
            <li><a className="dropdown-item" onClick={() => chooseSource('Local')} href="#">Local</a></li>
            <li><a className="dropdown-item" onClick={() => chooseSource('Query')} href="#">Query</a></li>
            </ul>
        </div>
        {source && (
            <>
            {source === 'Local' && (
                <>
                <div className="dropdown mt-2">
                    <button 
                    type="button" 
                    className="btn btn-secondary dropdown-toggle" 
                    data-bs-toggle="dropdown">
                    Image
                    </button>
                    <ul className="dropdown-menu" style={{ maxWidth:500 }}>
                    {imageList.length > 0 ? (
                        <div>
                        {imageList.map((path, index) => (
                            // <li key={index}>
                                <a className='m-1' key={index} href="#" onClick={() => addSingleImageToCanvas(`http://localhost:3000/${path}`)}>
                                    <img src={`http://localhost:3000/${path}`} alt={`Logo ${index}`} style={{ width: '50px', height: '25px' }} />
                                </a>
                            // </li>
                        ))}
                        </div>
                    ) : (
                        <li>No images found.</li>
                    )}
                    </ul>
                </div>
                </>
            )}
            {source === 'Query' && (
                <>
                <div className="form-group">
                    <label>Query:</label>
                    <textarea
                    type="text"
                    className="form-control"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ height: 200 }}
                    />
                </div>
                <small style={{ color:'red' }}>*if needed dynamic title and substile don't forget to rename it in query (use uppercase)</small>
                <div className="form-group">
                    <label>Parameters (JSON format):</label>
                    <input
                    type="text"
                    className="form-control"
                    value={imgParameter}
                    onChange={(e) => setImgParameters(e.target.value)}
                    // onChange={(e) => {
                    //     const inputValue = e.target.value;
                    //     if (inputValue.trim() === '') {
                    //         setImgParameters(null);
                    //     } else {
                    //         setImgParameters(e.target.value);
                    //     }
                    // }}
                    />
                </div>
                <button className="btn btn-primary mt-2" onClick={fetchImgQueryResult}>
                    Fetch Data
                </button>
                {error && <div className="alert alert-danger mt-2">{error}</div>}
                <div className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto', maxWidth: '535px', border: '1px solid #ddd', padding: '10px' }}>
                    <pre>{JSON.stringify(queryImgResult, null, 2)}</pre>
                </div>
                <div className="form-group">
                    <label>Image Key (comma-separated):</label>
                    <input
                    type="text"
                    className="form-control"
                    value={imgKey.join(',')}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue.trim() === '') {
                        setImgKey([]);
                        } else {
                        setImgKey(inputValue.split(',').map(imKey => imKey.trim()).filter(imKey => imKey.length > 0));
                        }
                    }}
                    />
                </div>
                <button className="btn btn-primary mt-1" onClick={addImageToCanvas}>
                <i className="fa-solid fa-plus"></i> <i className="fa-solid fa-image"></i>
                </button>
                {/* <div className="dropdown mt-2">
                    <button 
                    type="button" 
                    className="btn btn-secondary dropdown-toggle" 
                    data-bs-toggle="dropdown">
                    Select Image
                    </button>
                    <ul className="dropdown-menu">
                    {queryImgResult.map((item, index) => (
                        <li key={index}>
                        <a className="dropdown-item" onClick={() => setSelectedImage([item.url])} href="#">
                            {item.url}
                        </a>
                        </li>
                    ))}
                    </ul>
                </div> */}
                </>
            )}
            </>
        )}
        </div>
    );
}

export default ImageToolbar;
