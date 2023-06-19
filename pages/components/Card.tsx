import React, { useEffect, useState, useRef } from "react";
import domtoimage from "dom-to-image";
import { content } from "html2canvas/dist/types/css/property-descriptors/content";

interface CardProps {
  iterations: number;
}

const Card: React.FC<CardProps> = ({ iterations }) => {
  const [exporting, setExporting] = useState(false);
  const [videoExporting, setVideoExporting] = useState(false);
  const [videoDownloaded, setVideoDownloaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    const scaleFactor = 4; // Adjust the scale factor as needed for higher resolution
    const options = {
      width: 1080 * scaleFactor,
      height: 1920 * scaleFactor,
      style: {
        transform: `scale(${scaleFactor})`,
        transformOrigin: "top left",
        width: `${element.offsetWidth * scaleFactor}px`,
        height: `${element.scrollHeight * scaleFactor}px`,
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

  // video generation function
  // async function handleVideoExport() {
  //   setVideoExporting(true);

  //   if (typeof window === "undefined") return;

  //   const playgroundRef = document.getElementById("playground");
  //   if (!playgroundRef) return;

  //   try {
  //     const canvas = canvasRef.current;
  //     const video = videoRef.current;

  //     const stream = canvas!.captureStream();
  //     if (!stream) throw new Error("Failed to capture stream from canvas");

  //     const fps = 30; // Adjust the frames per second as needed
  //     const videoBitsPerSecond = 5000000; 
  //   const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9", videoBitsPerSecond})

  //     // const mediaRecorder = new MediaRecorder(stream);
  //     console.log(mediaRecorder);
  //     const chunks: BlobPart[] = [];

  //     mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  //     mediaRecorder.onstop = () => {
  //       const blob = new Blob(chunks, { type: "video/webm" });
  //       const videoURL = URL.createObjectURL(blob);

  //       const downloadLink = document.createElement("a");
  //       downloadLink.href = videoURL;
  //       downloadLink.download = "playground_video.webm";

  //       downloadLink.click();

  //       setVideoDownloaded(true);
  //       setVideoExporting(false);
  //     };

  //     mediaRecorder.start();

  //     const duration = 500; // Duration to record each section (1 second)
  //   const sectionCount = 6; // Number of sections to divide the conversation
  //   const totalMessages = iterations; // Total number of messages
  //   const messagesPerSection = Math.ceil(totalMessages / sectionCount);
  //   // Set initial scrollTop position to the top of the content
  //   playgroundRef.scrollTop = 0;

  //   for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
  //     const startIndex = sectionIndex * messagesPerSection;
  //     const endIndex = Math.min(
  //       (sectionIndex + 1) * messagesPerSection,
  //       totalMessages
  //     );

    
  //     for (let i = startIndex; i < endIndex; i++) {

  //       playgroundRef.scrollTop += 10; 
  //       const imageURL = await captureVideoContent(playgroundRef);

  //       const image = new Image();
  //       image.src = imageURL;

  //       image.onload = () => {
  //         const context = canvas!.getContext("2d");

  //         context?.clearRect(0, 0, canvas!.width, canvas!.height);
  //         context?.drawImage(image, 0, 0, canvas!.width, canvas!.height);

  //         console.log(mediaRecorder.requestData);

  //         setTimeout(() => {
  //           if (mediaRecorder.state === "recording") {
  //             mediaRecorder.requestData();
  //           }

  //           // Check if this is the last message
  //           if (i === endIndex - 1 && mediaRecorder.state === "recording") {
  //             mediaRecorder.stop();
  //           }
  //         }, duration);
  //       };

  //       await new Promise((resolve) => setTimeout(resolve, duration));
  //     }
  //   }
  //   // if(mediaRecorder.state === 'recording') {
  //   //   mediaRecorder.stop();
  //   // }

  //   } catch (error) {
  //     setVideoExporting(false);
  //     console.error("Error exporting video:", error);
  //   }
  // }

  async function handleVideoExport() {
    setVideoExporting(true);
  
    if (typeof window === "undefined") return;
  
    const playgroundRef = document.getElementById("playground");
    if (!playgroundRef) return;
  
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
  
      const stream = canvas!.captureStream();
      if (!stream) throw new Error("Failed to capture stream from canvas");
  
      const fps = 30; // Adjust the frames per second as needed
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
  
        const downloadLink = document.createElement("a");
        downloadLink.href = videoURL;
        downloadLink.download = "playground_video.webm";
  
        downloadLink.click();
  
        setVideoDownloaded(true);
        setVideoExporting(false);
      };
  
      mediaRecorder.start();
  
      const duration = 1000; // Duration to record each section (1 second)
      const sectionCount = 6; // Number of sections to divide the conversation
      const totalMessages = iterations; // Total number of messages
      const messagesPerSection = Math.ceil(totalMessages / sectionCount);
  
      // Calculate the total height of the content
      const contentHeight = playgroundRef.scrollHeight;

      console.log(contentHeight);
  
      // Set initial scrollTop position to the top of the content
      playgroundRef.scrollTop = 0;
  
      for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
        const startIndex = sectionIndex * messagesPerSection;
        const endIndex = Math.min(
          (sectionIndex + 1) * messagesPerSection,
          totalMessages
        );
  
        // Scroll to the next section gradually while capturing frames
        for (let i = startIndex; i < endIndex; i++) {
          // Calculate the scroll position based on the current message index
          const scrollPosition = contentHeight * (i / totalMessages);
          console.log(scrollPosition);

        // Scroll to the calculated position
        playgroundRef.scrollTo({ top: scrollPosition, behavior: "smooth" });
  
          // Capture the current frame
          const imageURL = await captureVideoContent(playgroundRef);
  
          const image = new Image();
          image.src = imageURL;
  
          image.onload = () => {
            const context = canvas!.getContext("2d");
            console.log(context)
  
            context?.clearRect(0, 0, canvas!.width, canvas!.height);
            context?.drawImage(image, 0, 0, canvas!.width, canvas!.height);
  
            // setTimeout(() => {
              if (mediaRecorder.state === "recording") {
                console.log(mediaRecorder.requestData);
                mediaRecorder.requestData();
              }
  
              // Check if this is the last message
              // if (i === endIndex - 1 && mediaRecorder.state === "recording") {
              //   mediaRecorder.stop();
              // }
            // }, duration);
          };
  
          await new Promise((resolve) => setTimeout(resolve, duration));
        }
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
  iterations = Math.floor(Math.random() * 10) + 40; // Random number between 40 and 45

  return (
    <div id="playgrounds">
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
        disabled={exporting}
      >
        {exporting ? "Exporting.." : "Export"}
      </button>
      <div>
        {!videoDownloaded && (
          <button
            className="block p-2 border rounded"
            onClick={handleVideoExport}
            disabled={videoExporting}
          >
            {videoExporting ? "Exporting video.." : "Export as video"}
          </button>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: "none"}} width={1080*4} height={900 * 5} />
      <video ref={videoRef} style={{ display: "none" }} />
    </div>
  );
};

export default Card;
