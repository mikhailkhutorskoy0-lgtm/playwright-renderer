/**
 * Playwright Video Renderer Service
 * This service renders slides into videos using Playwright (for Replit)
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { generateSlideHTML } = require('./slide-template');
const { renderSlideToVideo } = require('./render');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors()); // Enable CORS for Replit frontend
app.use(bodyParser.json({ limit: '50mb' })); // Parse JSON requests

const TEMP_DIR = path.join(__dirname, 'temp');
fs.mkdir(TEMP_DIR, { recursive: true });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Playwright Renderer',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /render - Render a single slide to video
 * Body: {
 *   slideData: { SLIDE_TEXT, SLIDE_BULLETS, etc. },
 *   duration: 5,
 *   slideNumber: 1
 * }
 */
app.post('/render', async (req, res) => {
  const startTime = Date.now();
  let videoPath = null;

  try {
    // Step 1: Extract data from request
    const { slideData, duration, slideNumber = 1 } = req.body;

    if (!slideData) {
      return res.status(400).json({
        error: 'Missing slideData in request body'
      });
    }

    if (!duration || duration <= 0) {
      return res.status(400).json({
        error: 'Invalid duration'
      });
    }

    console.log(`Rendering slide ${slideNumber}, duration: ${duration}s`);

    // Step 2: Generate HTML from slide data
    const html = generateSlideHTML(slideData, duration);

    const videoFileName = `slide_${slideNumber}_${Date.now()}.mp4`;
    videoPath = path.join(TEMP_DIR, videoFileName);

    // Step 3: Render HTML to video
    const finalPath = await renderSlideToVideo(html, duration, videoPath);

    const videoBuffer = await fs.readFile(finalPath);

    const renderTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Render completed in ${renderTime}s`);

    // Step 6: Send video back to client
    res.set({
      'Content-Type': 'video/webm', // or video/mp4 if you convert
      'Content-Length': videoBuffer.length,
      'X-Render-Time': renderTime
    });
    res.send(videoBuffer);

    // Step 7: Cleanup (delete temp file after sending)
    setTimeout(async () => {
      try {
        await fs.unlink(finalPath);
        console.log(`Cleaned up: ${finalPath}`);
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    }, 1000);

  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({
      error: 'Rendering failed',
      message: error.message
    });

    // Cleanup on error
    if (videoPath) {
      try {
        await fs.unlink(videoPath);
      } catch (err) {
        // Ignore cleanup errors
      }
    }
  }
});

/**
 * POST /render-batch - Render multiple slides
 */
app.post('/render-batch', async (req, res) => {
  try {
    const { slides } = req.body; // Array of slide requests

    if (!Array.isArray(slides)) {
      return res.status(400).json({
        error: 'slides must be an array'
      });
    }

    const results = [];

    for (let i = 0; i < slides.length; i++) {
      const { slideData, duration } = slides[i];
      const html = generateSlideHTML(slideData, duration);
      const videoPath = path.join(TEMP_DIR, `batch_${i}_${Date.now()}.mp4`);
      const finalPath = await renderSlideToVideo(html, duration, videoPath);

      const videoBuffer = await fs.readFile(finalPath);

      results.push({
        slideNumber: i + 1,
        video: videoBuffer.toString('base64'), // Base64 encode for JSON
        size: videoBuffer.length
      });

      // Cleanup
      await fs.unlink(finalPath);
    }

    res.json({
      success: true,
      slides: results
    });
  } catch (error) {
    res.status(500).json({
      error: 'Batch rendering failed',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎬 Playwright Renderer running on port ${PORT}`);
});
