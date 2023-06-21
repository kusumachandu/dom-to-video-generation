const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { createFFmpeg } = require('@ffmpeg/ffmpeg');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(fileUpload());
app.use(express.json());
app.use(cors());

const ffmpeg = createFFmpeg({ log: true, corePath: '/node_modules/@ffmpeg/core/dist/wasm-core.js' });
const uploadsDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(express.static('public'));

app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.file;
  const filePath = `${uploadsDir}/${file.name}`;

  file.mv(filePath, (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).send('Error uploading file.');
    }

    res.send(file.name);
  });
});

app.post('/upload-concat', (req, res) => {
  const concatFilePath = path.join(uploadsDir, 'concat-txt');
  const concatFileContent = req.body.concatFileContent;
  console.log(concatFileContent);

  fs.writeFile(concatFilePath, concatFileContent, (err) => {
    if (err) {
      console.error('Error writing concat file:', err);
      res.status(500).send('Error writing concat file');
    } else {
      console.log('Concat file created:', concatFilePath);
      res.status(200).send('Concat file created successfully');
    }
  });
});


app.get('/export-video', async (req, res) => {
  try {
    const tempFileNames = JSON.parse(req.query.tempFileNames);
    console.log(tempFileNames);

    // Load the concat file
    const concatFilePath = path.join(uploadsDir, 'concat.txt');
    const concatFileContent = tempFileNames.map((fileName) => `file '${uploadsDir}/${fileName}'`).join('\n');
    fs.writeFileSync(concatFilePath, concatFileContent);

    await ffmpeg.load();

    // Run the ffmpeg command to concatenate frames into a video
    await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', concatFilePath, '-c', 'copy', `${uploadsDir}/output.mp4`);

    console.log('output.mp4');
    res.download(`${uploadsDir}/output.mp4`, 'output.mp4', (err) => {
      if (err) {
        console.error('Error downloading video:', err);
        return res.status(500).send('Error downloading video.');
      }

      // Clean up the temporary files
      for (const fileName of tempFileNames) {
        const filePath = path.join(uploadsDir, fileName);
        fs.unlinkSync(filePath);
      }

      fs.unlinkSync(concatFilePath);
      fs.unlinkSync(`${uploadsDir}/output.mp4`);
    });
    res.send('output.mp4');
  } catch (error) {
    console.error('Error exporting video:', error);
    res.status(500).send('Error exporting video.');
  }
});

app.delete('/delete', (req, res) => {
  const fileName = req.query.file;
  const filePath = `${uploadsDir}/${fileName}`;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).send('Error deleting file.');
    }

    res.send('File deleted successfully.');
  });
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
