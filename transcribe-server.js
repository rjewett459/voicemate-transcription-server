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
app.use(express.json({ limit: '1mb' }));

// TRANSCRIBE ENDPOINT
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const audioBuffer = req.file.buffer;
    const tempFilePath = path.join(tmpdir(), `${Date.now()}_audio.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
      response_format: 'json'
    });

    fs.unlinkSync(tempFilePath);
    res.json({ transcript: transcription.text });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// CREATE PULSE ENDPOINT
app.post('/api/create-pulse', async (req, res) => {
  const { pulseName, htmlContent } = req.body;

  if (!pulseName || !htmlContent) {
    return res.status(400).json({ error: 'Missing pulseName or htmlContent' });
  }

  try {
    const pulseDir = path.join(__dirname, 'public', 'pulses');
    const filePath = path.join(pulseDir, `${pulseName}.html`);

    if (!fs.existsSync(pulseDir)) {
      fs.mkdirSync(pulseDir, { recursive: true });
    }

    fs.writeFileSync(filePath, htmlContent, 'utf8');

    const pulseUrl = `https://myvoicemate.com/pulses/${encodeURIComponent(pulseName)}.html`;
    res.json({ success: true, url: pulseUrl });
  } catch (err) {
    console.error('Failed to create pulse:', err);
    res.status(500).json({ error: 'Server error creating Pulse' });
  }
});

app.listen(3001, () => {
  console.log('✅ VoiceMate transcription server running on port 3001');
});
