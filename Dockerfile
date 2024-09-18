# Use the official Playwright base image
FROM mcr.microsoft.com/playwright:focal

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of your code
COPY ./src ./src

# Install required Playwright dependencies
RUN npx playwright install-deps

# Install VNC, Xvfb, and Fluxbox
RUN apt-get update && apt-get install -y \
    xvfb \
    x11vnc \
    fluxbox \
    && rm -rf /var/lib/apt/lists/*

# Expose port 5900 for VNC
EXPOSE 5900

# Set environment variables for display
ENV DISPLAY=:99

# Start Xvfb, Fluxbox, and x11vnc, then run Playwright tests
CMD ["sh", "-c", "Xvfb :99 -screen 0 1920x1080x24 & fluxbox & x11vnc -display :99 -forever -passwd vncpassword & npx tsx main.ts"]
