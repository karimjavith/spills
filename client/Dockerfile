# client/Dockerfile

# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- run stage ----
FROM nginx:alpine

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Optional: SPA routing support
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# for react-router

# server {
#   listen 80;
#   server_name _;

#   root /usr/share/nginx/html;
#   index index.html;

#   location / {
#     try_files $uri /index.html;
#   }
# }



EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]