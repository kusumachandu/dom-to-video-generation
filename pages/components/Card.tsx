import React, { useEffect, useState, useRef } from "react";
import domtoimage from "dom-to-image";

interface CardProps {
  iterations: number;
}

const array = [
  {
    name: "hello, i am chandu",
  },
  {
    name: "hello, i am jafin",
  },
];

const Card: React.FC<CardProps> = ({ iterations }) => {
  const [exporting, setExporting] = useState(false);
  const [videoExporting, setVideoExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [windowHeight, setWindowHeight] = useState<number>();
  const [windowWidth, setWindowWidth] = useState<number>();

  useEffect(() => {
    if (globalThis?.window?.innerWidth) {
      setWindowWidth(window.innerWidth);
    }

    if (globalThis?.window?.innerHeight) {
      setWindowHeight(window.innerHeight);
    }
  }, []);

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

  async function captureVideoContent(element: any, screenHeight: any) {
    const scaleFactor = 1; // Adjust the scale factor as needed for higher resolution
    const options = {
      width: element.offsetWidth,
      height: element.scrollHeight,
      style: {
        transform: `scale(${scaleFactor})`,
        transformOrigin: "top left",
        width: `${element.offsetWidth! * scaleFactor}px`,
        height: `${element.scrollHeight * scaleFactor}px`,
        position: "absolute",
        top: "0",
        left: "0",
        overflow: "hidden",
        border: "1px solid green",
      },
    };

    console.log("options", options);
    const dataUrl = await domtoimage.toPng(element, options);
    console.log(dataUrl);
    return dataUrl;
  }

  async function handleExport() {
    setExporting(true);

    if (typeof window === "undefined") return <></>;

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

  async function handleVideoExport() {
    setVideoExporting(true);

    if (typeof window === "undefined") return;

    const playgroundRef = document.getElementById("playground");
    if (!playgroundRef) return;

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      const fps = 30; // Adjust the frames per second as needed
      const stream = canvas!.captureStream(fps);
      if (!stream) throw new Error("Failed to capture stream from canvas");

      const videoBitsPerSecond = 5000000;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp9",
        videoBitsPerSecond,
      });

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const videoURL = URL.createObjectURL(blob);
        video!.src = videoURL;

        const downloadLink = document.createElement("a");
        downloadLink.href = video!.src;
        downloadLink.download = "playground_video.webm";

        downloadLink.click();

        setVideoExporting(false);
      };

      mediaRecorder.start();

      const duration = 3000; // Duration to record each frame (1 second)
      const contentHeight = playgroundRef.scrollHeight;
      const contentWidth = playgroundRef.scrollWidth;
      const screenHeight = windowHeight!;
      console.log("content height:", contentHeight);
      console.log("screen height:", screenHeight);

    //   const scrollStep = Math.ceil(screenHeight / 20); // Number of pixels to scroll in each step
      let scrollPosition = 0;

      while (scrollPosition  < contentHeight) {
        playgroundRef.scrollTo({ top: scrollPosition });

        console.log(scrollPosition);
        const imageURL = await captureVideoContent(playgroundRef, screenHeight);

        const image = new Image();
        image.src = imageURL;

        image.onload = () => {
          const context = canvas!.getContext("2d");
          console.log(context)
          context?.clearRect(0, 0, canvas!.width, canvas!.height);
          context?.drawImage(image, 0, -scrollPosition + screenHeight, contentWidth, contentHeight);

          if (mediaRecorder.state === "recording") {
            mediaRecorder.requestData();
          }
        };

        scrollPosition += screenHeight;
        await new Promise((resolve) => setTimeout(resolve, duration));
      }

      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    } catch (error) {
      setVideoExporting(false);
      console.error("Error exporting video:", error);
    }
  }
  

  const messages = ["Hello", "Hi", "how are you", "i am good"];
  const colors = ["lightblue", "lightgreen"];
  iterations = 70;

  return (
    <div id="playgrounds">
      <div className="card" id="playground">
        {[...Array(iterations), ...array].map((_, index) => (
          <div key={index} className="message py-2 rounded">
            <div
              key={index}
              className={`m-auto py-2 rounded px-2 ${
                index % 2 === 0 ? "message-section" : ""
              }`}
              style={{
                backgroundColor:
                  index < 30
                    ? index == 0
                      ? "blue"
                      : colors[index % 2]
                    : index < 50 ? "yellow"
                    : "red",
                alignItems: index % 2 === 0 ? "left" : "right",
                width: index % 2 === 0 ? "50%" : "50%",
              }}
            >
              {messages[index % 4]}
            </div>
          </div>
        ))}
      </div>
      <button
        className="block p-2 border rounded gap-5 mb-5"
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? "Exporting.." : "Export"}
      </button>
      <div>
          <button
            className="block p-2 border rounded"
            onClick={handleVideoExport}
          >
            {videoExporting ? "Exporting video.." : "Export as video"}
          </button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width={windowWidth}
        height={windowHeight}
      />
      <div className="video-container relative">
        <video
          className="scroll-video absolute top-0 left-0"
          ref={videoRef}
          style={{ display: "none" }}
          width={windowWidth}
          height={windowHeight}
        />
      </div>
    </div>
  );
};

export default Card;
