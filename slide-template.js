/**
 * Generates HTML for a slide with animations
 * This is the visual template that gets recorded as video
 */
function generateSlideHTML(slideData, duration) {
  // Extract data from the slide
  const {
    SLIDE_TEXT = "Title",
    SLIDE_BULLETS = [],
    VISUAL_TYPE = "Text_Only",
    VISUAL_DATA = {}
  } = slideData;

  // Calculate animation timings
  // We divide the duration into phases
  const titleDelay = 0.3;    // Title appears at 0.3s
  const bulletDelay = 0.8;   // First bullet at 0.8s
  const bulletGap = 0.4;     // 0.4s between bullets

  // Generate bullet HTML with staggered animations
  const bulletsHTML = SLIDE_BULLETS.map((bullet, index) => {
    const delay = bulletDelay + (index * bulletGap);
    return `
      <li style="animation-delay: ${delay}s;">${bullet}</li>
    `;
  }).join('');

  // Decide if we need to show a chart
  const hasChart = VISUAL_TYPE === "Bar Chart" && Object.keys(VISUAL_DATA).length > 0;

  // Generate chart HTML if needed
  let chartHTML = '';
  if (hasChart) {
    const maxValue = Math.max(...Object.values(VISUAL_DATA));
    const chartBars = Object.entries(VISUAL_DATA).map(([label, value], index) => {
      const height = (value / maxValue) * 100;
      const delay = 1.5 + (index * 0.3);
      return `
        <div class="chart-bar" style="animation-delay: ${delay}s;">
          <div class="bar-fill" style="height: ${height}%;">
            <span class="bar-value">${value}</span>
          </div>
          <span class="bar-label">${label}</span>
        </div>
      `;
    }).join('');
    
    chartHTML = `
      <div class="chart-container">
        <div class="chart">
          ${chartBars}
        </div>
      </div>
    `;
  }

  // Return complete HTML
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920, height=1080">
  <title>Slide</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 1920px;
      height: 1080px;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .slide {
      width: 1600px;
      height: 900px;
      display: flex;
      flex-direction: row;
      gap: 80px;
      padding: 60px;
    }

    /* Left side: Text content */
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    .title {
      font-size: 72px;
      font-weight: 700;
      color: #333;
      opacity: 0;
      animation: fadeIn 0.6s ease-out forwards;
      animation-delay: ${titleDelay}s;
    }

    .bullets {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .bullets li {
      font-size: 36px;
      color: #555;
      padding-left: 40px;
      position: relative;
      opacity: 0;
      animation: fadeIn 0.5s ease-out forwards;
    }

    /* Bullet point decoration */
    .bullets li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #333;
      font-size: 40px;
    }

    /* Right side: Chart (if present) */
    .chart-container {
      flex: 0 0 500px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart {
      width: 100%;
      height: 400px;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      gap: 20px;
      border-bottom: 3px solid #333;
      padding-bottom: 10px;
    }

    .chart-bar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      opacity: 0;
      animation: fadeIn 0.6s ease-out forwards;
    }

    .bar-fill {
      width: 100%;
      background: linear-gradient(180deg, #4A90E2 0%, #357ABD 100%);
      border-radius: 8px 8px 0 0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 10px;
      animation: growUp 0.8s ease-out;
    }

    .bar-value {
      font-size: 28px;
      font-weight: 700;
      color: white;
    }

    .bar-label {
      font-size: 24px;
      color: #555;
      font-weight: 600;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes growUp {
      from {
        height: 0;
      }
      to {
        height: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="content">
      <h1 class="title">${SLIDE_TEXT}</h1>
      <ul class="bullets">
        ${bulletsHTML}
      </ul>
    </div>
    ${chartHTML}
  </div>
</body>
</html>
  `;
}

module.exports = { generateSlideHTML };
