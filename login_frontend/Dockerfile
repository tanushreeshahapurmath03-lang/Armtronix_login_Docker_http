### FRONTEND DOCKER FILE


# ===== Stage 1: Build the Vite app =====
FROM node:18 as builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code and build the project
COPY . .
COPY .env .env   
RUN npm run build


# ===== Stage 2: Serve the Vite build using Node.js =====
FROM node:18

# Set working directory
WORKDIR /app

# Install a lightweight static server
RUN npm install -g serve

# Copy the built files from builder
COPY --from=builder /app/dist ./dist

# Expose the port you want (e.g., 5176 or 3000)
EXPOSE 5176

# Command to serve the app
CMD ["serve", "-s", "dist", "-l", "5176"]





# # ===== Build Vite App =====
# FROM node:18-alpine as builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# COPY .env .env            
# RUN npm run build

# # ===== Serve with Nginx =====
# FROM nginx:alpine
# COPY --from=builder /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]


# # ===== Build Vite App =====
# FROM node:18-alpine as builder
# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .
# COPY .env .env
# RUN npm run build

# # ===== Serve with Nginx (HTTPS support) =====
# FROM nginx:alpine

# # Copy frontend build
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Copy custom Nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy SSL certs (mounted by Docker Compose)
# COPY ssl /etc/nginx/ssl

# # Expose HTTPS port
# EXPOSE 443

# CMD ["nginx", "-g", "daemon off;"]
