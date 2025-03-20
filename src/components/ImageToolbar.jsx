import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fabric } from 'fabric';
// import { getFileFromS3 } from '../utils/S3Utils'; // Import the utility function

function ImageToolbar({ canvasRef }) {
    const [source, setSource] = useState('Local');
    const [imageList, setImageList] = useState([]);
    const [selectedImage, setSelectedImage] = useState([]);
    const [imgSize, setImgSize] = useState(100);
    const [imgParameter, setImgParameters] = useState('');
    const [query, setQuery] = useState('');
    const [queryImgResult, setQueryImgResult] = useState([]);
    const [error, setError] = useState('');
    const [imgKey, setImgKey] = useState([]);
    const [xCoor, setXCoor] = useState(0);
    const [yCoor, setYCoor] = useState(0);
    const [ipr, setIpr] = useState(1);

    function preloadImages(urls) {
        const images = [];
        let loadedCount = 0;
    
        return new Promise((resolve, reject) => {
            urls.forEach((url, index) => {
                const img = new Image();
                img.onload = () => {
                    images[index] = img;
                    loadedCount++;
                    if (loadedCount === urls.length) {
                        resolve(images);
                    }
                };
                img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
                img.src = url;
            });
        });
    }
    
    const addImageToCanvas = async () => {
        let tempImg = [];
        let tempTitle = [];
        let tempSubTitle = [];
        
        queryImgResult.forEach(element => {
            if (typeof element === 'object' && element !== null) {
                Object.entries(element).forEach(([key, value]) => {
                    if (key.startsWith('ATTACHMENT')) {
                        tempImg.push(value);
                    } else if (key.startsWith('TITLE')) {
                        tempTitle.push(value);
                    } else if (key.startsWith('SUBTITLE')) {
                        tempSubTitle.push(value);
                    }
                });
            }
        });
        
        console.log('tempImg:', tempImg);
        console.log('tempTitle:', tempTitle);
        console.log('tempSubTitle:', tempSubTitle);
        
        const canvas = canvasRef.current.getCanvas();
    
        // Preload images synchronously
        try {
            const getImages = await axios.post('http://localhost:3000/api/get-s3-img', {
                key: tempImg,
                bucket: "cboss-snt"
            });
            const images = await preloadImages(getImages.data.fileUrl);
            console.log('img : ', images)
            // const images = getImages.data.fileUrl;
            const isz = parseInt(imgSize);
            let imgPerRow = ipr;
            let rowHeight = 0;
            let addedY = 0;
    
            images.forEach((img, index) => {
                const row = Math.floor(index / imgPerRow);
                const col = index % imgPerRow;
                const xCr = xCoor + (col * (isz + 10));
                const yCr = yCoor + addedY;
                
                console.log(`Processing image ${index}: xCr=${xCr}, yCr=${yCr}`);
                
                let titleHeight = 0;
                if (tempTitle.length > 0 && tempTitle[index]) {
                    let title = new fabric.Textbox(String(tempTitle[index]), {
                        left: xCr,
                        top: yCr,
                        fontSize: 12,
                        editable: true,
                        width: isz,
                        textAlign: 'center'
                    });
                    canvas.add(title);
                    titleHeight = title.getScaledHeight();
                    console.log(`Title height for image ${index}: ${titleHeight}`);
                }
    
                let fabricImg = new fabric.Image(img, {
                    left: xCr,
                    top: yCr + titleHeight + 5,
                });
                fabricImg.scaleToWidth(isz);
                canvas.add(fabricImg);
                
                const newHeight = fabricImg.getScaledHeight();
                rowHeight = Math.max(rowHeight, newHeight);
                console.log(`Row height after image ${index}: ${rowHeight}`);
                
                let subtitleHeight = 0;
                if (tempSubTitle.length > 0 && tempSubTitle[index]) {
                    let subtitle = new fabric.Textbox(String(tempSubTitle[index]), {
                        left: xCr,
                        top: yCr + newHeight + titleHeight + 5,
                        fontSize: 12,
                        editable: true,
                        width: isz,
                        textAlign: 'center'
                    });
                    canvas.add(subtitle);
                    subtitleHeight = subtitle.getScaledHeight();
                    console.log(`Subtitle height for image ${index}: ${subtitleHeight}`);
                }
                
                if ((index + 1) % imgPerRow === 0 || index === images.length - 1) {
                    addedY += rowHeight + titleHeight + subtitleHeight + 10;
                    rowHeight = 0;
                }
                
                console.log(`Processed Image ${index}:`, {
                    xCr, yCr, titleHeight, newHeight, subtitleHeight, addedY
                });
            });
    
            canvas.renderAll();
        } catch (error) {
            console.error("Error preloading images:", error);
        }
    }
    

    const addSingleImageToCanvas = async (refer) => {
        const canvas = canvasRef.current.getCanvas();
        fabric.Image.fromURL(refer, (img) => {
            img.scaleToWidth(parseInt(imgSize));
            const setImg = img.set({
                left : yCoor,
                top : xCoor,
                // width : 100,
                // scaleToWidth:50,
                // lockScalingX: true,
                // lockScalingY: true,
            })
            canvas.add(setImg);
        });
        canvas.renderAll();
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
        console.log(result)
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
        <div className="row mb-1">
            <div className="col">
                <div className="form-group">
                    <label>Size:</label>
                    <input
                    type="number"
                    className="form-control"
                    value={imgSize}
                    onChange={(e) => {
                        setImgSize(e.target.value);
                    }}
                    />
                </div>
            </div>
            <div className="col">
                <div className="form-group">
                    <label>Img/row:</label>
                    <input
                    type="number"
                    className="form-control"
                    value={ipr}
                    onChange={(e) => {
                        setIpr(e.target.value);
                    }}
                    />
                </div>
            </div>
            <div className="col">
                <div className="form-group">
                    <label>X-Coor:</label>
                    <input
                    type="number"
                    className="form-control"
                    value={xCoor}
                    onChange={(e) => {
                        setXCoor(e.target.value);
                    }}
                    />
                </div>
            </div>
            <div className="col">
                <div className="form-group">
                    <label>Y-Coor:</label>
                    <input
                    type="number"
                    className="form-control"
                    value={yCoor}
                    onChange={(e) => {
                        setYCoor(e.target.value);
                    }}
                    />
                </div>
            </div>
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
                <div className="row">
                    <div className="col">
                        <div class="form-check">
                            <input type="radio" class="form-check-input" id="radio1" name="optradio" value="option1" />Option 1
                            <label class="form-check-label" for="radio1"></label>
                        </div>
                        <div class="form-check">
                            <input type="radio" class="form-check-input" id="radio2" name="optradio" value="option2" />Option 2
                            <label class="form-check-label" for="radio2"></label>
                        </div>
                        <div class="form-check">
                            <input type="radio" class="form-check-input" name="optradio" />Option 3
                            <label class="form-check-label"></label>
                        </div>
                    </div>
                    <div className="col">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="check1" name="option1" value="something"/>
                            <label class="form-check-label" for="check1">Option 1</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="check2" name="option2" value="something" />
                            <label class="form-check-label" for="check2">Option 2</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" />
                            <label class="form-check-label">Option 3</label>
                        </div>
                    </div>
                </div>
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
                <small style={{ color:'red' }}>*if there are multiple image, don't forget to rename it in query (use uppercase) (ex. ATTACHMENT_1, etc)</small>
                <br/>
                <small style={{ color:'red' }}>*if needed dynamic title and substile don't forget to rename it in query (use uppercase) (ex. TITLE_1, SUBTITLE_1, etc)</small>
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
