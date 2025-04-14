# VoiceMate Pulse™ - Whisper Transcription Server

This server handles audio file uploads and returns transcripts using OpenAI Whisper.

## 🔧 Setup for Render

1. **Create a new Web Service** on [Render](https://dashboard.render.com)
2. Use a **Node.js environment**
3. Add the following Build Command:
   ```
   npm install
   ```
4. Add the following Start Command:
   ```
   node transcribe-server.js
   ```
5. In the **Environment Variables**, add:

   | Key            | Value                     |
   |----------------|---------------------------|
   | OPENAI_API_KEY | your-openai-key-here      |

6. Deploy and connect to the endpoint at:
   ```
   https://your-app.onrender.com/transcribe
   ```

Frontend code can POST `audio/webm` as `FormData` to this endpoint.

---

## 🧪 Test Locally

```bash
npm install
node transcribe-server.js
```

Server will run on `http://localhost:3001/transcribe`
