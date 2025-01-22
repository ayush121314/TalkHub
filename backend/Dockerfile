# Use Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire backend project
COPY . .

# Expose the backend port (e.g., 4040)
EXPOSE 4040

# Start the backend server
CMD ["npm", "start"]
