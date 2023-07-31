import React, { useState, useRef, useEffect } from "react";
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
  const imgElement = new Image();
  const canvasRef = useRef(null);
  const [cropping, setCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [selectedFilter, setSelectedFilter] = useState("");

  const updateCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const { naturalWidth: width, naturalHeight: height } = imgElement;
      ctx.canvas.width = width;
      ctx.canvas.height = height;
      ctx.drawImage(imgElement, 0, 0, width, height);
    }
  };

  useEffect(() => {
    if (image) {
      imgElement.onload = updateCanvas;
      imgElement.src = image;
    }
  }, [image]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setSelectedFilter("");
        imgElement.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    if (canvasRef.current && !cropping) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCropArea((prev) => ({ ...prev, x, y, width: 0, height: 0 }));
      setCropping(true);
    }
  };

  const handleMouseMove = (e) => {
    if (cropping) {
      const rect = canvasRef.current.getBoundingClientRect();
      const width = e.clientX - rect.left - cropArea.x;
      const height = e.clientY - rect.top - cropArea.y;
      setCropArea((prev) => ({ ...prev, width, height }));
    }
  };

  const handleMouseUp = () => {
    setCropping(false);
  };

  const handleCrop = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const { x, y, width, height } = cropArea;
      const cropped = ctx.getImageData(x, y, width, height);
      const canvasTemp = document.createElement('canvas');
      const ctxTemp = canvasTemp.getContext('2d');
      canvasTemp.width = width;
      canvasTemp.height = height;
      ctxTemp.putImageData(cropped, 0, 0);
      setImage(canvasTemp.toDataURL());
    }
  };

  const handleAddFilter = () => {
    if (image) {
      //...
    }
  };

  return (
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
            >
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: "100%",
                  height: "auto"
                }}
              />

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
