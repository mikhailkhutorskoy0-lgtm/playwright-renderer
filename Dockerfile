# Start with a base that has Node.js installed
FROM node:18-bullseye
# Install system dependencies for Playwright
# These are libraries that Chrome browser needs to run
RUN apt-get update && apt-get install -y \
    # Font libraries
    fonts-liberation \
    # Display server (for browser)
    libnss3 \
    libxss1 \
    libasound2 \
    # Video libraries
    libx11-xcb1 \
    libxtst6 \
    # More browser dependencies
    libgconf-2-4 \
    libdrm2 \
    libgbm1 \
    # Cleanup to save space
    && rm -rf /var/lib/apt/lists/*
# Create a folder for our app
WORKDIR /app
# Copy our shopping list first
COPY package.json ./
# Install all the tools we need
RUN npm install
# Download Chrome browser for Playwright
RUN npx playwright install chromium
# Copy all our code files
COPY . .
# Tell Railway which port to use
EXPOSE 8080
# Start our server
CMD ["node", "server.js"]
