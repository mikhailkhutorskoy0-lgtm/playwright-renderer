/**
 * This module renders HTML slides into video files using Playwright
 */
const playwright = require('playwright');
const fs = require('fs').promises;
const path = require('path');

/**
 * Renders an HTML slide to a video file
 * @param {string} html - The HTML content to render
 * @param {number} duration - How long to record (in seconds)
 * @param {string} outputPath - Where to save the video
 */
async function renderSlideToVideo(html, duration, outputPath) {
  let browser = null;
  let context = null;

  try {
    // Step 1: Launch browser with video recording enabled
    browser = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    // Step 2: Create context with video recording
    context = await browser.newContext({
      recordVideo: {
        dir: path.dirname(outputPath), // Save in same folder
        size: { width: 1920, height: 1080 }
      }
    });

    // Step 3: Open a new page
    const page = await context.newPage();

    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Step 4: Load the HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle' // Wait for everything to load
    });

    // Step 5: Wait for the duration (let animations play)
    // Add 0.5s buffer to ensure all animations complete
    await page.waitForTimeout((duration + 0.5) * 1000);

    // Step 6: Close page and context to finalize video
    await page.close();
    await context.close();

    // Playwright saves with a random name, we need to find it
    const videoDir = path.dirname(outputPath);
    const files = await fs.readdir(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));

    if (!videoFile) {
      throw new Error('Video file not found after recording');
    }

    const tempPath = path.join(videoDir, videoFile);

    // We'll return this and let Railway convert if needed
    // Or you can use ffmpeg here to convert to .mp4
    const finalPath = outputPath.replace('.mp4', '.webm');
    await fs.rename(tempPath, finalPath);
    console.log(`Render complete: ${finalPath}`);
    return finalPath;
  } catch (error) {
    console.error('Error rendering video:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { renderSlideToVideo };
