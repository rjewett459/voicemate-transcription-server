// transcribe-server.js

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const upload = multer();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const audioBuffer = req.file.buffer;

    // Save to temporary file
    const tempFilePath = path.join(tmpdir(), `${Date.now()}_audio.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Transcribe via Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
      response_format: 'json'
    });

    // Cleanup
    fs.unlinkSync(tempFilePath);

    res.json({ transcript: transcription.text });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

app.listen(3001, () => {
  console.log('✅ VoiceMate transcription server running on port 3001');
});
