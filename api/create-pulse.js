// create-pulse.js
import fs from 'fs';
import path from 'path';
import express from 'express';

const router = express.Router();

// 🔐 Adjust this to match your production directory:
const PULSE_DIR = path.join('/var/www/myvoicemate.com/public_html/pulses');

router.post('/api/create-pulse', express.json({ limit: '1mb' }), async (req, res) => {
  const { pulseName, htmlContent } = req.body;

  // ✅ Basic validation
  if (!pulseName || !htmlContent) {
    return res.status(400).json({ error: 'Missing pulseName or htmlContent' });
  }

  try {
    const filePath = path.join(PULSE_DIR, `${pulseName}.html`);

    // ✍️ Write the HTML file
    fs.writeFileSync(filePath, htmlContent, 'utf8');

    // 🔗 Build the public URL
    const pulseUrl = `https://myvoicemate.com/pulses/${encodeURIComponent(pulseName)}.html`;

    res.json({ success: true, url: pulseUrl });
  } catch (error) {
    console.error('Failed to create pulse:', error);
    res.status(500).json({ error: 'Server error creating Pulse' });
  }
});

export default router;
