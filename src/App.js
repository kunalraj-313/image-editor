import React, { useState, useRef } from "react";
import "./App.css";
import penIcon from "./images/pen.png";
import textIcon from "./images/text.png";
import zoomIcon from "./images/zoom.png";
import cropIcon from "./images/crop.png";
import filterIcon from "./images/filter.png";
import ColorPalette from "./components/ColorPalette";

const ImageCropper = () => {
  const [image, setImage] = useState(null);
  const [tools, setTools] = useState({
    draw: true,
    text: false,
    crop: false,
    zoom: false,
    filters: false,
  });
  const [croppedImage, setCroppedImage] = useState(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [cropping, setCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [selectedFilter, setSelectedFilter] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setCroppedImage(null);
        setSelectedFilter("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    if (imgRef.current && !cropping) {
      const rect = imgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCropArea((prev) => ({ ...prev, x, y, width: 0, height: 0 }));
      setCroppedImage(null);
      setCropping(true);
    }
  };

  const handleMouseMove = (e) => {
    if (cropping) {
      const rect = imgRef.current.getBoundingClientRect();
      const width = e.clientX - rect.left - cropArea.x;
      const height = e.clientY - rect.top - cropArea.y;
      setCropArea((prev) => ({ ...prev, width, height }));
    }
  };

  const handleMouseUp = () => {
    setCropping(false);
  };

  const handleCrop = () => {
    if (imgRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const { x, y, width, height } = cropArea;
      ctx.drawImage(imgRef.current, x, y, width, height, 0, 0, width, height);
      const croppedDataURL = canvasRef.current.toDataURL();
      setCroppedImage(croppedDataURL);
    }
  };

  const handleAddFilter = () => {
    if (croppedImage) {
      let filterStyle = "";
      switch (selectedFilter) {
        case "grayscale":
          filterStyle = "grayscale(100%)";
          break;
        case "sepia":
          filterStyle = "sepia(100%)";
          break;
        // Add more filters here as needed
        default:
          filterStyle = "";
      }
      document.getElementById("cropped-img").style.filter = filterStyle;
    }
  };

  return (
    // <div style={{ display: 'flex', alignItems: 'flex-start' }}>

    //   <div style={{ marginLeft: '20px' }}>
    //     {croppedImage && (
    //       <div>
    //         <h2>Cropped Image</h2>

    //         <div>
    //           <label>
    //             <input
    //               type="radio"
    //               value="grayscale"
    //               checked={selectedFilter === 'grayscale'}
    //               onChange={() => setSelectedFilter('grayscale')}
    //             />
    //             Grayscale
    //           </label>
    //           <label>
    //             <input
    //               type="radio"
    //               value="sepia"
    //               checked={selectedFilter === 'sepia'}
    //               onChange={() => setSelectedFilter('sepia')}
    //             />
    //             Sepia
    //           </label>
    //           {/* Add more filter options here */}
    //         </div>
    //         <button onClick={handleAddFilter}>Add Filter</button>
    //       </div>
    //     )}
    //   </div>
    //   <canvas ref={canvasRef} style={{ display: 'none' }} />
    // </div>
    <div className="editor-bg">
      <div className="toolbar-container">
        <div className="toolbar">
          <div className="tool">
            <img className="tool-icon" src={penIcon} />
          </div>
          <div className="tool">
            <img className="tool-icon" src={textIcon} />
          </div>
          <div className="tool">
            <img className="tool-icon" src={zoomIcon} />
          </div>
          <div className="tool">
            <img className="tool-icon" src={cropIcon} />
          </div>
          <div className="tool">
            <img className="tool-icon" src={filterIcon} />
          </div>
        </div>
      </div>
      <div className="image-edit-area">
        {!image && (
          <div className="upload-dialog">
            <span>Upload an Image to get started</span>
            <label className="custom-file-input">
              <span>Choose File</span>
              <input type="file" onChange={handleFileChange} />
            </label>
          </div>
        )}

        {image && (
          <div>
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ position: "relative", display: "inline-block" }}
            >{
              !croppedImage && (
                <img
                ref={imgRef}
                src={image}
                className=""
                alt="Original"
                draggable="false"
                style={{ maxWidth: "100%", height: "auto" }}
              />
              )
            }

              {
                croppedImage && (
                  <img
                  id="cropped-img"
                  src={croppedImage}
                  alt="Cropped"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />

                )
  
              }

              {cropping && (
                <div
                className="cropper-box"
                  style={{
                    border: "1px dashed red",
                    position: "absolute",
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height,
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
            <button onClick={handleCrop}>Crop Image</button>
          </div>
        )}
      </div>
      <div className="sidepanel">
        {(tools.draw || tools.text) && <ColorPalette />}
      </div>
    </div>
  );
};

export default ImageCropper;
