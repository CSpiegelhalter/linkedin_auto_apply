# Use the official Playwright base image
FROM mcr.microsoft.com/playwright:v1.40.1-focal

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Install required Playwright dependencies
RUN npx playwright install-deps

COPY ./src ./src
COPY tsconfig.json ./

# Copy environment variables
COPY .env .env

# Run the build process
RUN npm run build

# Remove source code after build
RUN rm -rf ./src

# Copy the built files
COPY ./dist ./dist

CMD ["npm", "run", "start"]
