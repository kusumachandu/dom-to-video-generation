import React, { useState, useRef, useEffect } from "react";
import domtoimage from "dom-to-image";
import { createConcatFile, deleteFile, exportVideo, uploadFile } from "../../services";

interface CardProps {
  iterations: number;
}

const Card: React.FC<CardProps> = ({ iterations }) => {
  const [exporting, setExporting] = useState(false);
  const [exportingVideo, setExportingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  async function captureFullContent(element: any) {
    const options = {
      width: element.offsetWidth,
      height: element.scrollHeight,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        width: `${element.offsetWidth}px`,
        height: `${element.scrollHeight}px`,
      },
    };

    const dataUrl = await domtoimage.toPng(element, options);
    return dataUrl;
  }

  async function captureVideoContent(element: any) {
    const options = {
      width: element.offsetWidth,
      height: element.scrollHeight,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        width: `${element.offsetWidth}px`,
        height: `${element.scrollHeight}px`,
      },
    };

    const dataUrl = await domtoimage.toPng(element, options);
    return dataUrl;
  }

  async function handleExport() {
    setExporting(true);

    if (typeof window === "undefined") return;

    const playgroundRef = document.getElementById("playground");
    if (!playgroundRef) return;

    try {
      const imageURL = await captureFullContent(playgroundRef);

      const downloadLink = document.createElement("a");
      downloadLink.href = imageURL;
      downloadLink.download = "playground_snapshot.png";

      downloadLink.click();
    } catch (error) {
      console.error("Error exporting playground:", error);
    } finally {
      setExporting(false);
    }
  }

  async function handleExportVideo() {
    setExportingVideo(true);

    const playgroundRef = document.getElementById(
      "playground"
    ) as HTMLDivElement;
    if (!playgroundRef) return;

    const sectionHeight = playgroundRef.offsetHeight;
    const totalHeight = playgroundRef.scrollHeight;

    const videoWidth = playgroundRef.offsetWidth;
    const videoHeight = totalHeight;

    const frames = [];

    let scrollTop = 0;

    while (scrollTop < totalHeight) {
      playgroundRef.scrollTop = scrollTop;
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for the scroll animation

      const dataUrl = await captureVideoContent(playgroundRef);
      frames.push(dataUrl);

      scrollTop += sectionHeight / 4; // Scroll 1/4th of the section height for the next frame
    }

    console.log(frames);

    const tempFileNames = [];

    for (let i = 0; i < frames.length; i++) {
      const frameDataUrl = frames[i];
      
      const imageBlob = await fetch(frameDataUrl).then((response) =>
      response.blob()
      );
      console.log(imageBlob);
      const imageFileName = `frame_${i}.png`;
      console.log(imageFileName);
      const formData = new FormData();
      formData.append("file", imageBlob, imageFileName);

      if(formData === undefined) {
        console.log('form data is undefined')
      }

      try {
        const fileName = await uploadFile(formData);
        tempFileNames.push(fileName);
      } catch (error: any) {
        console.log(error.message);
        setExportingVideo(false);
      }
    }

    const concatFileContent = tempFileNames
      .map((fileName) => `file '${fileName}'`)
      .join("\n");
    const formData = new FormData();
    formData.append("concatFileContent", concatFileContent);

    try {
      await createConcatFile(concatFileContent);
      await exportVideo(tempFileNames);
    } catch (error: any) {
      console.log(error.message);
      setExportingVideo(false);
    }


    for (let i = 0; i < tempFileNames.length; i++) {
      await deleteFile(tempFileNames[i]);
    }

    setExportingVideo(false);
  }

  const messages = ["Hello", "Hi", "how are you", "i am good"];
  const colors = ["lightblue", "lightgreen"];
  iterations = Math.floor(Math.random() * 10) + 40; // Random number between 40 and 45

  return (
    <>
      <div className="card" id="playground">
        {[...Array(iterations)].map((_, index) => (
          <div key={index} className="message py-2 rounded">
            <div
              key={index}
              className={`m-auto py-2 rounded px-2 ${
                index % 2 === 0 ? "message-section" : ""
              }`}
              style={{
                backgroundColor: colors[index % 2],
                alignItems: index % 2 === 0 ? "left" : "right",
                width: index % 2 === 0 ? "50%" : "50%",
              }}
            >
              {messages[index % 4]}
            </div>
            <p>why OS</p>
          </div>
        ))}
      </div>
      <button
        className="block p-2 border rounded gap-5 mb-5"
        onClick={handleExport}
        disabled={exporting || exportingVideo}
      >
        {exporting ? "Exporting..." : "Export"}
      </button>
      <div>
        <button
          className="block p-2 border rounded gap-5 mb-5"
          onClick={handleExportVideo}
          // disabled={exporting || exportingVideo}
        >
          {exportingVideo ? "Exporting as Video..." : "Export as Video"}
        </button>
      </div>
      <video ref={videoRef} controls />
    </>
  );
};

export default Card;
