import express from 'express';
import { FTPClient } from 'basic-ftp';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.post('/api/create-pulse', async (req, res) => {
  const { pulseName, htmlContent } = req.body;

  if (!pulseName || !htmlContent) {
    return res.status(400).json({ error: 'Missing pulseName or htmlContent' });
  }

  try {
    // Save locally to a temp file
    const tempPath = path.join('/tmp', `${pulseName}.html`);
    fs.writeFileSync(tempPath, htmlContent, 'utf8');

    // Connect to FTP and upload to Namecheap
    const client = new FTPClient();
    await client.access({
      host: "ftp.YOURDOMAIN.com",  // <- replace this
      user: "your_ftp_username",
      password: "your_ftp_password",
      secure: false
    });

    await client.ensureDir('public_html/pulses');
    await client.uploadFrom(tempPath, `public_html/pulses/${pulseName}.html`);
    await client.close();

    const pulseUrl = `https://myvoicemate.com/pulses/${encodeURIComponent(pulseName)}.html`;
    res.json({ success: true, url: pulseUrl });

  } catch (err) {
    console.error('Pulse FTP upload error:', err);
    res.status(500).json({ error: 'Failed to create and upload Pulse' });
  }
});

export default router;
