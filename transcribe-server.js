import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';

dotenv.config();

const app = express();
const upload = multer();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Utility function: convert audio file from inputFile to outputFile (MP3)
function convertAudio(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .format('mp3')
      .on('end', () => {
        resolve(outputFile);
      })
      .on('error', (err) => {
        console.error('FFmpeg conversion error:', err);
        reject(err);
      })
      .save(outputFile);
  });
}

// TRANSCRIBE ENDPOINT with server-side audio conversion
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided.' });
    }
    
    // Write the original audio (e.g., WebM) to a temporary file.
    const inputFilePath = path.join(tmpdir(), `${Date.now()}_audio.webm`);
    fs.writeFileSync(inputFilePath, req.file.buffer);
    
    // Define the output file (convert to MP3)
    const outputFilePath = path.join(tmpdir(), `${Date.now()}_audio.mp3`);

    // Convert the file to MP3 (this adds extra latency — usually a few seconds)
    await convertAudio(inputFilePath, outputFilePath);

    // Transcribe using your transcription service (e.g., OpenAI Whisper)
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputFilePath),
      model: 'whisper-1',
      response_format: 'json'
    });

    // Clean up temporary files
    fs.unlinkSync(inputFilePath);
    fs.unlinkSync(outputFilePath);

    res.json({ transcript: transcriptionResponse.text });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

app.listen(3001, () => {
  console.log('✅ VoiceMate transcription server running on port 3001');
});
