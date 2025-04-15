// Puls.js
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

import createPulseRouter from './api/create-pulse.js';

dotenv.config();

const app = express();
const upload = multer();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// TRANSCRIBE ENDPOINT
// Expects audio as form-data under the field "audio"
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided.' });
    }
    const audioBuffer = req.file.buffer;
    // Save the audio to a temporary file
    const tempFilePath = path.join(tmpdir(), `${Date.now()}_audio.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Call OpenAI Whisper for transcription.
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
      response_format: 'json'
    });

    // Clean up temporary file.
    fs.unlinkSync(tempFilePath);
    res.json({ transcript: transcriptionResponse.text });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// Mount the create-pulse router on the /api path.
app.use('/api', createPulseRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ VoiceMate transcription server running on port ${PORT}`);
});
