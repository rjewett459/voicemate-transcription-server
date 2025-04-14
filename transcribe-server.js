
// Filename: transcribe-server.js

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const upload = multer();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const audioBuffer = req.file.buffer;

    const transcription = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: 'whisper-1',
      response_format: 'json'
    });

    res.json({ transcript: transcription.text });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

app.listen(3001, () => {
  console.log('VoiceMate Pulse™ transcription backend running on port 3001');
});
