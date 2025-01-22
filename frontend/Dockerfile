# Use Node.js image to run the frontend
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the entire frontend project
COPY . .

# Expose port 3000 (React default)
EXPOSE 3000

# Start the React development server
CMD ["npm", "start"]
