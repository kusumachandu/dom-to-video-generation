export async function uploadFile(file: any) {
  try {
    console.log("hello there")
    const response = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: file,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const fileName = await response.text();
    console.log('File uploaded successfully:', fileName);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

export function createConcatFile(concatFileContent: any) {
  return fetch('http://localhost:3001/upload-concat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ concatFileContent }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error creating concat file.');
      }
    })
    .catch((error) => {
      console.error('Error creating concat file:', error);
      throw error;
    });
}

export function exportVideo(tempFileNames: any) {
  const queryParams = new URLSearchParams({ tempFileNames: JSON.stringify(tempFileNames) }).toString();

  return fetch(`http://localhost:3001/export-video?${queryParams}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error exporting video.');
      }
      return response.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.mp4';
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error('Error exporting video:', error);
      throw error;
    });
}

export function deleteFile(fileName: any) {
  const queryParams = new URLSearchParams({ file: fileName }).toString();

  return fetch(`http://localhost:3001/delete?${queryParams}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error deleting file.');
      }
    })
    .catch((error) => {
      console.error('Error deleting file:', error);
      throw error;
    });
}
