# Use the official Playwright image which has all browser dependencies pre-installed
# This is the EASIEST and most reliable solution!
FROM mcr.microsoft.com/playwright:v1.56.1-jammy

# Install Node.js (Playwright image is based on Ubuntu)
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create a folder for our app
WORKDIR /app

# Copy package.json first (this helps with caching)
COPY package.json ./

# Install all the npm packages we need
RUN npm install

# Copy all our code files
COPY . .

# Tell Railway which port to use
EXPOSE 8080

# Start our server
CMD ["node", "server.js"]
