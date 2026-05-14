### BACKEND DOCKER FILE



# # Use Node.js as the base image
# FROM node:18

# # Set the working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the backend code
# COPY . .

# # Expose the correct backend port
# EXPOSE 5002

# # Start the backend server
# # CMD ["npm", "start"]
# CMD ["node", "server.js"]



FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5002
CMD ["node", "server.js"]
