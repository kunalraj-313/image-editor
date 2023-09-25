import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import penIcon from "./images/pen.png";
import textIcon from "./images/text.png";
import zoomIcon from "./images/zoom.png";
import cropIcon from "./images/crop.png";
import filterIcon from "./images/filter.png";
import saveIcon from "./images/save.png";
import ColorPalette from "./components/ColorPalette";

const ImageCropper = () => {
  const filterList = [
    { filterName: "None", filter: "none" },
    { filterName: "Grayscale", filter: "grayscale(100%)" },
    { filterName: "Blur", filter: "blur(5px)" },
    { filterName: "Brightness", filter: "brightness(150%)" },
    { filterName: "Contrast", filter: "contrast(150%)" },
    { filterName: "Sepia", filter: "sepia(100%)" },
    { filterName: "Invert", filter: "invert(100%)" },
    { filterName: "Hue Rotate", filter: "hue-rotate(90deg)" },
    { filterName: "Saturate", filter: "saturate(200%)" },
    { filterName: "Opacity", filter: "opacity(50%)" },
  ];

  const STACK_SIZE = 5;
  const actionCount = useRef(0);
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
  const actionsRef = useRef([]);
  const redoRef = useRef([]);
  const [textArea, setTextArea] = useState({
    x: null,
    y: null,
  });
  const [text, setText] = useState("");
  const [isTyping, toggleTyping] = useState(false);

  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [selectedFilter, setSelectedFilter] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log("Component Re-rendered");
    if (image) {
      imgElement.onload = updateCanvas;
      imgElement.src = image;
    }
  }, [image]);

  useEffect(() => {
    document.addEventListener("keydown", function (event) {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "z") {
          handleUndoRedo("undo");
          console.log("UNDO");
        } else if (event.key === "y") {
          handleUndoRedo("redo");
          console.log("REDO");
        }
      }
    });
  }, []);

  const drawCanvas = (val) => {
    let canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    let img = new Image();
    img.src = val;
    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  async function addAction(action) {
    if (actionsRef.current.length < STACK_SIZE) {
      await new Promise((resolve) => {
        actionsRef.current.push(action);
        resolve();
      });
    } else {
      await new Promise((resolve) => {
        actionsRef.current.shift();
        actionsRef.current.push(action);
        resolve();
      });
    }
  }

  async function undo() {
    if (actionsRef.current.length > 0) {
      await new Promise((resolve) => {
        actionsRef.current.pop();
        resolve();
      });
      if (redoRef.current.length < STACK_SIZE) {
        debugger;
        await new Promise((resolve) => {
          redoRef.current.push(
            actionsRef.current[actionsRef.current.length - 1]
          );
          resolve();
        });
      } else {
        await new Promise((resolve) => {
          redoRef.current.shift();
          redoRef.current.push(
            actionsRef.current[actionsRef.current.length - 1]
          );
          resolve();
        });
      }
      drawCanvas(actionsRef.current[actionsRef.current.length - 1]);
    } else if (actionsRef.current.length == 0) {
      await new Promise((resolve) => {
        actionsRef.current.pop();
        resolve();
      });
      drawCanvas(imgElement);
    } else {
      alert("Undo limit reached");
    }
  }

  async function redo() {
    if (redoRef.current.length > 0) {
      debugger;
      await new Promise((resolve) => {
        actionsRef.current.push(redoRef.current[redoRef.current.length - 1]);
        redoRef.current.pop();
        console.log(redoRef.current);

        resolve();
      });
      drawCanvas(actionsRef.current[actionsRef.current.length - 1]);
    } else {
      alert("Redo limit reached");
    }
  }

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

  const canvasStateChange = () => {
    const canvas = canvasRef.current;
    let lastAction = canvas.toDataURL();
    addAction(lastAction);
  };

  const handleUndoRedo = (action) => {
    let canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    const img = new Image();
    if (action === "undo") {
      undo();
    } else if (action === "redo") {
      redo();
    }
    // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

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
    if (canvasRef.current) {
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
    }
  };

  const handleCanvasClick = (e) => {
    if (tools.text) {
      toggleTyping(true);
      const rect = canvasRef.current.getBoundingClientRect();
      let xPos = e.clientX - rect.left;
      let yPos = e.clientY - rect.top;
      setTextArea({ x: xPos, y: yPos });
    }
  };

  const handleTextSubmit = (e) => {
    if (e.key === "Escape" || e.key === "Enter") {
      console.log(e);
      let temp = text;
      const ctx = canvasRef.current.getContext("2d");
      ctx.font = "16px Arial";
      ctx.fillStyle = color;
      ctx.fillText(temp, textArea.x, textArea.y);
      canvasStateChange();
      toggleTyping(false);
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
      canvasStateChange();
    } else if (tools.crop) {
      setCropping(false);
      handleCrop();
      canvasStateChange();
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

  const applyFilter = (filter, event) => {
    event.stopPropagation();
    canvasRef.current.style.filter = filter;
    setSelectedFilter(filter);
    console.log("filter clicked");
  };

  const saveFilter = () => {
    let canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = function () {
      console.log(selectedFilter);
      ctx.filter = selectedFilter;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      console.log(img.src);
      const link = document.createElement("a");
      link.href = canvas.toDataURL(); // This will include the filtered image
      link.download = "filtered_image.png";
      link.click();
    };
  };

  const handleSelectedColor = (val) => {
    setColor(val);
  };

  const fileSave = () => {
    saveFilter();
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
        {image && (
          <div className="save-btn" onClick={fileSave}>
            <img src={saveIcon} />
          </div>
        )}
        {!image && (
          <div className="upload-dialog">
            <span>Upload an Image to get started</span>
            <label className="custom-file-input">
              <span>Choose File</span>
              <input type="file" onChange={handleFileChange} />
            </label>
          </div>
        )}
        {isTyping && (
          <div className="input-dialog">
            <span>Enter the text to be inserted in the Image</span>
            <label className="custom-text-input">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => handleTextSubmit(e)}
              />
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
                onClick={handleCanvasClick}
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
          </div>
        )}
      </div>
      <div className="sidepanel">
        {(tools.draw || tools.text) && (
          <ColorPalette colorSelector={handleSelectedColor} />
        )}
        {tools.filters && (
          <div className="filters-container">
            {filterList.map((f) => {
              return (
                <div
                  onClick={(e) => applyFilter(f.filter, e)}
                  className="filter-selector"
                >
                  <img
                    width="100%"
                    src={image}
                    style={{ filter: f.filter }}
                    alt="thumbnail"
                  />
                  <span>{f.filterName}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCropper;
