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
  const [color, setColor] = useState("#0000");
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
  const [textAreaList, handleTextArea] = useState([]);
  const [undoList, handleActions] = useState([]);
  const [textArea, setTextArea] = useState({
    x: null,
    y: null,
    startingX: null,
  });
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [selectedFilter, setSelectedFilter] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });

  // const updateCanvas = () => {
  //   if (canvasRef.current) {
  //     const ctx = canvasRef.current.getContext("2d");
  //     const { naturalWidth: width, naturalHeight: height } = imgElement;
  //     ctx.canvas.width = width;
  //     ctx.canvas.height = height;
  //     ctx.drawImage(imgElement, 0, 0, width, height);
  //   }
  // };

  const updateCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const { naturalWidth: imgWidth, naturalHeight: imgHeight } = imgElement;
      const parentDiv = canvas.closest(".image-edit-area");
      const maxWidth = parentDiv.clientWidth;
      const maxHeight = parentDiv.clientHeight;

      // calculate the aspect ratio of the image
      const aspectRatio = imgWidth / imgHeight;

      // calculate the new dimensions to fit within the parent div
      let newWidth = maxWidth;
      let newHeight = maxWidth / aspectRatio;

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = maxHeight * aspectRatio;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.drawImage(imgElement, 0, 0, newWidth, newHeight);
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

  // const handleUndoRedo = () => {

  //   let count = undolist.length - 1;

  //   if (count < undolist.length - 1) {

  //     if (ctrl + z) {
  //       count--;
  //       canvas = undolist[count]
  //     } else if (ctrl + y) {
  //       count++;
  //       canvas = undolist[count]
  //     }
  //   }
  // }

  const handleMouseDown = (e) => {
    if (canvasRef.current) {
      var test = canvasRef.current.toDataURL();
      console.log(test);

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (tools.draw) {
        // Start drawing
        setDrawStart({ x, y });
        setDrawing(true);
      }
      // Start cropping
      else if (tools.crop && !cropping) {
        setCropArea((prev) => ({ ...prev, x, y, width: 0, height: 0 }));
        setCropping(true);
      }
      // start adding text
      else if (tools.text) {
        setTextArea({
          x: e.pageX - canvasRef.current.offsetLeft,
          y: e.pageY - canvasRef.current.offsetTop,
          startingX: x,
        });
        const ctx = canvasRef.current.getContext("2d");
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        document.addEventListener(
          "keydown",
          (e) => {
            ctx.fillText(e.key, textArea.x, textArea.y);
            setTextArea((prev) => ({
              ...prev, // Keep the previous values for y and startingX
              x: prev.x + ctx.measureText(e.key).width, // Update the x value
            }));
          },
          false
        );
      }
    }
  };

  const handleMouseMove = (e) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (drawing && tools.draw) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(drawStart.x, drawStart.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        setDrawStart({ x, y });
      } else if (tools.crop && cropping) {
        const width = x - cropArea.x;
        const height = y - cropArea.y;
        setCropArea((prev) => ({ ...prev, width, height }));
      }
    }
  };

  const handleMouseUp = () => {
    if (drawing) {
      setDrawing(false);
    } else {
      setCropping(false);
    }
  };

  const handleCrop = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const { x, y, width, height } = cropArea;
      const cropped = ctx.getImageData(x, y, width, height);
      const canvasTemp = document.createElement("canvas");
      const ctxTemp = canvasTemp.getContext("2d");
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

  const handleSelectedColor = (val) => {
    setColor(val);
  };
  return (
    <div className="editor-bg">
      <div className="toolbar-container">
        <div className="toolbar">
          <div
            className={`tool ${tools.draw ? "active-tool" : ""}`}
            onClick={() =>
              setTools({
                draw: true,
                text: false,
                crop: false,
                zoom: false,
                filters: false,
              })
            }
          >
            <img className="tool-icon" src={penIcon} />
          </div>
          <div
            className={`tool ${tools.text ? "active-tool" : ""}`}
            onClick={() =>
              setTools({
                draw: false,
                text: true,
                crop: false,
                zoom: false,
                filters: false,
              })
            }
          >
            <img className="tool-icon" src={textIcon} />
          </div>
          <div
            className="tool"
            onClick={() =>
              setTools({
                draw: false,
                text: false,
                crop: false,
                zoom: true,
                filters: false,
              })
            }
          >
            <img className="tool-icon" src={zoomIcon} />
          </div>
          <div
            className={`tool ${tools.crop ? "active-tool" : ""}`}
            onClick={() =>
              setTools({
                draw: false,
                text: false,
                crop: true,
                zoom: false,
                filters: false,
              })
            }
          >
            <img className="tool-icon" src={cropIcon} />
          </div>
          <div
            className="tool"
            onClick={() =>
              setTools({
                draw: false,
                text: false,
                crop: false,
                zoom: false,
                filters: true,
              })
            }
          >
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
                  height: "auto",
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
        {(tools.draw || tools.text) && (
          <ColorPalette colorSelector={handleSelectedColor} />
        )}
      </div>
    </div>
  );
};

export default ImageCropper;
